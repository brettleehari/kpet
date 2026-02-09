import cron from 'node-cron';
import { checkAndSendReminders } from '../services/reminder';

export function startReminderCron(): void {
  // Run every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    console.log('[Cron] Checking for pending reminders...');
    try {
      await checkAndSendReminders();
    } catch (error) {
      console.error('[Cron] Reminder check failed:', error);
    }
  });

  console.log('[Cron] Reminder job scheduled (every 15 minutes)');
}
