import { useState, useEffect } from 'react';

function Lobby({ room, player }) {
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState('');

  const fetchPlayers = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/rooms/${room.code}/players`);
      if (!res.ok) throw new Error('Erreur réseaux');
      const data = await res.json();
      setPlayers(data);
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
      <h1>Lobby - Room {room.code}</h1>
      <p>Partagez ce code avec vos amis pour les inviter : <strong>{room.code}</strong></p>

      {error && <p style={{ color: 'red' }}>{error}</p>}

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