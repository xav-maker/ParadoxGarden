import type { ClientGameState } from '@jardins/shared';
import { HarmonyIcon } from './Icons';

interface GameOverProps {
  gameState: ClientGameState;
  myPlayerId: string;
  onLeaveGame: () => void;
}

export function GameOver({ gameState, myPlayerId, onLeaveGame }: GameOverProps) {
  const isWinner = gameState.winner === myPlayerId;
  const isDraw = !gameState.winner;
  const me = gameState.players.find((p) => p.id === myPlayerId)!;
  const opponent = gameState.players.find((p) => p.id !== myPlayerId)!;

  return (
    <div className="game-over-overlay">
      <div className="game-over-card">
        <h1>
          {isDraw ? 'Egalite' : isWinner ? 'Victoire' : 'Defaite'}
        </h1>

        {gameState.winReason === 'floraison' && (
          <p className="win-reason">
            {isWinner
              ? 'Vous avez realise une Floraison-Signe !'
              : "L'adversaire a realise une Floraison-Signe."}
          </p>
        )}

        {gameState.winReason === 'harmony' && (
          <p className="win-reason">
            Fin de partie aux Points d'Harmonie
          </p>
        )}

        <div className="score-summary">
          <div className="score-row">
            <span>{me.name} (vous)</span>
            <span className="score-value">
              <HarmonyIcon size={14} color="#d4a843" /> {me.harmonyPoints} pts
            </span>
          </div>
          <div className="score-row">
            <span>{opponent.name}</span>
            <span className="score-value">
              <HarmonyIcon size={14} color="#d4a843" /> {opponent.harmonyPoints} pts
            </span>
          </div>
        </div>

        <button onClick={onLeaveGame}>
          Nouvelle partie
        </button>
      </div>
    </div>
  );
}
