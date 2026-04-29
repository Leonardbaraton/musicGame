import { useState, useEffect } from 'react';

const colorMap = {
  green: 'bg-[#1DB954]',
  red: 'bg-[#E22134]',
  orange: 'bg-[#E8882B]',
};

function GuessCell({ value, color, dir }) {
  const bg = colorMap[color] || 'bg-[#282828]';
  return (
    <td className={`px-3 py-3 text-center text-sm font-medium text-white border-b border-[#3E3E3E] ${bg} transition-colors`}>
      {value}
      {dir && dir !== '=' && (
        <span className="ml-1 text-xs opacity-80">{dir === '>' ? '↑' : '↓'}</span>
      )}
    </td>
  );
}

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
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Top bar */}
      <div className="border-b border-[#282828] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#1DB954]" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            <div>
              <span className="text-white font-bold text-sm">Music Game</span>
              <span className="mx-2 text-[#3E3E3E]">•</span>
              <span className="text-[#B3B3B3] text-sm">Room <span className="text-[#1DB954] font-semibold">{room.code}</span></span>
            </div>
          </div>
          <button
            onClick={onLeave}
            className="px-4 py-2 text-sm text-[#B3B3B3] hover:text-white border border-[#3E3E3E] hover:border-white rounded-full transition-colors duration-200 cursor-pointer"
          >
            Quitter
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {error && (
          <div className="px-4 py-3 bg-[#FF4D4D]/10 border border-[#FF4D4D]/40 rounded-lg text-[#FF4D4D] text-sm">
            {error}
          </div>
        )}

        {/* Turn / Win status */}
        <div className={`rounded-xl p-6 border ${hasWon ? 'bg-[#1DB954]/10 border-[#1DB954]/40' : isMyTurn ? 'bg-[#1DB954]/10 border-[#1DB954]/40' : 'bg-[#181818] border-[#282828]'}`}>
          {hasWon ? (
            <div className="text-center">
              <p className="text-2xl font-bold text-[#1DB954] mb-1">🎉 Bravo !</p>
              <p className="text-[#B3B3B3] text-sm">
                Le groupe a été trouvé par <span className="text-white font-semibold">{gameState.guesses[gameState.guesses.length - 1]?.name}</span> !
              </p>
            </div>
          ) : (
            <>
              <p className="text-[#B3B3B3] text-xs font-semibold uppercase tracking-widest mb-3">
                {isMyTurn ? '🎵 À votre tour' : '⏳ En attente'}
              </p>
              <h3 className="text-white font-bold text-lg mb-4">
                {isMyTurn ? 'Devinez le groupe !' : `Tour de ${currentTurnPlayer?.name || '...'}`}
              </h3>
              <form onSubmit={handleGuess} className="flex gap-3">
                <input
                  type="text"
                  value={guessInput}
                  onChange={e => setGuessInput(e.target.value)}
                  placeholder="Entrez le nom d'un groupe..."
                  disabled={!isMyTurn || hasWon}
                  className="flex-1 px-4 py-2.5 bg-[#3E3E3E] text-white placeholder-[#B3B3B3] rounded-lg border border-transparent focus:outline-none focus:border-[#1DB954] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
                />
                <button
                  type="submit"
                  disabled={loading || !isMyTurn || hasWon}
                  className="px-6 py-2.5 bg-[#1DB954] hover:bg-[#1ed760] disabled:bg-[#3E3E3E] disabled:text-[#B3B3B3] disabled:cursor-not-allowed text-black font-bold rounded-lg transition-colors duration-200 text-sm cursor-pointer"
                >
                  {loading ? '...' : 'Deviner'}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Guesses table */}
        <div className="bg-[#181818] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#282828]">
            <h2 className="text-white font-bold text-base">
              Tentatives <span className="text-[#B3B3B3] font-normal text-sm">({gameState.guesses?.length || 0})</span>
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#121212]">
                  {['Joueur', 'Groupe', 'Pays', 'Année', 'Membres', 'Genres', 'Popularité'].map(h => (
                    <th key={h} className="px-3 py-3 text-left text-[#B3B3B3] font-semibold text-xs uppercase tracking-wider whitespace-nowrap border-b border-[#282828]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!gameState.guesses?.length && (
                  <tr>
                    <td colSpan="7" className="px-3 py-10 text-center text-[#B3B3B3] text-sm">
                      Aucune tentative pour le moment. Soyez le premier !
                    </td>
                  </tr>
                )}
                {gameState.guesses?.map((g, i) => {
                  const playerName = gameState.players?.find(p => p.id === g.playerId)?.name || 'Inconnu';
                  return (
                    <tr key={i} className="hover:bg-[#282828]/50 transition-colors">
                      <td className="px-3 py-3 text-white font-semibold text-sm border-b border-[#3E3E3E] whitespace-nowrap">
                        {playerName}
                      </td>
                      <GuessCell value={g.name} color={g.nameColor} />
                      <GuessCell value={g.country} color={g.countryColor} />
                      <GuessCell value={g.year} color={g.yearColor} dir={g.yearDir} />
                      <GuessCell value={g.members} color={g.membersColor} dir={g.membersDir} />
                      <GuessCell value={g.genres} color={g.genresColor} />
                      <GuessCell value={g.popularity} color={g.popColor} dir={g.popDir} />
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs text-[#B3B3B3]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-[#1DB954]" />
            <span>Correct</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-[#E8882B]" />
            <span>Proche</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-[#E22134]" />
            <span>Incorrect</span>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <span>↑ = plus grand · ↓ = plus petit</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Gameplay;