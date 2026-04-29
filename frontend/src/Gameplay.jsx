import { useState, useEffect } from 'react';

function Gameplay({ room, player, onLeave }) {
  const [gameState, setGameState] = useState({ hasTarget: false, hostId: null, guesses: [] });
  const [targetGroup, setTargetGroup] = useState('');
  const [guessInput, setGuessInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchGameState = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/rooms/${room.code}/game`);
      const data = await res.json();
      setGameState(data);
    } catch (err) {
      setError('Erreur de réseau');
    }
  };

  useEffect(() => {
    fetchGameState();
    const interval = setInterval(fetchGameState, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSetTarget = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/rooms/${room.code}/set-target`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupName: targetGroup, playerId: player.id })
      });
      if (!res.ok) throw new Error('Impossible de trouver ce groupe');
      fetchGameState();
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  const handleGuess = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/rooms/${room.code}/guess`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupName: guessInput, playerId: player.id })
      });
      if (!res.ok) throw new Error('Groupe introuvable ou erreur');
      setGuessInput('');
      fetchGameState();
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  const isHost = gameState.hostId === player.id;
  const hasWon = gameState.guesses.some(g => g.isWin);

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Room {room.code}</h1>
        <button onClick={onLeave} style={{ padding: '8px 16px', background: '#ff4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Quitter</button>
      </div>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {!gameState.hasTarget ? (
        <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
          <h3>Le Maître du Jeu doit choisir un groupe !</h3>
          <p>La première personne à choisir un groupe deviendra le Maître.</p>
          <form onSubmit={handleSetTarget}>
            <input type="text" value={targetGroup} onChange={e => setTargetGroup(e.target.value)} placeholder="Nom du groupe..." style={{ padding: '10px', width: '200px' }} />
            <button type="submit" disabled={loading} style={{ padding: '10px 20px', marginLeft: '10px', cursor: 'pointer' }}>{loading ? 'Recherche...' : 'Valider'}</button>
          </form>
        </div>
      ) : (
        <div>
          {isHost ? (
             <div style={{ background: '#fff3cd', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
               <h3>Vous êtes le Maître du Jeu !</h3>
               <p>Les autres joueurs essaient de deviner le groupe.</p>
             </div>
          ) : (
             <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
               <h3>À vous de deviner !</h3>
               {!hasWon && (
                 <form onSubmit={handleGuess}>
                    <input type="text" value={guessInput} onChange={e => setGuessInput(e.target.value)} placeholder="Tentez un groupe..." style={{ padding: '10px', width: '200px' }} />
                    <button type="submit" disabled={loading} style={{ padding: '10px 20px', marginLeft: '10px', cursor: 'pointer' }}>{loading ? '...' : 'Deviner'}</button>
                 </form>
               )}
             </div>
          )}

          {hasWon && <h2 style={{color: 'green', marginTop: '20px'}}>Bravo ! Le groupe a été trouvé !</h2>}

          <div style={{ marginTop: '20px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f0f0f0' }}>
                  <th style={{ padding: '10px', border: '1px solid #ccc' }}>Groupe</th>
                  <th style={{ padding: '10px', border: '1px solid #ccc' }}>Pays</th>
                  <th style={{ padding: '10px', border: '1px solid #ccc' }}>Année</th>
                  <th style={{ padding: '10px', border: '1px solid #ccc' }}>Membres</th>
                  <th style={{ padding: '10px', border: '1px solid #ccc' }}>Genres</th>
                  <th style={{ padding: '10px', border: '1px solid #ccc' }}>Popularité</th>
                </tr>
              </thead>
              <tbody>
                {gameState.guesses.map((g, i) => (
                  <tr key={i} style={{ textAlign: 'center' }}>
                    <td style={{ padding: '10px', border: '1px solid #ccc', background: g.nameColor, color: g.nameColor ? 'white' : 'black' }}>{g.name}</td>
                    <td style={{ padding: '10px', border: '1px solid #ccc', background: g.countryColor, color: g.countryColor ? 'white' : 'black' }}>{g.country}</td>
                    <td style={{ padding: '10px', border: '1px solid #ccc', background: g.yearColor, color: g.yearColor ? 'white' : 'black' }}>{g.year} {g.yearDir !== '=' && `(${g.yearDir})`}</td>
                    <td style={{ padding: '10px', border: '1px solid #ccc', background: g.membersColor, color: g.membersColor ? 'white' : 'black' }}>{g.members} {g.membersDir !== '=' && `(${g.membersDir})`}</td>
                    <td style={{ padding: '10px', border: '1px solid #ccc', background: g.genresColor, color: g.genresColor ? 'white' : 'black' }}>{g.genres}</td>
                    <td style={{ padding: '10px', border: '1px solid #ccc', background: g.popColor, color: g.popColor ? 'white' : 'black' }}>{g.popularity} {g.popDir !== '=' && `(${g.popDir})`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Gameplay;