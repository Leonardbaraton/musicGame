import { useState, useEffect } from 'react';
import Home from './Home';
import Lobby from './Lobby';
import Gameplay from './Gameplay';

function App() {
  const [room, setRoom] = useState(() => {
    const savedRoom = localStorage.getItem('musicGameRoom');
    return savedRoom ? JSON.parse(savedRoom) : null;
  });
  const [player, setPlayer] = useState(() => {
    const savedPlayer = localStorage.getItem('musicGamePlayer');
    return savedPlayer ? JSON.parse(savedPlayer) : null;
  });
  const [gameStarted, setGameStarted] = useState(() => {
    return localStorage.getItem('musicGameStarted') === 'true';
  });

  const handleJoin = (roomData, playerData) => {
    setRoom(roomData);
    setPlayer(playerData);
    setGameStarted(false);
    localStorage.setItem('musicGameRoom', JSON.stringify(roomData));
    localStorage.setItem('musicGamePlayer', JSON.stringify(playerData));
    localStorage.setItem('musicGameStarted', 'false');
  };

  const handleLeave = () => {
    setRoom(null);
    setPlayer(null);
    setGameStarted(false);
    localStorage.removeItem('musicGameRoom');
    localStorage.removeItem('musicGamePlayer');
    localStorage.removeItem('musicGameStarted');
  };

  const handleStartGame = () => {
    setGameStarted(true);
    localStorage.setItem('musicGameStarted', 'true');
  };

  return (
    <div>
      {room && player ? (
        gameStarted ? (
          <Gameplay room={room} player={player} onLeave={handleLeave} />
        ) : (
          <Lobby room={room} player={player} onLeave={handleLeave} onStartGame={handleStartGame} />
        )
      ) : (
        <Home onJoin={handleJoin} />
      )}
    </div>
  );
}

export default App;
