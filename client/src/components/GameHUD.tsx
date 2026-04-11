import type { ClientGameState, ClientPlayer } from '@jardins/shared';
import { FLORAISON_DEFINITIONS } from '@jardins/shared';
import { SapIcon, TimeIcon, HarmonyIcon } from './Icons';

interface GameHUDProps {
  gameState: ClientGameState;
  myPlayerId: string;
}

export function GameHUD({ gameState, myPlayerId }: GameHUDProps) {
  const me = gameState.players.find((p) => p.id === myPlayerId)!;
  const opponent = gameState.players.find((p) => p.id !== myPlayerId)!;
  const isMyTurn = gameState.activePlayerId === myPlayerId;

  return (
    <div className="game-hud">
      <div className="turn-indicator">
        <span className={`turn-badge ${isMyTurn ? 'my-turn' : 'opponent-turn'}`}>
          {isMyTurn ? 'Votre tour' : 'Tour adverse'}
        </span>
        <span className="turn-number">Tour {Math.ceil(gameState.turnNumber / 2)}/{gameState.maxTurns}</span>
      </div>

      <PlayerPanel player={me} label="Vous" isMe />
      <PlayerPanel player={opponent} label={opponent.name} isMe={false} />
    </div>
  );
}

function PlayerPanel({ player, label, isMe }: { player: ClientPlayer; label: string; isMe: boolean }) {
  return (
    <div className={`player-panel ${isMe ? 'me' : 'opponent'}`}>
      <h3>{label}</h3>
      <div className="resources">
        <div className="resource">
          <span className="resource-icon"><SapIcon size={16} color={isMe ? '#3ecfa5' : '#d4a843'} /></span>
          <span className="resource-value">{player.sap}</span>
          <span className="resource-label">Seve</span>
        </div>
        <div className="resource">
          <span className="resource-icon"><TimeIcon size={16} color="#4de8c2" /></span>
          <span className="resource-value">{player.timeCharges}</span>
          <span className="resource-label">Temps</span>
        </div>
        <div className="resource">
          <span className="resource-icon"><HarmonyIcon size={16} color="#d4a843" /></span>
          <span className="resource-value">{player.harmonyPoints}</span>
          <span className="resource-label">Harmonie</span>
        </div>
      </div>

      {isMe && player.secretObjectives && (
        <div className="objectives">
          <h4>Floraisons secretes</h4>
          {player.secretObjectives.map((objId) => {
            const def = FLORAISON_DEFINITIONS[objId];
            const completed = player.completedObjectives.includes(objId);
            return (
              <div key={objId} className={`objective ${completed ? 'completed' : ''}`} title={def.description}>
                <span className="obj-name">{def.name}</span>
                <span className="obj-category">[{def.category}]</span>
                {completed && <span className="obj-check">&#10003;</span>}
              </div>
            );
          })}
        </div>
      )}

      {!isMe && (
        <div className="objectives">
          <h4>Objectifs</h4>
          <div className="objective opponent-obj">
            <span className="obj-category">3 floraisons secretes</span>
          </div>
        </div>
      )}
    </div>
  );
}
