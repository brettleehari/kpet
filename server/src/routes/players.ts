import { Router } from 'express';
import multer from 'multer';
import { prisma } from '../index';
import { authMiddleware } from '../middleware/auth';
import { parseCsv } from '../utils/csv';
import { PlayerRole } from '@prisma/client';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authMiddleware);

// List active players
router.get('/', async (req, res) => {
  const players = await prisma.player.findMany({
    where: { teamId: req.user!.teamId, active: true },
    orderBy: { name: 'asc' },
  });
  res.json(players);
});

// Create player
router.post('/', async (req, res) => {
  try {
    const { name, whatsapp, role, location } = req.body;
    if (!name || !whatsapp || !role) {
      res.status(400).json({ error: 'name, whatsapp, and role are required' });
      return;
    }

    const player = await prisma.player.create({
      data: {
        name,
        whatsapp,
        role: role as PlayerRole,
        location: location || '',
        teamId: req.user!.teamId,
      },
    });
    res.status(201).json(player);
  } catch (error) {
    console.error('Create player error:', error);
    res.status(500).json({ error: 'Failed to create player' });
  }
});

// Update player
router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id as string;
    const { name, whatsapp, role, location } = req.body;
    const player = await prisma.player.updateMany({
      where: { id, teamId: req.user!.teamId },
      data: { name, whatsapp, role: role as PlayerRole, location },
    });

    if (player.count === 0) {
      res.status(404).json({ error: 'Player not found' });
      return;
    }

    const updated = await prisma.player.findUnique({ where: { id } });
    res.json(updated);
  } catch (error) {
    console.error('Update player error:', error);
    res.status(500).json({ error: 'Failed to update player' });
  }
});

// Deactivate player
router.patch('/:id/deactivate', async (req, res) => {
  try {
    const id = req.params.id as string;
    const result = await prisma.player.updateMany({
      where: { id, teamId: req.user!.teamId },
      data: { active: false },
    });

    if (result.count === 0) {
      res.status(404).json({ error: 'Player not found' });
      return;
    }

    res.json({ message: 'Player deactivated' });
  } catch (error) {
    console.error('Deactivate player error:', error);
    res.status(500).json({ error: 'Failed to deactivate player' });
  }
});

// CSV import
router.post('/import', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'CSV file is required' });
      return;
    }

    const rows = parseCsv(req.file.buffer);
    const players = await prisma.player.createMany({
      data: rows.map((row) => ({
        name: row.name,
        whatsapp: row.whatsapp,
        role: row.role as PlayerRole,
        location: row.location,
        teamId: req.user!.teamId,
      })),
    });

    res.status(201).json({ imported: players.count });
  } catch (error: any) {
    console.error('CSV import error:', error);
    res.status(400).json({ error: error.message || 'CSV import failed' });
  }
});

export default router;
