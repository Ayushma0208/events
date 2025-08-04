import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  eventName: { type: String, required: true },
  properties: { type: Object, default: {} },
  timestamp: { type: Date, default: Date.now },
  orgId: { type: String, required: true },
  projectId: { type: String, required: true },
});

export const Event = mongoose.model('Event', eventSchema);
