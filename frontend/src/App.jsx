import { useState, useEffect } from 'react';
import Home from './Home';
import Lobby from './Lobby';

function App() {
  const [room, setRoom] = useState(() => {
    const savedRoom = localStorage.getItem('musicGameRoom');
    return savedRoom ? JSON.parse(savedRoom) : null;
  });
  const [player, setPlayer] = useState(() => {
    const savedPlayer = localStorage.getItem('musicGamePlayer');
    return savedPlayer ? JSON.parse(savedPlayer) : null;
  });

  const handleJoin = (roomData, playerData) => {
    setRoom(roomData);
    setPlayer(playerData);
    localStorage.setItem('musicGameRoom', JSON.stringify(roomData));
    localStorage.setItem('musicGamePlayer', JSON.stringify(playerData));
  };

  const handleLeave = () => {
    setRoom(null);
    setPlayer(null);
    localStorage.removeItem('musicGameRoom');
    localStorage.removeItem('musicGamePlayer');
  };

  return (
    <div>
      {room && player ? (
        <Lobby room={room} player={player} onLeave={handleLeave} />
      ) : (
        <Home onJoin={handleJoin} />
      )}
    </div>
  );
}

export default App;
