import { useState, useEffect } from 'react';

function Lobby({ room, player, onLeave, onStartGame }) {
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState('');

  const fetchPlayers = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/rooms/${room.code}/players`);
      if (!res.ok) throw new Error('Erreur réseaux');
      const data = await res.json();

      setPlayers(data.players || []);

      if (data.isStarted) {
        onStartGame();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStartGame = async () => {
    if (players.length < 2) {
      setError('Il faut au moins 2 joueurs pour commencer');
      return;
    }
    try {
      const res = await fetch(`http://localhost:3000/api/rooms/${room.code}/start`, { method: 'POST' });
      if (!res.ok) throw new Error('Erreur au lancement');
      onStartGame(); // Notify parent
    } catch (err) {
      setError(err.message);
    }
  };

  // Rafraîchir les joueurs toutes les 3 secondes pour voir les nouveaux entrants
  useEffect(() => {
    fetchPlayers();
    const interval = setInterval(fetchPlayers, 3000);
    return () => clearInterval(interval);
  }, [room.code]);

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Lobby - Room {room.code}</h1>
        <button onClick={onLeave} style={{ padding: '8px 16px', background: '#ff4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Quitter
        </button>
      </div>
      <p>Partagez ce code avec vos amis pour les inviter : <strong>{room.code}</strong></p>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {players.length > 0 && players[0].id === player.id ? (
        <div style={{ padding: '1rem', marginTop: '1rem', background: '#e0ffe0', borderRadius: '8px', textAlign: 'center' }}>
          <p>Tout le monde est là ?</p>
          <button onClick={handleStartGame} style={{ padding: '10px 20px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1.1rem' }}>
            Lancer la partie !
          </button>
        </div>
      ) : (
        <div style={{ padding: '1rem', marginTop: '1rem', background: '#f0f0f0', borderRadius: '8px', textAlign: 'center' }}>
          <p>En attente de l'hôte pour lancer la partie...</p>
        </div>
      )}

      <h2>Joueurs dans la salle ({players.length}) :</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {players.map((p) => (
          <li key={p.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', padding: '10px', background: '#f5f5f5', borderRadius: '8px' }}>
             {p.photoUrl ? (
               <img src={p.photoUrl} alt={p.name} style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '15px' }} />
             ) : (
               <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ccc', marginRight: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                 {p.name.charAt(0).toUpperCase()}
               </div>
             )}
             <div>
               <strong>{p.name}</strong>
               {p.id === player.id && ' (Vous)'}
             </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Lobby;