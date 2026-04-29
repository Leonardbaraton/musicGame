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

import { getGroupData } from './index.js';

app.get('/api/rooms/:code/game', async (req, res) => {
  const { code } = req.params;
  try {
    const room = await prisma.room.findUnique({ where: { code } });
    res.json({
      hasTarget: !!room.targetData,
      hostId: room.hostId,
      guesses: JSON.parse(room.guesses || '[]'),
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur' });
  }
});

app.post('/api/rooms/:code/set-target', async (req, res) => {
  const { code } = req.params;
  const { groupName, playerId } = req.body;
  try {
    const targetData = await getGroupData(groupName);
    if (!targetData.name) return res.status(404).json({ error: 'Groupe introuvable' });

    const room = await prisma.room.update({
      where: { code },
      data: {
        hostId: playerId,
        targetData: JSON.stringify(targetData),
        guesses: '[]',
      }
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Erreur dans /set-target:", error);
    res.status(500).json({ error: 'Erreur lors de la configuration' });
  }
});

app.post('/api/rooms/:code/guess', async (req, res) => {
  const { code } = req.params;
  const { groupName, playerId } = req.body;
  try {
    const room = await prisma.room.findUnique({ where: { code } });
    if (!room.targetData) return res.status(400).json({ error: 'Pas de cible définie' });

    const target = JSON.parse(room.targetData);
    const guess = await getGroupData(groupName);
    if (!guess.name) return res.status(404).json({ error: 'Groupe introuvable' });

    // Comparaison
    let isWin = guess.name.toLowerCase() === target.name.toLowerCase();

    const result = {
      playerId,
      name: guess.name,
      isWin,
      nameColor: isWin ? 'green' : 'red',
      country: guess.country || 'Inconnu',
      countryColor: guess.country === target.country ? 'green' : 'red',
      
      year: guess.creation_year || 'Inconnu',
      yearColor: guess.creation_year == target.creation_year ? 'green' :
                 (Math.abs(guess.creation_year - target.creation_year) <= 5 ? 'yellow' : 'red'),
      yearDir: guess.creation_year > target.creation_year ? '-' :
               (guess.creation_year < target.creation_year ? '+' : '='),
               
      members: guess.member_count !== null ? guess.member_count : 'Inconnu',
      membersColor: guess.member_count === target.member_count ? 'green' : 'red',
      membersDir: guess.member_count > target.member_count ? '-' :
                  (guess.member_count < target.member_count ? '+' : '='),
                  
      genres: guess.genres.join(', ') || 'Inconnu',
      genresColor: guess.genres.length && target.genres.length && guess.genres.some(g => target.genres.includes(g))
                   ? (guess.genres.every(g => target.genres.includes(g)) ? 'green' : 'yellow') : 'red',
                   
      popularity: guess.popularity || 'Inconnu',
      popColor: guess.popularity == target.popularity ? 'green' :
                (Math.abs(guess.popularity - target.popularity) <= 10 ? 'yellow' : 'red'),
      popDir: guess.popularity > target.popularity ? '-' :
               (guess.popularity < target.popularity ? '+' : '=')
    };

    const guesses = JSON.parse(room.guesses || '[]');
    guesses.push(result);

    await prisma.room.update({
      where: { code },
      data: { guesses: JSON.stringify(guesses) }
    });

    res.json({ success: true, isWin });
  } catch (error) {
    console.error("Erreur dans /guess:", error);
    res.status(500).json({ error: 'Erreur pendant le coup' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
