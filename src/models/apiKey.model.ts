import mongoose from 'mongoose';

const apiKeySchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  orgId: { type: String, required: true },
  projectId: { type: String, required: true },
});

export const APIKey = mongoose.model('APIKey', apiKeySchema);
