import { prisma } from '../index';
import { sendWhatsApp } from './whatsapp';

export async function checkAndSendReminders(): Promise<void> {
  const now = new Date();

  // Find polls with upcoming events where polls have been sent
  const polls = await prisma.poll.findMany({
    where: {
      pollsSent: true,
      event: {
        dateTime: { gt: now },
      },
    },
    include: {
      event: true,
      responses: true,
    },
  });

  for (const poll of polls) {
    const eventTime = new Date(poll.event.dateTime).getTime();
    const hoursUntilEvent = (eventTime - now.getTime()) / (1000 * 60 * 60);

    // Check each reminder threshold
    for (let i = 0; i < poll.reminderHours.length; i++) {
      const threshold = poll.reminderHours[i];
      // If we've passed this threshold and haven't sent this reminder yet
      if (hoursUntilEvent <= threshold && poll.remindersSent <= i) {
        await sendReminderForPoll(poll.id, poll.event.teamId, poll.event.id);
        await prisma.poll.update({
          where: { id: poll.id },
          data: { remindersSent: i + 1 },
        });
        break; // Only send one reminder at a time
      }
    }
  }
}

async function sendReminderForPoll(
  pollId: string,
  teamId: string,
  eventId: string
): Promise<void> {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) return;

  // Get all active players who haven't responded
  const respondedPlayerIds = await prisma.pollResponse.findMany({
    where: { pollId },
    select: { playerId: true },
  });
  const respondedIds = new Set(respondedPlayerIds.map((r) => r.playerId));

  const nonResponders = await prisma.player.findMany({
    where: { teamId, active: true },
  });

  const playersToRemind = nonResponders.filter((p) => !respondedIds.has(p.id));

  if (playersToRemind.length === 0) return;

  const date = new Date(event.dateTime).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const typeLabel = event.type === 'MATCH' ? `Match vs ${event.opponent || 'TBD'}` : 'Training';
  const message = `Reminder: We still need your availability!\n\n${typeLabel}\n${date}\nVenue: ${event.venue}\n\nReply:\n1 - Available\n2 - Not Available\n3 - Maybe`;

  for (const player of playersToRemind) {
    const result = await sendWhatsApp(player.whatsapp, message);
    await prisma.messageLog.create({
      data: {
        pollId,
        playerId: player.id,
        direction: 'OUTBOUND',
        type: 'REMINDER',
        body: message,
        status: result.success ? 'sent' : 'failed',
        twilioSid: result.sid,
      },
    });
  }
}
