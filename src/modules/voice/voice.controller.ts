import { Context } from 'hono';
import Exhibition from '../../models/Exhibition';
import Artifact from '../../models/Artifact';
import { GoogleGenAI, HarmCategory } from '@google/genai';

// Initialize Gemini client
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

// Function to call Gemini LLM
const callGeminiLLM = async (transcript: string): Promise<{ intent: string; entities: any; message?: string }> => {
  const prompt = `Analyze the following user voice command and extract the primary intent and any relevant entities.

If the command is out of context for a digital museum platform (i.e., not related to searching exhibitions, artifacts, navigating the platform, or asking about the website itself), set the intent to \"none\" and provide a brief, helpful message explaining the platform's purpose and how to use voice commands for navigation and search.

Possible intents:
- \"search_exhibition\": User wants to find an exhibition.
- \"search_artifact\": User wants to find an artifact.
- \"search_artifact_by_exhibition\": User wants to find artifacts within a specific exhibition.
- \"navigate\": User wants to go to a specific page.
- \"scroll\": User wants to scroll the page.
- \"about_website\": User wants information about the website.
- \"answer_history_question\": User is asking a general history question.
- \"none\": If the intent is unclear or the command is not related to the museum, or if the question is not understood.

Relevant entities:
- \"query\": The search term for exhibitions or artifacts. This should be a concise string.
- \"page\": The name of the page to navigate to (e.g., \"home\", \"explore\", \"exhibitions\", \"about\", \"ethics\", \"back\", \"forward\").
- \"direction\": \"down\" or \"up\" for scrolling.
- \"exhibitionName\": The name of the exhibition when searching for artifacts by exhibition. This should be a concise string.

Output format: JSON object with \"intent\" and \"entities\" (an object containing extracted entities). If intent is \"none\", entities should be an empty object {} and include a \"message\" field with the helpful explanation. If the question is not understood, respond with a message indicating that.

Examples:
User: \"Find exhibition about ancient Egypt\"
Output: { \"intent\": \"search_exhibition\", \"entities\": { \"query\": \"ancient Egypt\" } }

User: \"Show me artifacts from the Roman Empire exhibition\"
Output: { \"intent\": \"search_artifact_by_exhibition\", \"entities\": { \"exhibitionName\": \"Roman Empire\" } }

User: \"Go to explore\"
Output: { \"intent\": \"navigate\", \"entities\": { \"page\": \"explore\" } }

User: \"Scroll down\"
Output: { \"intent\": \"scroll\", \"entities\": { \"direction\": \"down\" } }

User: \"Tell me about this website\"
Output: { \"intent\": \"about_website\", \"entities\": {} }

User: \"What is the weather like?\"
Output: { \"intent\": \"none\", \"entities\": {}, \"message\": \"I am a voice assistant for the Digital Cultural Heritage Museum. I can help you find exhibitions and artifacts, or navigate the platform. Try commands like 'Find exhibition about ancient Egypt' or 'Go to explore'.\" }

User: \"Find artifacts about Tutankhamun\"
Output: { \"intent\": \"search_artifact\", \"entities\": { \"query\": \"Tutankhamun\" } }

User: \"Who was Cleopatra?\"
Output: { \"intent\": \"answer_history_question\", \"entities\": { \"query\": \"Cleopatra\" } }

User command: "${transcript}"
Output:

`; // End of prompt string

  try {
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ text: prompt }]
    });
    const responseText = result.text || '';
    const cleanedResponseText = responseText.replace(/```json\n|```/g, '').trim();
    console.log("LLM Raw Response:", cleanedResponseText);
    // Attempt to parse JSON, handle potential errors
    try {
      const parsedResponse = JSON.parse(cleanedResponseText);
      return parsedResponse;
    } catch (jsonError) {
      console.error("Failed to parse LLM response as JSON:", responseText, jsonError);
      return { intent: 'none', entities: {}, message: "I am a voice assistant for the Digital Cultural Heritage Museum. I can help you find exhibitions and artifacts, or navigate the platform. Try commands like 'Find exhibition about ancient Egypt' or 'Go to explore'." };
    }
  } catch (error) {
    console.error("Error calling Gemini LLM:", error);
    return { intent: 'none', entities: {}, message: "I am a voice assistant for the Digital Cultural Heritage Museum. I can help you find exhibitions and artifacts, or navigate the platform. Try commands like 'Find exhibition about ancient Egypt' or 'Go to explore'." };
  }
};

export const processVoiceCommand = async (c: Context) => {
  try {
    const { transcript } = await c.req.json();

    if (!transcript) {
      return c.json({ action: 'toast', title: 'Voice Command Error', description: 'No transcript received.' }, 400);
    }

    const llmResponse = await callGeminiLLM(transcript);
    const { intent, entities } = llmResponse;

    let response = {};
    let query = entities.query || '';
    const period = entities.period || '';
    const culture = entities.culture || '';

    switch (intent) {
      case 'search_exhibition':
        const exhibitionQuery: any = {};
        if (query) {
          exhibitionQuery.$or = [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { shortDescription: { $regex: query, $options: 'i' } },
            { category: { $regex: query, $options: 'i' } },
          ];
        }
        if (period) {
          exhibitionQuery.period = { $regex: period, $options: 'i' };
        }
        if (culture) {
          exhibitionQuery.culture = { $regex: culture, $options: 'i' };
        }

        const exhibitions = await Exhibition.find(exhibitionQuery);
        response = {
          action: 'exhibition_results',
          query: query,
          resultsCount: exhibitions.length,
          message: exhibitions.length > 0 ? `Found ${exhibitions.length} exhibitions matching '${query}'.` : `No exhibitions found matching '${query}'.`,
        };
        break;
      case 'search_artifact':
        const artifactQuery: any = {};
        if (query) {
          artifactQuery.$or = [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { culture: { $regex: query, $options: 'i' } },
            { period: { $regex: query, $options: 'i' } },
          ];
        }
        if (period) {
          artifactQuery.period = { $regex: period, $options: 'i' };
        }
        if (culture) {
          artifactQuery.culture = { $regex: culture, $options: 'i' };
        }

        const artifacts = await Artifact.find(artifactQuery);
        response = {
          action: 'artifact_results',
          query: query,
          resultsCount: artifacts.length,
          message: artifacts.length > 0 ? `Found ${artifacts.length} artifacts matching '${query}'.` : `No artifacts found matching '${query}'.`,
        };
        break;
      case 'search_artifact_by_exhibition':
        const exhibition = await Exhibition.findOne({ title: { $regex: entities.exhibitionName, $options: 'i' } });
        if (exhibition) {
          const artifactsByExhibition = await Artifact.find({ exhibition: exhibition._id });
          response = {
            action: 'artifact_results',
            query: entities.exhibitionName,
            resultsCount: artifactsByExhibition.length,
            message: artifactsByExhibition.length > 0 ? `Found ${artifactsByExhibition.length} artifacts from the ${exhibition.title} exhibition.` : `No artifacts found from the ${exhibition.title} exhibition.`,
          };
        } else {
          response = {
            action: 'toast',
            title: 'Exhibition Not Found',
            description: `Could not find an exhibition named '${entities.exhibitionName}'.`,
          };
        }
        break;
      case 'view_exhibition_details':
        if (entities.slug) {
          const exhibition = await Exhibition.findOne({ slug: entities.slug });
          if (exhibition) {
            response = {
              action: 'navigate',
              value: `/exhibitions/${exhibition.slug}`,
            };
          } else {
            response = {
              action: 'toast',
              title: 'Exhibition Not Found',
              description: `Could not find an exhibition with slug '${entities.slug}'.`,
            };
          }
        } else if (entities.query) {
          const exhibition = await Exhibition.findOne({ title: { $regex: entities.query, $options: 'i' } });
          if (exhibition) {
            response = {
              action: 'navigate',
              value: `/exhibitions/${exhibition.slug}`,
            };
          } else {
            response = {
              action: 'toast',
              title: 'Exhibition Not Found',
              description: `Could not find an exhibition named '${entities.query}'.`,
            };
          }
        } else {
          response = {
            action: 'toast',
            title: 'Missing Information',
            description: 'Please specify which exhibition you would like to view.',
          };
        }
        break;
      case 'view_artifact_details':
        if (entities._id) {
          const artifact = await Artifact.findById(entities._id);
          if (artifact) {
            response = {
              action: 'navigate',
              value: `/explore/${artifact._id}`,
            };
          } else {
            response = {
              action: 'toast',
              title: 'Artifact Not Found',
              description: `Could not find an artifact with ID '${entities._id}'.`,
            };
          }
        } else if (entities.query) {
          const artifact = await Artifact.findOne({ title: { $regex: entities.query, $options: 'i' } });
          if (artifact) {
            response = {
              action: 'navigate',
              value: `/explore/${artifact._id}`,
            };
          } else {
            response = {
              action: 'toast',
              title: 'Artifact Not Found',
              description: `Could not find an artifact named '${entities.query}'.`,
            };
          }
        } else {
          response = {
            action: 'toast',
            title: 'Missing Information',
            description: 'Please specify which artifact you would like to view.',
          };
        }
        break;
      case 'navigate':
        response = {
          action: 'navigate',
          value: entities.page === '-1' ? -1 : (entities.page === '1' ? 1 : `/${entities.page}`),
        };
        break;
      case 'scroll':
        response = {
          action: 'scroll',
          value: entities.direction,
        };
        break;
      case 'about_website':
        response = {
          action: 'toast',
          title: 'About the Digital Cultural Heritage Museum',
          description: 'This is a modern, voice-controlled digital museum designed to make cultural heritage accessible to everyone. It leverages cutting-edge web technologies to provide an immersive and inclusive experience for exploring artifacts and exhibitions.',
        };
        break;
      case 'answer_history_question':
        response = {
          action: 'toast',
          title: 'History Question',
          description: `I can answer general history questions, but I need to be trained on that specific topic. You asked about: ${entities.query || 'a historical topic'}.`,
        };
        break;
      default:
        response = {
          action: 'toast',
          title: 'Voice Command',
          description: llmResponse.message || 'I did not understand your command. Please try again.',
        };
        break;
    }

    return c.json(response);
  } catch (err: any) {
    console.error('Error processing voice command:', err);
    return c.json({ message: 'Internal server error' }, 500);
  }
};