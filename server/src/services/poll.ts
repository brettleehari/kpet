import { prisma } from '../index';
import { sendWhatsApp } from './whatsapp';
import { Event, Poll, Player } from '@prisma/client';

function formatEventMessage(event: Event): string {
  const date = new Date(event.dateTime).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const typeLabel = event.type === 'MATCH' ? `Match vs ${event.opponent || 'TBD'}` : 'Training';
  return `${typeLabel}\n${date}\nVenue: ${event.venue}`;
}

export async function sendPollToPlayers(poll: Poll & { event: Event }): Promise<void> {
  const players = await prisma.player.findMany({
    where: { teamId: poll.event.teamId, active: true },
  });

  const eventInfo = formatEventMessage(poll.event);
  const message = `Availability Poll:\n\n${eventInfo}\n\nReply with:\n1 - Available\n2 - Not Available\n3 - Maybe`;

  for (const player of players) {
    const result = await sendWhatsApp(player.whatsapp, message);
    await prisma.messageLog.create({
      data: {
        pollId: poll.id,
        playerId: player.id,
        direction: 'OUTBOUND',
        type: 'POLL',
        body: message,
        status: result.success ? 'sent' : 'failed',
        twilioSid: result.sid,
      },
    });
  }

  await prisma.poll.update({
    where: { id: poll.id },
    data: { pollsSent: true },
  });
}

export async function processInboundResponse(
  fromNumber: string,
  body: string
): Promise<string> {
  const normalizedPhone = fromNumber.replace('whatsapp:', '');

  const player = await prisma.player.findFirst({
    where: { whatsapp: normalizedPhone, active: true },
  });

  if (!player) {
    return 'Sorry, your number is not registered with any team.';
  }

  // Find the most recent open poll for this player's team
  const poll = await prisma.poll.findFirst({
    where: {
      event: {
        teamId: player.teamId,
        dateTime: { gt: new Date() },
      },
      pollsSent: true,
    },
    include: { event: true },
    orderBy: { createdAt: 'desc' },
  });

  if (!poll) {
    return 'No active polls found for your team.';
  }

  const trimmed = body.trim();
  let response: 'AVAILABLE' | 'NOT_AVAILABLE' | 'MAYBE';
  if (trimmed === '1' || trimmed.toLowerCase() === 'yes' || trimmed.toLowerCase() === 'available') {
    response = 'AVAILABLE';
  } else if (trimmed === '2' || trimmed.toLowerCase() === 'no' || trimmed.toLowerCase() === 'not available') {
    response = 'NOT_AVAILABLE';
  } else if (trimmed === '3' || trimmed.toLowerCase() === 'maybe') {
    response = 'MAYBE';
  } else {
    return 'Invalid response. Please reply:\n1 - Available\n2 - Not Available\n3 - Maybe';
  }

  await prisma.pollResponse.upsert({
    where: { pollId_playerId: { pollId: poll.id, playerId: player.id } },
    update: { response },
    create: { pollId: poll.id, playerId: player.id, response },
  });

  // Log inbound
  await prisma.messageLog.create({
    data: {
      pollId: poll.id,
      playerId: player.id,
      direction: 'INBOUND',
      type: 'POLL',
      body: trimmed,
      status: 'received',
    },
  });

  const eventInfo = formatEventMessage(poll.event);
  const responseLabel = response === 'AVAILABLE' ? 'Available' : response === 'NOT_AVAILABLE' ? 'Not Available' : 'Maybe';
  const confirmMessage = `Thanks ${player.name}! You responded "${responseLabel}" for:\n${eventInfo}`;

  // Send confirmation
  const sendResult = await sendWhatsApp(player.whatsapp, confirmMessage);
  await prisma.messageLog.create({
    data: {
      pollId: poll.id,
      playerId: player.id,
      direction: 'OUTBOUND',
      type: 'CONFIRMATION',
      body: confirmMessage,
      status: sendResult.success ? 'sent' : 'failed',
      twilioSid: sendResult.sid,
    },
  });

  return confirmMessage;
}
