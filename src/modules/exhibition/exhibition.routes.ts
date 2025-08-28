import { Hono } from 'hono';
import { getExhibitions, getExhibitionBySlug, getArtifactsByExhibitionSlug } from './exhibition.controller';

const exhibitionRoutes = new Hono();

exhibitionRoutes.get('/', getExhibitions);
exhibitionRoutes.get('/:slug', getExhibitionBySlug);
exhibitionRoutes.get('/:slug/artifacts', getArtifactsByExhibitionSlug);

export default exhibitionRoutes;
