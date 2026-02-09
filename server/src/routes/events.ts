import { Router } from 'express';
import { prisma } from '../index';
import { authMiddleware } from '../middleware/auth';
import { sendPollToPlayers } from '../services/poll';

const router = Router();
router.use(authMiddleware);

// List events (upcoming first)
router.get('/', async (req, res) => {
  const events = await prisma.event.findMany({
    where: { teamId: req.user!.teamId },
    include: {
      poll: {
        include: {
          responses: true,
        },
      },
    },
    orderBy: { dateTime: 'asc' },
  });
  res.json(events);
});

// Create event + auto-create poll + send WhatsApp polls
router.post('/', async (req, res) => {
  try {
    const { type, opponent, venue, dateTime, requiredPlayers } = req.body;
    if (!type || !venue || !dateTime) {
      res.status(400).json({ error: 'type, venue, and dateTime are required' });
      return;
    }

    const event = await prisma.event.create({
      data: {
        type,
        opponent: opponent || null,
        venue,
        dateTime: new Date(dateTime),
        requiredPlayers: requiredPlayers || 11,
        teamId: req.user!.teamId,
        poll: {
          create: {},
        },
      },
      include: {
        poll: true,
      },
    });

    // Send polls asynchronously
    if (event.poll) {
      const pollWithEvent = { ...event.poll, event };
      sendPollToPlayers(pollWithEvent).catch((err) =>
        console.error('Failed to send polls:', err)
      );
    }

    res.status(201).json(event);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Get event detail with poll responses
router.get('/:id', async (req, res) => {
  const id = req.params.id as string;
  const event = await prisma.event.findFirst({
    where: { id, teamId: req.user!.teamId },
    include: {
      poll: {
        include: {
          responses: {
            include: { player: true },
          },
        },
      },
    },
  });

  if (!event) {
    res.status(404).json({ error: 'Event not found' });
    return;
  }

  res.json(event);
});

// Update event
router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id as string;
    const { type, opponent, venue, dateTime, requiredPlayers } = req.body;
    const result = await prisma.event.updateMany({
      where: { id, teamId: req.user!.teamId },
      data: {
        type,
        opponent,
        venue,
        dateTime: dateTime ? new Date(dateTime) : undefined,
        requiredPlayers,
      },
    });

    if (result.count === 0) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    const updated = await prisma.event.findUnique({
      where: { id },
      include: { poll: { include: { responses: true } } },
    });
    res.json(updated);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete event
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id as string;
    const result = await prisma.event.deleteMany({
      where: { id, teamId: req.user!.teamId },
    });

    if (result.count === 0) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    res.json({ message: 'Event deleted' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

export default router;
