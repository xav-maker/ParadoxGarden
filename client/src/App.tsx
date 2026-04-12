import { useState } from 'react';
import { GamePhase } from '@jardins/shared';
import { useSocket } from './hooks/useSocket';
import { Lobby } from './components/Lobby';
import { Game } from './components/Game';
import { GameOver } from './components/GameOver';
import { RulesPage } from './components/RulesPage';

function App() {
  const {
    connected,
    roomCode,
    playerId,
    gameState,
    errorMessage,
    opponentDisconnected,
    reconnecting,
    createRoom,
    joinRoom,
    createSoloGame,
    submitTurn,
    leaveGame,
    clearError,
  } = useSocket();

  const [showRules, setShowRules] = useState(false);

  if (showRules) {
    return <RulesPage onClose={() => setShowRules(false)} />;
  }

  if (reconnecting) {
    return (
      <div className="lobby">
        <h1>Les Jardins du Paradoxe</h1>
        <div className="loader" />
        <p className="connecting">Reconnexion a la partie...</p>
      </div>
    );
  }

  if (!gameState || !playerId) {
    return (
      <Lobby
        connected={connected}
        roomCode={roomCode}
        onCreateRoom={createRoom}
        onJoinRoom={joinRoom}
        onCreateSoloGame={createSoloGame}
        errorMessage={errorMessage}
        onClearError={clearError}
        onShowRules={() => setShowRules(true)}
      />
    );
  }

  return (
    <>
      <Game
        gameState={gameState}
        myPlayerId={playerId}
        onSubmitTurn={submitTurn}
        opponentDisconnected={opponentDisconnected}
        onShowRules={() => setShowRules(true)}
      />
      {gameState.phase === GamePhase.Finished && (
        <GameOver gameState={gameState} myPlayerId={playerId} onLeaveGame={leaveGame} />
      )}
      {errorMessage && (
        <div className="floating-error" onClick={clearError}>
          {errorMessage} <span className="close">&#10005;</span>
        </div>
      )}
    </>
  );
}

export default App;
