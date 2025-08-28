import { Context } from 'hono';
import Exhibition from '../../models/Exhibition';
import Artifact from '../../models/Artifact';

export const getExhibitions = async (c: Context) => {
  try {
    const exhibitions = await Exhibition.find();
    return c.json(exhibitions);
  } catch (err: any) {
    return c.json({ message: err.message }, 500);
  }
};

export const getExhibitionBySlug = async (c: Context) => {
  try {
    const exhibition = await Exhibition.findOne({ slug: c.req.param('slug') });
    if (!exhibition) {
      return c.json({ message: 'Exhibition not found' }, 404);
    }
    return c.json(exhibition);
  } catch (err: any) {
    return c.json({ message: err.message }, 500);
  }
};

export const getArtifactsByExhibitionSlug = async (c: Context) => {
  try {
    const exhibition = await Exhibition.findOne({ slug: c.req.param('slug') });
    if (!exhibition) {
      return c.json({ message: 'Exhibition not found' }, 404);
    }
    const artifacts = await Artifact.find({ exhibition: exhibition._id });
    return c.json(artifacts);
  } catch (err: any) {
    return c.json({ message: err.message }, 500);
  }
};
