import { Hono } from 'hono';
import { processVoiceCommand } from './voice.controller';

const voiceRoutes = new Hono();

voiceRoutes.post('/command', processVoiceCommand);

export default voiceRoutes;