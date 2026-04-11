import type { Cell as CellType } from '@jardins/shared';
import { TerrainType, TimeState, Species } from '@jardins/shared';

interface CellProps {
  cell: CellType;
  isSelected: boolean;
  isTargetable: boolean;
  myPlayerId: string;
  onClick: () => void;
}

const CELL_SIZE = 72;
const PADDING = 2;
const CENTER = CELL_SIZE / 2;

const TERRAIN_FILLS: Record<TerrainType, string> = {
  [TerrainType.Earth]: 'url(#terrain-earth)',
  [TerrainType.Water]: 'url(#terrain-water)',
  [TerrainType.Stone]: 'url(#terrain-stone)',
  [TerrainType.Mist]: 'url(#terrain-mist)',
  [TerrainType.FertileVoid]: 'url(#terrain-fertile)',
};


export function Cell({ cell, isSelected, isTargetable, myPlayerId, onClick }: CellProps) {
  const x = cell.x * CELL_SIZE;
  const y = cell.y * CELL_SIZE;
  const innerSize = CELL_SIZE - PADDING * 2;
  const cx = x + CENTER;
  const cy = y + CENTER;

  const isMyPlant = cell.plant?.ownerId === myPlayerId;
  const playerColor = isMyPlant ? '#3ecfa5' : '#d4a843';

  let cellFilter: string | undefined;
  if (isSelected) cellFilter = 'url(#glow-select)';
  else if (isTargetable) cellFilter = 'url(#glow-target)';

  return (
    <g onClick={onClick} style={{ cursor: isTargetable || cell.plant ? 'pointer' : 'default' }}>
      {/* Terrain tile */}
      <rect
        x={x + PADDING}
        y={y + PADDING}
        width={innerSize}
        height={innerSize}
        rx={5}
        fill={TERRAIN_FILLS[cell.terrain]}
        stroke={isSelected ? '#d4a843' : isTargetable ? 'rgba(62,207,165,0.5)' : 'rgba(255,255,255,0.06)'}
        strokeWidth={isSelected ? 2.5 : isTargetable ? 1.5 : 0.5}
        filter={cellFilter}
      />

      {/* Subtle terrain accent mark */}
      <TerrainMark terrain={cell.terrain} x={x} y={y} />

      {/* Temporal effect overlay */}
      {cell.timeState !== TimeState.Normal && (
        <TemporalOverlay timeState={cell.timeState} x={x} y={y} />
      )}

      {/* Plant */}
      {cell.plant && (
        <g>
          <PlantShape
            species={cell.plant.species}
            age={cell.plant.age}
            cx={cx}
            cy={cy}
          />

          {/* Age badge (orbital diamonds) */}
          <AgeBadge
            age={cell.plant.age}
            cx={cx}
            cy={cy}
            color={playerColor}
          />

          {/* Rooted indicator */}
          {cell.plant.rooted && (
            <g transform={`translate(${x + innerSize - 4}, ${y + innerSize - 6})`}>
              <path
                d="M0,-4 L-3,2 L0,0 L3,2 Z"
                fill={playerColor}
                opacity={0.8}
              />
              <line x1="0" y1="0" x2="0" y2="5" stroke={playerColor} strokeWidth={1.5} opacity={0.6} />
            </g>
          )}
        </g>
      )}
    </g>
  );
}

/* ── Terrain accent marks ── */

function TerrainMark({ terrain, x, y }: { terrain: TerrainType; x: number; y: number }) {
  const cx = x + CENTER;
  const cy = y + CENTER;

  switch (terrain) {
    case TerrainType.Water:
      return (
        <g opacity={0.2}>
          <path d={`M${x+14},${y+58} Q${x+22},${y+54} ${x+30},${y+58} Q${x+38},${y+62} ${x+46},${y+58}`}
            fill="none" stroke="#8ac0e0" strokeWidth={1.2} />
          <path d={`M${x+20},${y+62} Q${x+28},${y+58} ${x+36},${y+62} Q${x+44},${y+66} ${x+52},${y+62}`}
            fill="none" stroke="#8ac0e0" strokeWidth={0.8} />
        </g>
      );
    case TerrainType.Stone:
      return (
        <g opacity={0.15}>
          <polygon points={`${x+50},${y+52} ${x+56},${y+48} ${x+62},${y+54} ${x+58},${y+60} ${x+52},${y+58}`}
            fill="#a0a4a8" stroke="none" />
          <polygon points={`${x+8},${y+56} ${x+14},${y+54} ${x+16},${y+60} ${x+10},${y+62}`}
            fill="#909498" stroke="none" />
        </g>
      );
    case TerrainType.Mist:
      return (
        <g opacity={0.12}>
          <ellipse cx={cx - 8} cy={cy + 18} rx={14} ry={4} fill="#a090c8" />
          <ellipse cx={cx + 10} cy={cy + 22} rx={10} ry={3} fill="#9080b8" />
        </g>
      );
    case TerrainType.FertileVoid:
      return (
        <circle cx={cx} cy={cy} r={18} fill="rgba(62,207,165,0.06)" />
      );
    default:
      return null;
  }
}

/* ── Temporal overlays ── */

function TemporalOverlay({ timeState, x, y }: { timeState: TimeState; x: number; y: number }) {
  const cx = x + CENTER;
  const cy = y + CENTER;
  const s = CELL_SIZE;

  switch (timeState) {
    case TimeState.Accelerated:
      return (
        <g className="time-fx-accel" opacity={0.6}>
          <rect x={x + PADDING} y={y + PADDING} width={s - PADDING * 2} height={s - PADDING * 2}
            rx={5} fill="none" stroke="#4de8c2" strokeWidth={1.8} strokeDasharray="4 6" />
          <line x1={x + 14} y1={cy - 6} x2={x + 8} y2={cy} stroke="#4de8c2" strokeWidth={1.5} strokeLinecap="round" />
          <line x1={x + 14} y1={cy + 6} x2={x + 8} y2={cy} stroke="#4de8c2" strokeWidth={1.5} strokeLinecap="round" />
          <line x1={x + s - 14} y1={cy - 6} x2={x + s - 8} y2={cy} stroke="#4de8c2" strokeWidth={1.5} strokeLinecap="round" />
          <line x1={x + s - 14} y1={cy + 6} x2={x + s - 8} y2={cy} stroke="#4de8c2" strokeWidth={1.5} strokeLinecap="round" />
        </g>
      );

    case TimeState.Slowed:
      return (
        <g className="time-fx-slow">
          <rect x={x + PADDING + 2} y={y + PADDING + 2} width={s - PADDING * 2 - 4} height={s - PADDING * 2 - 4}
            rx={8} fill="none" stroke="#9b7ec8" strokeWidth={4} opacity={0.2}
            filter="url(#filter-blur-soft)" />
          <rect x={x + PADDING + 4} y={y + PADDING + 4} width={s - PADDING * 2 - 8} height={s - PADDING * 2 - 8}
            rx={6} fill="none" stroke="#9b7ec8" strokeWidth={1} opacity={0.25} />
        </g>
      );

    case TimeState.Reversed: {
      const r = 20;
      const spiralPath = `M${cx},${cy} ` +
        `Q${cx + r * 0.5},${cy - r * 0.3} ${cx + r * 0.3},${cy - r * 0.7} ` +
        `Q${cx},${cy - r} ${cx - r * 0.4},${cy - r * 0.6} ` +
        `Q${cx - r * 0.7},${cy - r * 0.2} ${cx - r * 0.5},${cy + r * 0.2} ` +
        `Q${cx - r * 0.2},${cy + r * 0.6} ${cx + r * 0.1},${cy + r * 0.5}`;
      return (
        <g className="time-fx-reverse" opacity={0.5}
          style={{ transformOrigin: `${cx}px ${cy}px` }}>
          <path d={spiralPath} fill="none" stroke="#c47ef0" strokeWidth={1.5} strokeLinecap="round" />
          <circle cx={cx} cy={cy} r={3} fill="#c47ef0" opacity={0.6} />
        </g>
      );
    }

    case TimeState.Frozen:
      return (
        <g opacity={0.7}>
          <rect x={x + PADDING} y={y + PADDING} width={s - PADDING * 2} height={s - PADDING * 2}
            rx={5} fill="none" stroke="#a8e0f7" strokeWidth={1.5} />
          {/* Crystal marks in corners */}
          <path d={`M${x + 6},${y + 12} L${x + 10},${y + 4} L${x + 14},${y + 10}`}
            fill="none" stroke="#a8e0f7" strokeWidth={1.2} strokeLinecap="round" />
          <path d={`M${x + s - 6},${y + 12} L${x + s - 10},${y + 4} L${x + s - 14},${y + 10}`}
            fill="none" stroke="#a8e0f7" strokeWidth={1.2} strokeLinecap="round" />
          <path d={`M${x + 6},${y + s - 12} L${x + 10},${y + s - 4} L${x + 14},${y + s - 10}`}
            fill="none" stroke="#a8e0f7" strokeWidth={1.2} strokeLinecap="round" />
          <path d={`M${x + s - 6},${y + s - 12} L${x + s - 10},${y + s - 4} L${x + s - 14},${y + s - 10}`}
            fill="none" stroke="#a8e0f7" strokeWidth={1.2} strokeLinecap="round" />
          {/* Subtle frost overlay */}
          <rect x={x + PADDING} y={y + PADDING} width={s - PADDING * 2} height={s - PADDING * 2}
            rx={5} fill="rgba(168,224,247,0.04)" />
        </g>
      );

    default:
      return null;
  }
}

/* ── SVG Plant shapes ── */

function PlantShape({ species, age, cx, cy }: { species: Species; age: number; cx: number; cy: number }) {
  const scale = 0.5 + age * 0.2;

  switch (species) {
    case Species.Liane:
      return <LianeSVG cx={cx} cy={cy} age={age} scale={scale} />;
    case Species.Moss:
      return <MossSVG cx={cx} cy={cy} age={age} scale={scale} />;
    case Species.VoidFlower:
      return <VoidFlowerSVG cx={cx} cy={cy} age={age} scale={scale} />;
    case Species.EchoShroom:
      return <EchoShroomSVG cx={cx} cy={cy} age={age} scale={scale} />;
  }
}

function LianeSVG({ cx, cy, age, scale }: { cx: number; cy: number; age: number; scale: number }) {
  return (
    <g transform={`translate(${cx},${cy}) scale(${scale})`}>
      {/* Central stem */}
      <line x1={0} y1={8} x2={0} y2={-4} stroke="url(#plant-liane)" strokeWidth={2.5} strokeLinecap="round" />
      {age >= 1 && (
        <>
          <path d="M0,-4 Q-10,-14 -8,-20" fill="none" stroke="url(#plant-liane)" strokeWidth={2} strokeLinecap="round" />
          <ellipse cx={-9} cy={-21} rx={3} ry={2} fill="#6dd88a" opacity={0.8} transform="rotate(-30,-9,-21)" />
        </>
      )}
      {age >= 2 && (
        <>
          <path d="M0,0 Q12,-8 16,-16" fill="none" stroke="url(#plant-liane)" strokeWidth={1.8} strokeLinecap="round" />
          <ellipse cx={17} cy={-17} rx={3} ry={2} fill="#6dd88a" opacity={0.7} transform="rotate(25,17,-17)" />
          <path d="M0,4 Q-14,-2 -18,-10" fill="none" stroke="url(#plant-liane)" strokeWidth={1.5} strokeLinecap="round" />
          <ellipse cx={-19} cy={-11} rx={2.5} ry={1.8} fill="#5cc878" opacity={0.7} transform="rotate(-40,-19,-11)" />
        </>
      )}
      {age >= 3 && (
        <>
          <path d="M-8,-20 Q-18,-24 -22,-18" fill="none" stroke="#4caf6a" strokeWidth={1.3} strokeLinecap="round" />
          <path d="M16,-16 Q22,-20 20,-26" fill="none" stroke="#4caf6a" strokeWidth={1.3} strokeLinecap="round" />
          <circle cx={-22} cy={-17} r={2} fill="#8ce0a0" opacity={0.5} />
          <circle cx={20} cy={-27} r={2} fill="#8ce0a0" opacity={0.5} />
        </>
      )}
      {age === 0 && (
        <circle cx={0} cy={0} r={3.5} fill="#4caf6a" opacity={0.7} />
      )}
    </g>
  );
}

function MossSVG({ cx, cy, age, scale }: { cx: number; cy: number; age: number; scale: number }) {
  const basePositions = [
    { x: 0, y: 0, r: 4 },
    { x: -6, y: -4, r: 3 },
    { x: 6, y: -3, r: 3.5 },
    { x: -3, y: 5, r: 3 },
    { x: 5, y: 5, r: 2.5 },
    { x: -9, y: 2, r: 2.5 },
    { x: 9, y: 1, r: 2 },
    { x: 0, y: -8, r: 2.5 },
    { x: -5, y: 8, r: 2 },
  ];

  const visibleCount = age === 0 ? 1 : age === 1 ? 3 : age === 2 ? 6 : 9;
  const circles = basePositions.slice(0, visibleCount);

  return (
    <g transform={`translate(${cx},${cy}) scale(${scale})`}>
      {circles.map((c, i) => (
        <circle
          key={i}
          cx={c.x}
          cy={c.y}
          r={c.r}
          fill="url(#plant-moss)"
          opacity={0.6 + (age * 0.1)}
        />
      ))}
      {age >= 2 && circles.slice(0, 3).map((c, i) => (
        <circle
          key={`glow-${i}`}
          cx={c.x}
          cy={c.y}
          r={c.r + 1.5}
          fill="none"
          stroke="#4aad6a"
          strokeWidth={0.5}
          opacity={0.3}
        />
      ))}
    </g>
  );
}

function VoidFlowerSVG({ cx, cy, age, scale }: { cx: number; cy: number; age: number; scale: number }) {
  const petalCount = age === 0 ? 0 : age === 1 ? 3 : age === 2 ? 5 : 6;
  const petalLength = age <= 1 ? 8 : age === 2 ? 12 : 15;

  return (
    <g transform={`translate(${cx},${cy}) scale(${scale})`}>
      {/* Petals */}
      {Array.from({ length: petalCount }).map((_, i) => {
        const angle = (i / petalCount) * Math.PI * 2 - Math.PI / 2;
        const px = Math.cos(angle) * petalLength;
        const py = Math.sin(angle) * petalLength;
        const cpx = Math.cos(angle + 0.3) * petalLength * 0.6;
        const cpy = Math.sin(angle + 0.3) * petalLength * 0.6;
        return (
          <path
            key={i}
            d={`M0,0 Q${cpx},${cpy} ${px},${py}`}
            fill="none"
            stroke="url(#plant-voidflower)"
            strokeWidth={2.2}
            strokeLinecap="round"
            opacity={0.8}
          />
        );
      })}
      {/* Center core */}
      <circle cx={0} cy={0} r={age === 0 ? 4 : 3.5} fill="url(#plant-voidflower)" opacity={0.9} />
      {age >= 3 && (
        <circle cx={0} cy={0} r={18} fill="none" stroke="#d4a8f0" strokeWidth={0.8} opacity={0.25} />
      )}
      {/* Inner glow for age 2+ */}
      {age >= 2 && (
        <circle cx={0} cy={0} r={2} fill="#e8d0f8" opacity={0.6} />
      )}
    </g>
  );
}

function EchoShroomSVG({ cx, cy, age, scale }: { cx: number; cy: number; age: number; scale: number }) {
  const capWidth = 8 + age * 3;
  const capHeight = 5 + age * 1.5;

  return (
    <g transform={`translate(${cx},${cy}) scale(${scale})`}>
      {/* Stem */}
      <line x1={0} y1={10} x2={0} y2={-2} stroke="#7a88b8" strokeWidth={2} strokeLinecap="round" />
      {/* Cap (elliptical dome) */}
      <ellipse cx={0} cy={-2 - capHeight * 0.3} rx={capWidth} ry={capHeight}
        fill="url(#plant-echoshroom)" opacity={0.85} />
      {/* Cap highlight */}
      <ellipse cx={-capWidth * 0.2} cy={-2 - capHeight * 0.6} rx={capWidth * 0.4} ry={capHeight * 0.3}
        fill="rgba(200,210,240,0.2)" />
      {/* Echo waves */}
      {age >= 1 && (
        <circle cx={0} cy={0} r={14} fill="none" stroke="#8090c8" strokeWidth={0.7} opacity={0.25} />
      )}
      {age >= 2 && (
        <circle cx={0} cy={0} r={19} fill="none" stroke="#8090c8" strokeWidth={0.5} opacity={0.18} />
      )}
      {age >= 3 && (
        <circle cx={0} cy={0} r={24} fill="none" stroke="#a0b0e8" strokeWidth={0.5} opacity={0.12} />
      )}
    </g>
  );
}

/* ── Age badge (orbital diamonds) ── */

function AgeBadge({ age, cx, cy, color }: { age: number; cx: number; cy: number; color: string }) {
  if (age === 0) {
    return <circle cx={cx - 22} cy={cy - 22} r={2.5} fill={color} opacity={0.5} />;
  }

  if (age >= 4) {
    return (
      <circle cx={cx - 22} cy={cy - 22} r={6} fill="none" stroke={color} strokeWidth={1.5} opacity={0.7} />
    );
  }

  const diamonds = [];
  const spacing = 7;
  const startX = cx - 22 - ((age - 1) * spacing) / 2;

  for (let i = 0; i < age; i++) {
    const dx = startX + i * spacing;
    const dy = cy - 22;
    diamonds.push(
      <polygon
        key={i}
        points={`${dx},${dy - 3.5} ${dx + 2.5},${dy} ${dx},${dy + 3.5} ${dx - 2.5},${dy}`}
        fill={color}
        opacity={0.8}
      />,
    );
  }

  return <g>{diamonds}</g>;
}

export { CELL_SIZE };
