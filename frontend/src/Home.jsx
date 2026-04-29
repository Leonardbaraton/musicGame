import { useState } from 'react';

function Home({ onJoin }) {
  const [step, setStep] = useState('select'); // 'select' ou 'profile'
  const [pendingAction, setPendingAction] = useState(null); // 'create' ou 'join'
  
  const [name, setName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');

  const handleSelectCreate = () => {
    setError('');
    setPendingAction('create');
    setStep('profile');
  };

  const handleSelectJoin = () => {
    if (!joinCode) return setError('Le code de la room est requis');
    setError('');
    setPendingAction('join');
    setStep('profile');
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    if (!name) return setError('Le prénom est requis');

    if (pendingAction === 'create') {
      try {
        const res = await fetch('http://localhost:3000/api/rooms', {
          method: 'POST',
        });
        const room = await res.json();
        await joinRoom(room.code);
      } catch (err) {
        setError('Erreur lors de la création de la room');
      }
    } else if (pendingAction === 'join') {
      await joinRoom(joinCode);
    }
  };

  const joinRoom = async (code) => {
    try {
      const res = await fetch(`http://localhost:3000/api/rooms/${code}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, photoUrl }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de la connexion à la room');
      }
      const data = await res.json();
      onJoin(data.room, data.player);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>Music Game</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {step === 'select' && (
        <>
          <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '1rem' }}>
            <button onClick={handleSelectCreate} style={{ padding: '10px 20px', width: '100%', cursor: 'pointer' }}>
              Créer une nouvelle room
            </button>
          </div>

          <div style={{ textAlign: 'center' }}>- OU -</div>

          <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px', marginTop: '1rem' }}>
            <h3>Rejoindre une Room</h3>
            <input
              type="text"
              placeholder="Code de la room (ex: A1B2C3)"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }}
            />
            <button onClick={handleSelectJoin} style={{ padding: '10px 20px', width: '100%', cursor: 'pointer' }}>
              Rejoindre
            </button>
          </div>
        </>
      )}

      {step === 'profile' && (
        <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
          <h3>Votre Profil</h3>
          <form onSubmit={handleSubmitProfile}>
            <input
              type="text"
              placeholder="Votre prénom"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }}
            />
            <input
              type="url"
              placeholder="Lien vers votre photo (optionnel)"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }}
            />
            <button type="submit" style={{ padding: '10px 20px', width: '100%', cursor: 'pointer', marginBottom: '10px' }}>
              {pendingAction === 'create' ? 'Créer et rejoindre' : 'Rejoindre la room'}
            </button>
            <button type="button" onClick={() => setStep('select')} style={{ padding: '10px 20px', width: '100%', cursor: 'pointer', background: '#ccc', border: 'none' }}>
              Retour
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Home;