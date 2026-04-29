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

  const isHost = players.length > 0 && players[0].id === player.id;

  return (
    <div className="min-h-screen bg-[#121212] text-white px-4 py-8">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 24 24" className="w-7 h-7 fill-[#1DB954]" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            <div>
              <h1 className="text-xl font-bold leading-none">Lobby</h1>
              <p className="text-[#B3B3B3] text-xs mt-0.5">Room <span className="text-[#1DB954] font-bold">{room.code}</span></p>
            </div>
          </div>
          <button
            onClick={onLeave}
            className="px-4 py-2 text-sm text-[#B3B3B3] hover:text-white border border-[#3E3E3E] hover:border-white rounded-full transition-colors duration-200 cursor-pointer"
          >
            Quitter
          </button>
        </div>

        {/* Invite code */}
        <div className="bg-[#181818] rounded-xl p-5 mb-6">
          <p className="text-[#B3B3B3] text-sm mb-2">Partagez ce code avec vos amis :</p>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold tracking-widest text-[#1DB954]" aria-label={`Code de la room : ${room.code}`}>{room.code}</span>
          </div>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 bg-[#FF4D4D]/10 border border-[#FF4D4D]/40 rounded-lg text-[#FF4D4D] text-sm">
            {error}
          </div>
        )}

        {/* Start / waiting */}
        {isHost ? (
          <div className="bg-[#181818] rounded-xl p-5 mb-6 text-center">
            <p className="text-[#B3B3B3] text-sm mb-4">Tout le monde est là ?</p>
            <button
              onClick={handleStartGame}
              className="px-8 py-3 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold rounded-full transition-colors duration-200 text-base cursor-pointer"
            >
              Lancer la partie !
            </button>
          </div>
        ) : (
          <div className="bg-[#181818] rounded-xl p-5 mb-6 text-center">
            <div className="flex items-center justify-center gap-2 text-[#B3B3B3] text-sm">
              <svg className="animate-spin w-4 h-4 text-[#1DB954]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              En attente de l'hôte pour lancer la partie...
            </div>
          </div>
        )}

        {/* Players list */}
        <div className="bg-[#181818] rounded-xl p-5">
          <h2 className="text-white font-bold text-base mb-4">
            Joueurs dans la salle <span className="text-[#B3B3B3] font-normal">({players.length})</span>
          </h2>
          <ul className="space-y-3">
            {players.map((p, index) => (
              <li
                key={p.id}
                className="flex items-center gap-4 p-3 bg-[#282828] hover:bg-[#3E3E3E] rounded-lg transition-colors duration-150"
              >
                {p.photoUrl ? (
                  <img src={p.photoUrl} alt={p.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#1DB954] flex items-center justify-center flex-shrink-0 text-black font-bold text-sm">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">
                    {p.name}
                    {p.id === player.id && <span className="ml-2 text-[#B3B3B3] font-normal text-xs">(Vous)</span>}
                  </p>
                  {index === 0 && <p className="text-[#1DB954] text-xs mt-0.5">Hôte</p>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Lobby;