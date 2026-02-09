import { Router } from 'express';
import { prisma } from '../index';
import { authMiddleware } from '../middleware/auth';
import { sendPollToPlayers } from '../services/poll';

const router = Router();
router.use(authMiddleware);

// Get poll with responses and readiness status
router.get('/:eventId', async (req, res) => {
  const eventId = req.params.eventId as string;
  const event = await prisma.event.findFirst({
    where: { id: eventId, teamId: req.user!.teamId },
  });

  if (!event) {
    res.status(404).json({ error: 'Event not found' });
    return;
  }

  const poll = await prisma.poll.findUnique({
    where: { eventId },
    include: {
      responses: {
        include: { player: true },
      },
    },
  });

  if (!poll) {
    res.status(404).json({ error: 'Poll not found' });
    return;
  }

  const totalActive = await prisma.player.count({
    where: { teamId: req.user!.teamId, active: true },
  });

  const available = poll.responses.filter((r) => r.response === 'AVAILABLE').length;
  const notAvailable = poll.responses.filter((r) => r.response === 'NOT_AVAILABLE').length;
  const maybe = poll.responses.filter((r) => r.response === 'MAYBE').length;
  const noResponse = totalActive - poll.responses.length;

  let readiness: 'READY' | 'AT_RISK' | 'NOT_READY';
  if (available >= event.requiredPlayers) {
    readiness = 'READY';
  } else if (available + maybe >= event.requiredPlayers - 2) {
    readiness = 'AT_RISK';
  } else {
    readiness = 'NOT_READY';
  }

  res.json({
    poll,
    summary: {
      available,
      notAvailable,
      maybe,
      noResponse,
      totalPlayers: totalActive,
      requiredPlayers: event.requiredPlayers,
      readiness,
    },
  });
});

// Manually trigger poll send
router.post('/:eventId/send', async (req, res) => {
  try {
    const eventId = req.params.eventId as string;
    const event = await prisma.event.findFirst({
      where: { id: eventId, teamId: req.user!.teamId },
    });

    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    const poll = await prisma.poll.findUnique({
      where: { eventId },
    });

    if (!poll) {
      res.status(404).json({ error: 'Poll not found' });
      return;
    }

    const pollWithEvent = { ...poll, event };
    await sendPollToPlayers(pollWithEvent);

    res.json({ message: 'Polls sent successfully' });
  } catch (error) {
    console.error('Send poll error:', error);
    res.status(500).json({ error: 'Failed to send polls' });
  }
});

export default router;
