import type { ClientGameState } from '@jardins/shared';
import { BOARD_WIDTH, BOARD_HEIGHT } from '@jardins/shared';
import { Cell, CELL_SIZE } from './Cell';

interface BoardProps {
  gameState: ClientGameState;
  myPlayerId: string;
  selectedCell: { x: number; y: number } | null;
  targetableCells: Set<string>;
  onCellClick: (x: number, y: number) => void;
}

export function Board({
  gameState,
  myPlayerId,
  selectedCell,
  targetableCells,
  onCellClick,
}: BoardProps) {
  const svgWidth = BOARD_WIDTH * CELL_SIZE;
  const svgHeight = BOARD_HEIGHT * CELL_SIZE;

  return (
    <div className="board-container">
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="game-board"
      >
        <defs>
          {/* ── Terrain gradients ── */}
          <linearGradient id="terrain-earth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5a4530" />
            <stop offset="100%" stopColor="#3d2e1e" />
          </linearGradient>

          <radialGradient id="terrain-water" cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#3a7ca5" />
            <stop offset="100%" stopColor="#1a4a6e" />
          </radialGradient>

          <linearGradient id="terrain-stone" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6a6e73" />
            <stop offset="100%" stopColor="#4a4e52" />
          </linearGradient>

          <radialGradient id="terrain-mist" cx="50%" cy="50%" r="65%">
            <stop offset="0%" stopColor="#4d3d6e" />
            <stop offset="100%" stopColor="#2a1f40" />
          </radialGradient>

          <radialGradient id="terrain-fertile" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#2a6e5a" />
            <stop offset="70%" stopColor="#1a4a3a" />
            <stop offset="100%" stopColor="#0f3028" />
          </radialGradient>

          {/* ── Temporal effect filters ── */}
          <filter id="filter-blur-soft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
          </filter>

          <filter id="filter-frozen-glass" x="-10%" y="-10%" width="120%" height="120%">
            <feSpecularLighting surfaceScale="3" specularConstant="0.6" specularExponent="25" result="spec">
              <fePointLight x="36" y="10" z="40" />
            </feSpecularLighting>
            <feComposite in="SourceGraphic" in2="spec" operator="arithmetic" k1="0" k2="1" k3="0.3" k4="0" />
          </filter>

          {/* ── Selection glow ── */}
          <filter id="glow-select" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
            <feFlood floodColor="#d4a843" floodOpacity="0.5" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="shadow" />
            <feMerge>
              <feMergeNode in="shadow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="glow-target" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
            <feFlood floodColor="#3ecfa5" floodOpacity="0.3" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="shadow" />
            <feMerge>
              <feMergeNode in="shadow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* ── Plant color gradients ── */}
          <radialGradient id="plant-liane" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#6dd88a" />
            <stop offset="100%" stopColor="#3a8f52" />
          </radialGradient>

          <radialGradient id="plant-moss" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#4aad6a" />
            <stop offset="100%" stopColor="#1f6040" />
          </radialGradient>

          <radialGradient id="plant-voidflower" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#d4a8f0" />
            <stop offset="100%" stopColor="#8a5cb8" />
          </radialGradient>

          <radialGradient id="plant-echoshroom" cx="50%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#a0b0e8" />
            <stop offset="100%" stopColor="#5a6aa0" />
          </radialGradient>
        </defs>

        {gameState.board.map((row, y) =>
          row.map((cell, x) => (
            <Cell
              key={`${x}-${y}`}
              cell={cell}
              isSelected={selectedCell?.x === x && selectedCell?.y === y}
              isTargetable={targetableCells.has(`${x},${y}`)}
              myPlayerId={myPlayerId}
              onClick={() => onCellClick(x, y)}
            />
          )),
        )}
      </svg>
    </div>
  );
}
