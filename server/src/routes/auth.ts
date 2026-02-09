import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../index';
import { generateToken } from '../middleware/auth';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, teamName } = req.body;

    if (!email || !password || !name || !teamName) {
      res.status(400).json({ error: 'email, password, name, and teamName are required' });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const team = await prisma.team.create({
      data: { name: teamName },
    });

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        teamId: team.id,
      },
    });

    const token = generateToken({ userId: user.id, teamId: team.id });

    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
      team: { id: team.id, name: team.name },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'email and password are required' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { team: true },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = generateToken({ userId: user.id, teamId: user.teamId });

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
      team: { id: user.team.id, name: user.team.name },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
