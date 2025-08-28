import mongoose, { Schema, Document } from 'mongoose';

export interface IArtifact extends Document {
  title: string;
  culture: string;
  period: string;
  location: string;
  description: string;
  materials: string[];
  image: string;
  featured: boolean;
  exhibition: mongoose.Types.ObjectId;
}

const ArtifactSchema: Schema = new Schema({
  title: { type: String, required: true },
  culture: { type: String, required: true },
  period: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  materials: [{ type: String }],
  image: { type: String, required: true },
  featured: { type: Boolean, default: false },
  exhibition: { type: Schema.Types.ObjectId, ref: 'Exhibition', required: true },
});

export default mongoose.model<IArtifact>('Artifact', ArtifactSchema);
