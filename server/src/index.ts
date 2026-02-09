import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth';
import playerRoutes from './routes/players';
import eventRoutes from './routes/events';
import pollRoutes from './routes/polls';
import webhookRoutes from './routes/webhook';
import { startReminderCron } from './cron/reminders';

export const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use('/api/webhook', express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/webhook', webhookRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

startReminderCron();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
