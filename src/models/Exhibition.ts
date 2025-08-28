import mongoose, { Schema, Document } from 'mongoose';

export interface IExhibition extends Document {
  slug: string;
  title: string;
  description: string;
  shortDescription: string;
  image: string;
  category: string;
  status: 'Current' | 'Coming Soon' | 'Past';
  duration: string;
  artifacts: number;
  startDate: Date;
  featured: boolean;
}

const ExhibitionSchema: Schema = new Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  shortDescription: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  status: { type: String, enum: ['Current', 'Coming Soon', 'Past'], required: true },
  duration: { type: String, required: true },
  artifacts: { type: Number, required: true },
  startDate: { type: Date, required: true },
  featured: { type: Boolean, default: false },
});

export default mongoose.model<IExhibition>('Exhibition', ExhibitionSchema);
