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
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/rooms`, {
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
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/rooms/${code}/join`, {
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
    <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center px-4">
      {/* Logo / Header */}
      <div className="mb-10 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <svg viewBox="0 0 24 24" className="w-10 h-10 fill-[#1DB954]" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          <h1 className="text-4xl font-bold text-white tracking-tight">Music Game</h1>
        </div>
        <p className="text-[#B3B3B3] text-sm">Devinez le groupe avec vos amis</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-[#181818] rounded-xl p-8 shadow-2xl">
        {error && (
          <div className="mb-5 px-4 py-3 bg-[#FF4D4D]/10 border border-[#FF4D4D]/40 rounded-lg text-[#FF4D4D] text-sm">
            {error}
          </div>
        )}

        {step === 'select' && (
          <div className="space-y-6">
            {/* Create room */}
            <button
              onClick={handleSelectCreate}
              className="w-full py-3 px-6 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold rounded-full transition-colors duration-200 text-base cursor-pointer"
            >
              Créer une nouvelle partie
            </button>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-[#3E3E3E]" />
              <span className="text-[#B3B3B3] text-sm font-medium">OU</span>
              <div className="flex-1 h-px bg-[#3E3E3E]" />
            </div>

            {/* Join room */}
            <div className="space-y-4">
              <h3 className="text-white font-semibold text-lg">Rejoindre une Partie</h3>
              <input
                type="text"
                placeholder="Code de la partie (ex : A1B2C3)"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 bg-[#3E3E3E] text-white placeholder-[#B3B3B3] rounded-lg border border-transparent focus:outline-none focus:border-[#1DB954] transition-colors text-sm"
              />
              <button
                onClick={handleSelectJoin}
                className="w-full py-3 px-6 bg-transparent border border-[#B3B3B3] hover:border-white text-white font-bold rounded-full transition-colors duration-200 text-base cursor-pointer"
              >
                Rejoindre
              </button>
            </div>
          </div>
        )}

        {step === 'profile' && (
          <div className="space-y-5">
            <h3 className="text-white font-bold text-xl">Votre Profil</h3>
            <form onSubmit={handleSubmitProfile} className="space-y-4">
              <input
                type="text"
                placeholder="Votre prénom"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-[#3E3E3E] text-white placeholder-[#B3B3B3] rounded-lg border border-transparent focus:outline-none focus:border-[#1DB954] transition-colors text-sm"
              />
              <label className="w-full px-4 py-4 bg-[#3E3E3E]/50 text-[#B3B3B3] hover:text-white rounded-lg border-2 border-dashed border-[#888] hover:border-white transition-colors text-sm cursor-pointer flex items-center justify-center">
                {photoUrl ? "Photo sélectionnée" : "Prendre ou choisir une photo (optionnel)"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setPhotoUrl(reader.result);
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                />
              </label>
              <button
                type="submit"
                className="w-full py-3 px-6 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold rounded-full transition-colors duration-200 text-base cursor-pointer"
              >
                {pendingAction === 'create' ? 'Créer et rejoindre' : 'Rejoindre la room'}
              </button>
              <button
                type="button"
                onClick={() => setStep('select')}
                className="w-full py-3 px-6 bg-transparent text-[#B3B3B3] hover:text-white font-semibold rounded-full transition-colors duration-200 text-base cursor-pointer"
              >
                ← Retour
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;