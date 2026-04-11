import { useState } from 'react';

interface LobbyProps {
  connected: boolean;
  roomCode: string | null;
  onCreateRoom: (name: string) => void;
  onJoinRoom: (code: string, name: string) => void;
  onCreateSoloGame: (name: string) => void;
  errorMessage: string | null;
  onClearError: () => void;
  onShowRules: () => void;
}

function DecoLeaf({ x, y, scale = 1, rotate = 0, opacity = 0.04 }: { x: number; y: number; scale?: number; rotate?: number; opacity?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${scale}) rotate(${rotate})`} opacity={opacity}>
      <path d="M0,-20 Q12,-15 8,0 Q4,10 0,20 Q-4,10 -8,0 Q-12,-15 0,-20Z" fill="#3ecfa5" />
      <line x1={0} y1={-16} x2={0} y2={16} stroke="#2d8f5e" strokeWidth={0.8} />
    </g>
  );
}

function LobbyBackground() {
  const leaves = [
    { x: 80, y: 100, scale: 1.2, rotate: 15, opacity: 0.03 },
    { x: 200, y: 60, scale: 0.8, rotate: -25, opacity: 0.025 },
    { x: 350, y: 130, scale: 1, rotate: 40, opacity: 0.035 },
    { x: 500, y: 80, scale: 0.7, rotate: -10, opacity: 0.02 },
    { x: 650, y: 150, scale: 1.1, rotate: 30, opacity: 0.03 },
    { x: 120, y: 350, scale: 0.9, rotate: -45, opacity: 0.025 },
    { x: 300, y: 400, scale: 1.3, rotate: 20, opacity: 0.04 },
    { x: 550, y: 380, scale: 0.6, rotate: -35, opacity: 0.02 },
    { x: 700, y: 300, scale: 1, rotate: 55, opacity: 0.03 },
    { x: 50, y: 500, scale: 0.8, rotate: -60, opacity: 0.025 },
    { x: 400, y: 550, scale: 1.1, rotate: 10, opacity: 0.035 },
    { x: 600, y: 500, scale: 0.9, rotate: -20, opacity: 0.02 },
  ];

  return (
    <svg className="lobby-bg" width="100%" height="100%"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {leaves.map((l, i) => <DecoLeaf key={i} {...l} />)}
    </svg>
  );
}

export function Lobby({
  connected,
  roomCode,
  onCreateRoom,
  onJoinRoom,
  onCreateSoloGame,
  errorMessage,
  onClearError,
  onShowRules,
}: LobbyProps) {
  const [playerName, setPlayerName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [mode, setMode] = useState<'menu' | 'create' | 'join' | 'solo'>('menu');

  if (!connected) {
    return (
      <div className="lobby">
        <LobbyBackground />
        <h1>Les Jardins du Paradoxe</h1>
        <p className="connecting">Connexion au serveur...</p>
      </div>
    );
  }

  if (roomCode) {
    return (
      <div className="lobby">
        <LobbyBackground />
        <h1>Les Jardins du Paradoxe</h1>
        <div className="waiting-room">
          <p style={{ color: 'var(--text-secondary)' }}>Partie creee</p>
          <div className="room-code">{roomCode}</div>
          <p className="hint">Partagez ce code avec votre adversaire</p>
          <div className="loader" />
          <p className="connecting">En attente d'un adversaire...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lobby">
      <LobbyBackground />
      <h1>Les Jardins du Paradoxe</h1>
      <p className="subtitle">Strategie au tour par tour</p>

      {errorMessage && (
        <div className="error-banner" onClick={onClearError}>
          {errorMessage} <span className="close">&#10005;</span>
        </div>
      )}

      {mode === 'menu' && (
        <>
          <div className="menu-buttons">
            <button onClick={() => setMode('create')}>Creer une partie</button>
            <button onClick={() => setMode('join')}>Rejoindre une partie</button>
          </div>
          <button className="solo-lobby-btn" onClick={() => setMode('solo')}>
            Jouer contre l'IA
          </button>
          <button className="secondary rules-lobby-btn" onClick={onShowRules}>
            Regles du jeu
          </button>
        </>
      )}

      {mode === 'create' && (
        <div className="form">
          <input
            type="text"
            placeholder="Votre nom"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            maxLength={20}
            autoFocus
          />
          <div className="form-buttons">
            <button
              onClick={() => playerName.trim() && onCreateRoom(playerName.trim())}
              disabled={!playerName.trim()}
            >
              Creer
            </button>
            <button className="secondary" onClick={() => setMode('menu')}>
              Retour
            </button>
          </div>
        </div>
      )}

      {mode === 'join' && (
        <div className="form">
          <input
            type="text"
            placeholder="Votre nom"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            maxLength={20}
            autoFocus
          />
          <input
            type="text"
            placeholder="Code de la room"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            maxLength={6}
          />
          <div className="form-buttons">
            <button
              onClick={() =>
                playerName.trim() &&
                joinCode.trim() &&
                onJoinRoom(joinCode.trim(), playerName.trim())
              }
              disabled={!playerName.trim() || !joinCode.trim()}
            >
              Rejoindre
            </button>
            <button className="secondary" onClick={() => setMode('menu')}>
              Retour
            </button>
          </div>
        </div>
      )}

      {mode === 'solo' && (
        <div className="form">
          <input
            type="text"
            placeholder="Votre nom"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            maxLength={20}
            autoFocus
          />
          <div className="form-buttons">
            <button
              onClick={() => playerName.trim() && onCreateSoloGame(playerName.trim())}
              disabled={!playerName.trim()}
            >
              Lancer la partie
            </button>
            <button className="secondary" onClick={() => setMode('menu')}>
              Retour
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
