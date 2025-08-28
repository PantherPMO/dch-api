import { Hono } from 'hono';
import { getArtifacts, getArtifactById } from './artifact.controller';

const artifactRoutes = new Hono();

artifactRoutes.get('/', getArtifacts);
artifactRoutes.get('/:id', getArtifactById);

export default artifactRoutes;
