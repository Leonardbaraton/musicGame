import { useState, useEffect } from 'react';

function Gameplay({ room, player, onLeave }) {
  const [gameState, setGameState] = useState({ hasTarget: false, currentTurnPlayerId: null, players: [], guesses: [] });
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

  const handleGuess = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`http://localhost:3000/api/rooms/${room.code}/guess`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupName: guessInput, playerId: player.id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Groupe introuvable ou erreur');
      setGuessInput('');
      fetchGameState();
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  const isMyTurn = gameState.currentTurnPlayerId === player.id;
  const currentTurnPlayer = gameState.players?.find(p => p.id === gameState.currentTurnPlayerId);
  const hasWon = gameState.guesses?.some(g => g.isWin);

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Room {room.code}</h1>
        <button onClick={onLeave} style={{ padding: '8px 16px', background: '#ff4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Quitter</button>
      </div>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ background: isMyTurn ? '#e3f2fd' : '#f0f0f0', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
        {hasWon ? (
          <h2 style={{color: 'green'}}>Bravo ! Le groupe a été trouvé par {gameState.guesses[gameState.guesses.length - 1]?.name} !</h2>
        ) : (
          <>
            <h3>{isMyTurn ? 'À vous de deviner !' : `C'est au tour de ${currentTurnPlayer?.name || 'chargement...'}...`}</h3>
            
            <form onSubmit={handleGuess}>
               <input 
                 type="text" 
                 value={guessInput} 
                 onChange={e => setGuessInput(e.target.value)} 
                 placeholder="Tentez un groupe..." 
                 disabled={!isMyTurn || hasWon}
                 style={{ padding: '10px', width: '200px' }} 
               />
               <button 
                 type="submit" 
                 disabled={loading || !isMyTurn || hasWon} 
                 style={{ padding: '10px 20px', marginLeft: '10px', cursor: (isMyTurn && !hasWon) ? 'pointer' : 'not-allowed', background: (isMyTurn && !hasWon) ? '#007bff' : '#ccc', color: 'white', border: 'none', borderRadius: '4px' }}>
                 {loading ? '...' : 'Deviner'}
               </button>
            </form>
          </>
        )}
      </div>

      <div style={{ marginTop: '20px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: '#f0f0f0' }}>
              <th style={{ padding: '10px', border: '1px solid #ccc' }}>Joueur</th>
              <th style={{ padding: '10px', border: '1px solid #ccc' }}>Groupe</th>
              <th style={{ padding: '10px', border: '1px solid #ccc' }}>Pays</th>
              <th style={{ padding: '10px', border: '1px solid #ccc' }}>Année</th>
              <th style={{ padding: '10px', border: '1px solid #ccc' }}>Membres</th>
              <th style={{ padding: '10px', border: '1px solid #ccc' }}>Genres</th>
              <th style={{ padding: '10px', border: '1px solid #ccc' }}>Popularité</th>
            </tr>
          </thead>
          <tbody>
            {!gameState.guesses?.length && (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>Aucune tentative pour le moment.</td></tr>
            )}
            {gameState.guesses?.map((g, i) => {
              const playerName = gameState.players?.find(p => p.id === g.playerId)?.name || 'Inconnu';
              return (
              <tr key={i} style={{ textAlign: 'center' }}>
                <td style={{ padding: '10px', border: '1px solid #ccc', fontWeight: 'bold' }}>{playerName}</td>
                <td style={{ padding: '10px', border: '1px solid #ccc', background: g.nameColor, color: g.nameColor ? 'white' : 'black' }}>{g.name}</td>
                <td style={{ padding: '10px', border: '1px solid #ccc', background: g.countryColor, color: g.countryColor ? 'white' : 'black' }}>{g.country}</td>
                <td style={{ padding: '10px', border: '1px solid #ccc', background: g.yearColor, color: g.yearColor ? 'white' : 'black' }}>{g.year} {g.yearDir !== '=' && `(${g.yearDir})`}</td>
                <td style={{ padding: '10px', border: '1px solid #ccc', background: g.membersColor, color: g.membersColor ? 'white' : 'black' }}>{g.members} {g.membersDir !== '=' && `(${g.membersDir})`}</td>
                <td style={{ padding: '10px', border: '1px solid #ccc', background: g.genresColor, color: g.genresColor ? 'white' : 'black' }}>{g.genres}</td>
                <td style={{ padding: '10px', border: '1px solid #ccc', background: g.popColor, color: g.popColor ? 'white' : 'black' }}>{g.popularity} {g.popDir !== '=' && `(${g.popDir})`}</td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Gameplay;