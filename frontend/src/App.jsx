import { useState } from 'react';
import Home from './Home';
import Lobby from './Lobby';

function App() {
  const [room, setRoom] = useState(null);
  const [player, setPlayer] = useState(null);

  const handleJoin = (roomData, playerData) => {
    setRoom(roomData);
    setPlayer(playerData);
  };

  return (
    <div>
      {room && player ? (
        <Lobby room={room} player={player} />
      ) : (
        <Home onJoin={handleJoin} />
      )}
    </div>
  );
}

export default App;
