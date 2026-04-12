import type { Cell, ClientGameState } from '@jardins/shared';
import { TerrainType, TimeState, Species, AGE_NAMES } from '@jardins/shared';
import { SPECIES_NAMES } from './Icons';

interface CellInfoPanelProps {
  cell: Cell;
  myPlayerId: string;
  players: ClientGameState['players'];
}

const TERRAIN_NAMES: Record<TerrainType, string> = {
  [TerrainType.Earth]: 'Terre',
  [TerrainType.Water]: 'Eau',
  [TerrainType.Stone]: 'Pierre',
  [TerrainType.Mist]: 'Brume',
  [TerrainType.FertileVoid]: 'Vide fertile',
};

const TERRAIN_DESCRIPTIONS: Record<TerrainType, string> = {
  [TerrainType.Earth]: 'Terrain neutre, croissance normale.',
  [TerrainType.Water]: 'Favorise certaines especes. Support pour certaines Floraisons.',
  [TerrainType.Stone]: 'Croissance rigide. Bonne base pour la fixation.',
  [TerrainType.Mist]: 'Terrain instable. Favorise les interactions d\'echo et de copie.',
  [TerrainType.FertileVoid]: 'Rare et strategique. Terrain polyvalent.',
};

const TERRAIN_COLORS: Record<TerrainType, string> = {
  [TerrainType.Earth]: '#6b5340',
  [TerrainType.Water]: '#3a7ca5',
  [TerrainType.Stone]: '#6a6e73',
  [TerrainType.Mist]: '#7a6a9e',
  [TerrainType.FertileVoid]: '#3a9a7a',
};

const TIME_STATE_FULL: Record<TimeState, { name: string; desc: string; color: string }> = {
  [TimeState.Normal]: { name: 'Normal', desc: 'Evolution d\'age : +1 par tour', color: '#8a9a8e' },
  [TimeState.Accelerated]: { name: 'Accelere', desc: 'Evolution d\'age : +2 par tour', color: '#4de8c2' },
  [TimeState.Slowed]: { name: 'Ralenti', desc: 'Evolution d\'age : +0 (pas de croissance)', color: '#9b7ec8' },
  [TimeState.Reversed]: { name: 'Inverse', desc: 'Evolution d\'age : -1 (regression)', color: '#c47ef0' },
  [TimeState.Frozen]: { name: 'Fige', desc: 'Aucun changement d\'age ni transformation', color: '#a8e0f7' },
};

const SPECIES_DESCRIPTIONS: Record<Species, string> = {
  [Species.Liane]: 'Extension et connexion. Se propage a maturite. Valorise les chaines.',
  [Species.Moss]: 'Stabilisation et economie. Genere de la Seve a maturite. Consolide les zones.',
  [Species.VoidFlower]: 'Pivot de victoire. Accorde des points d\'Harmonie a l\'age 3. Vulnerable.',
  [Species.EchoShroom]: 'Perturbation et recyclage. Copie les effets des plantes voisines adverses.',
};

export function CellInfoPanel({ cell, myPlayerId, players }: CellInfoPanelProps) {
  const terrainInfo = TERRAIN_NAMES[cell.terrain];
  const terrainDesc = TERRAIN_DESCRIPTIONS[cell.terrain];
  const terrainColor = TERRAIN_COLORS[cell.terrain];
  const timeInfo = TIME_STATE_FULL[cell.timeState];

  const ownerPlayer = cell.plant
    ? players.find((p) => p.id === cell.plant!.ownerId)
    : null;
  const isMyPlant = cell.plant?.ownerId === myPlayerId;

  return (
    <div className="cell-info-panel">
      <div className="cell-info-header">
        <span className="cell-info-coords">Case ({cell.x}, {cell.y})</span>
      </div>

      {/* Terrain */}
      <div className="cell-info-section">
        <div className="cell-info-row">
          <span className="cell-info-dot" style={{ background: terrainColor }} />
          <span className="cell-info-label">Terrain</span>
          <span className="cell-info-value">{terrainInfo}</span>
        </div>
        <p className="cell-info-desc">{terrainDesc}</p>
      </div>

      {/* Temporal state */}
      <div className="cell-info-section">
        <div className="cell-info-row">
          <span className="cell-info-dot" style={{ background: timeInfo.color }} />
          <span className="cell-info-label">Temps local</span>
          <span className="cell-info-value" style={{ color: timeInfo.color }}>{timeInfo.name}</span>
        </div>
        <p className="cell-info-desc">{timeInfo.desc}</p>
        {cell.temporalEffect && (
          <p className="cell-info-note">
            Expire dans {cell.temporalEffect.turnsRemaining} tour{cell.temporalEffect.turnsRemaining > 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Plant */}
      {cell.plant ? (
        <div className="cell-info-section cell-info-plant">
          <div className="cell-info-row">
            <span className="cell-info-dot" style={{ background: isMyPlant ? '#3ecfa5' : '#d4a843' }} />
            <span className="cell-info-label">Plante</span>
            <span className="cell-info-value">{SPECIES_NAMES[cell.plant.species] ?? cell.plant.species}</span>
          </div>
          <p className="cell-info-desc">{SPECIES_DESCRIPTIONS[cell.plant.species]}</p>

          <div className="cell-info-stats">
            <div className="cell-info-stat">
              <span className="cell-info-stat-label">Age</span>
              <span className="cell-info-stat-value">
                {cell.plant.age} — {AGE_NAMES[cell.plant.age] ?? '?'}
              </span>
            </div>
            <div className="cell-info-stat">
              <span className="cell-info-stat-label">Proprietaire</span>
              <span className="cell-info-stat-value" style={{ color: isMyPlant ? '#3ecfa5' : '#d4a843' }}>
                {isMyPlant ? 'Vous' : ownerPlayer?.name ?? 'Adversaire'}
              </span>
            </div>
            {cell.plant.hasRegressed && (
              <div className="cell-info-stat">
                <span className="cell-info-stat-label">Historique</span>
                <span className="cell-info-stat-value" style={{ color: '#c47ef0' }}>
                  A subi une regression
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="cell-info-section">
          <p className="cell-info-empty">Case inoccupee</p>
        </div>
      )}
    </div>
  );
}
