import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Event } from '../models/event.model';

dotenv.config();

const orgId = 'org123';
const projectId = 'projA';
const userIds = ['user1', 'user2', 'user3', 'user4', 'user5'];
const eventNames = ['signup', 'view_product', 'purchase'];

const today = new Date();
today.setUTCHours(0, 0, 0, 0);

const daysAgo = (n: number) => new Date(today.getTime() - n * 86400000);

const seedEvents = async () => {
  await mongoose.connect(process.env.MONGODB_URI || '');

  await Event.deleteMany({});

  const events = [];

  for (let i = 0; i < 5; i++) {
    const userId = userIds[i];

    for (let d = 0; d < 5; d++) {
      const baseDate = daysAgo(d);
      events.push({
        userId,
        eventName: 'signup',
        timestamp: new Date(baseDate.getTime() + 1000 * 60 * 60),
        orgId,
        projectId,
      });

      if (d % 2 === 0) {
        events.push({
          userId,
          eventName: 'view_product',
          timestamp: new Date(baseDate.getTime() + 1000 * 60 * 60 * 2),
          orgId,
          projectId,
        });
      }

      if (i % 2 === 0 && d === 2) {
        events.push({
          userId,
          eventName: 'purchase',
          timestamp: new Date(baseDate.getTime() + 1000 * 60 * 60 * 3),
          orgId,
          projectId,
        });
      }
    }
  }

  await Event.insertMany(events);
  console.log(`✅ Seeded ${events.length} demo events.`);
  process.exit(0);
};

seedEvents().catch(err => {
  console.error('Error seeding events:', err);
  process.exit(1);
});
