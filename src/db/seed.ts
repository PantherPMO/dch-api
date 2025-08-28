import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import Exhibition from '../models/Exhibition';
import Artifact from '../models/Artifact';
import connectDB from './index';

const seedDatabase = async () => {
  try {
    await connectDB();

    const filePath = path.join(__dirname, '../utils/sample.json');
    const sampleData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    const transformDocument = (doc: any) => {
      const newDoc: { [key: string]: any } = {};
      for (const key in doc) {
        if (Object.prototype.hasOwnProperty.call(doc, key)) {
          const value = doc[key];
          if (value && typeof value === 'object') {
            if (value['$oid']) {
              newDoc[key] = value['$oid'];
            } else if (value['$date']) {
              newDoc[key] = new Date(value['$date']);
            } else {
              newDoc[key] = value;
            }
          } else {
            newDoc[key] = value;
          }
        }
      }
      return newDoc;
    };

    for (const modelData of sampleData) {
      const { model, documents } = modelData;
      const transformedDocuments = documents.map(transformDocument);

      if (model === 'Exhibition') {
        console.log('Seeding Exhibitions...');
        await Exhibition.deleteMany({});
        await Exhibition.insertMany(transformedDocuments);
        console.log('Exhibitions seeded successfully.');
      } else if (model === 'Artifact') {
        console.log('Seeding Artifacts...');
        await Artifact.deleteMany({});
        await Artifact.insertMany(transformedDocuments);
        console.log('Artifacts seeded successfully.');
      }
    }

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
};

seedDatabase();
