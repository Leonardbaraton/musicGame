import express from 'express';
import cors from 'cors';
import pkg from '@prisma/client';
import { randomBytes } from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const { PrismaClient } = pkg;
const app = express();
const PORT = process.env.PORT || 3000;
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Utilitaires - génération de code de room
function generateRoomCode() {
  return randomBytes(3).toString('hex').toUpperCase();
}

app.post('/api/rooms', async (req, res) => {
  try {
    let code = generateRoomCode();
    // On s'assure que le code est unique
    while (await prisma.room.findUnique({ where: { code } })) {
      code = generateRoomCode();
    }
    const room = await prisma.room.create({
      data: { code },
    });
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création de la room' });
  }
});

app.post('/api/rooms/:code/join', async (req, res) => {
  const { code } = req.params;
  const { name, photoUrl } = req.body;

  if (!name) return res.status(400).json({ error: 'Le prénom est requis' });

  try {
    const room = await prisma.room.findUnique({ where: { code } });
    if (!room) return res.status(404).json({ error: 'Room introuvable' });

    const player = await prisma.player.create({
      data: {
        name,
        photoUrl: photoUrl || null,
        roomId: room.id,
      },
    });

    res.json({ room, player });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la jonction' });
  }
});

app.get('/api/rooms/:code/players', async (req, res) => {
  const { code } = req.params;

  try {
    const room = await prisma.room.findUnique({
      where: { code },
      include: {
        players: true,
      },
    });
    
    if (!room) return res.status(404).json({ error: 'Room introuvable' });

    res.json({
      players: room.players,
      isStarted: room.isStarted
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des joueurs' });
  }
});

app.post('/api/rooms/:code/start', async (req, res) => {
  const { code } = req.params;

  try {
    const room = await prisma.room.update({
      where: { code },
      data: { isStarted: true }
    });
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: 'Erreur au lancement de la partie' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
