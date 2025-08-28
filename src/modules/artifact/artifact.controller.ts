import { Context } from 'hono';
import Artifact from '../../models/Artifact';

export const getArtifacts = async (c: Context) => {
  try {
    const artifacts = await Artifact.find().populate('exhibition');
    return c.json(artifacts);
  } catch (err: any) {
    return c.json({ message: err.message }, 500);
  }
};

export const getArtifactById = async (c: Context) => {
  try {
    const artifact = await Artifact.findById(c.req.param('id')).populate('exhibition');
    if (!artifact) {
      return c.json({ message: 'Artifact not found' }, 404);
    }
    return c.json(artifact);
  } catch (err: any) {
    return c.json({ message: err.message }, 500);
  }
};
