import { useCallback, useMemo, type ReactNode } from 'react';
import {
  type GameAction,
  type ClientGameState,
  type Cell,
  ActionType,
  Species,
  TimeState,
  ACTION_COSTS,
  SPECIES_TERRAIN_COMPATIBILITY,
} from '@jardins/shared';
import {
  SowIcon, AlterTimeIcon, FreezeIcon, HarvestIcon, SpreadIcon,
  SapIcon, TimeIcon,
  SPECIES_NAMES, TIME_STATE_NAMES,
} from './Icons';

interface ActionBarProps {
  gameState: ClientGameState;
  myPlayerId: string;
  pendingActions: GameAction[];
  selectedCell: { x: number; y: number } | null;
  onAddAction: (action: GameAction) => void;
  onUndoAction: () => void;
  onSubmitTurn: () => void;
  onSelectAction: (actionType: ActionType | null) => void;
  currentActionType: ActionType | null;
}

const ACTION_DEFS: Record<ActionType, { label: string; icon: ReactNode; description: string }> = {
  [ActionType.Sow]: { label: 'Semer', icon: <SowIcon />, description: '1 Seve — Place une graine' },
  [ActionType.AlterTime]: { label: 'Alterer', icon: <AlterTimeIcon />, description: '1 Charge — Modifie le temps' },
  [ActionType.Freeze]: { label: 'Figer', icon: <FreezeIcon />, description: '1 Seve — Fige une plante alliee 2 tours' },
  [ActionType.Harvest]: { label: 'Recolter', icon: <HarvestIcon />, description: 'Gratuit — Detruit une plante alliee' },
  [ActionType.Spread]: { label: 'Disseminer', icon: <SpreadIcon />, description: 'Gratuit — Champignon uniquement' },
};

export function ActionBar({
  gameState,
  myPlayerId,
  pendingActions,
  selectedCell,
  onAddAction,
  onUndoAction,
  onSubmitTurn,
  onSelectAction,
  currentActionType,
}: ActionBarProps) {
  const me = gameState.players.find((p) => p.id === myPlayerId)!;
  const isMyTurn = gameState.activePlayerId === myPlayerId;
  const actionsLeft = 2 - pendingActions.length;

  const simulatedResources = useMemo(() => {
    let sap = me.sap;
    let timeCharges = me.timeCharges;
    for (const a of pendingActions) {
      const cost = ACTION_COSTS[a.type];
      sap -= cost.sap;
      timeCharges -= cost.timeCharges;
    }
    return { sap, timeCharges };
  }, [me, pendingActions]);

  const canAfford = useCallback(
    (actionType: ActionType) => {
      const cost = ACTION_COSTS[actionType];
      return (
        simulatedResources.sap >= cost.sap &&
        simulatedResources.timeCharges >= cost.timeCharges
      );
    },
    [simulatedResources],
  );

  if (!isMyTurn) {
    return (
      <div className="action-bar">
        <div className="waiting-message">En attente du tour adverse...</div>
      </div>
    );
  }

  return (
    <div className="action-bar">
      <div className="action-bar-header">
        <span>Actions restantes : {actionsLeft}/2</span>
        {pendingActions.length > 0 && (
          <span className="resources-after">
            Apres : <SapIcon size={12} />{simulatedResources.sap} <TimeIcon size={12} />{simulatedResources.timeCharges}
          </span>
        )}
      </div>

      {actionsLeft > 0 && (
        <div className="action-buttons">
          {Object.entries(ACTION_DEFS).map(([type, info]) => {
            const actionType = type as ActionType;
            const affordable = canAfford(actionType);
            const isActive = currentActionType === actionType;

            return (
              <button
                key={type}
                className={`action-btn ${isActive ? 'active' : ''} ${!affordable ? 'disabled' : ''}`}
                onClick={() => onSelectAction(isActive ? null : actionType)}
                disabled={!affordable}
                title={info.description}
              >
                <span className="action-icon">{info.icon}</span>
                <span className="action-label">{info.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {currentActionType && selectedCell && (
        <ActionConfigurator
          actionType={currentActionType}
          cell={gameState.board[selectedCell.y][selectedCell.x]}
          myPlayerId={myPlayerId}
          onConfirm={onAddAction}
        />
      )}

      <div className="pending-actions">
        {pendingActions.map((action, i) => (
          <div key={i} className="pending-action">
            <span className="action-icon">{ACTION_DEFS[action.type].icon}</span>
            <span>{ACTION_DEFS[action.type].label} ({(action as any).x},{(action as any).y})</span>
          </div>
        ))}
      </div>

      <div className="action-bar-footer">
        {pendingActions.length > 0 && (
          <button className="secondary" onClick={onUndoAction}>
            Annuler
          </button>
        )}
        {pendingActions.length === 2 && (
          <button className="submit-btn" onClick={onSubmitTurn}>
            Valider le tour
          </button>
        )}
      </div>
    </div>
  );
}

function ActionConfigurator({
  actionType,
  cell,
  myPlayerId,
  onConfirm,
}: {
  actionType: ActionType;
  cell: Cell;
  myPlayerId: string;
  onConfirm: (action: GameAction) => void;
}) {
  switch (actionType) {
    case ActionType.Sow: {
      if (cell.plant) return <div className="config-hint">Case occupee</div>;
      const compatible = Object.values(Species).filter((sp) =>
        SPECIES_TERRAIN_COMPATIBILITY[sp].includes(cell.terrain),
      );
      if (compatible.length === 0) return <div className="config-hint">Terrain incompatible</div>;

      return (
        <div className="action-config">
          <span className="config-label">Espece :</span>
          <div className="config-choices">
            {compatible.map((sp) => (
              <button
                key={sp}
                className="choice-btn"
                onClick={() => onConfirm({ type: ActionType.Sow, x: cell.x, y: cell.y, species: sp })}
              >
                {SPECIES_NAMES[sp] ?? sp}
              </button>
            ))}
          </div>
        </div>
      );
    }
    case ActionType.AlterTime: {
      if (cell.temporalEffect) return <div className="config-hint">Deja alteree ce tour</div>;
      const states = [TimeState.Accelerated, TimeState.Slowed, TimeState.Reversed] as const;
      return (
        <div className="action-config">
          <span className="config-label">Etat :</span>
          <div className="config-choices">
            {states.map((s) => (
              <button
                key={s}
                className="choice-btn"
                onClick={() => onConfirm({ type: ActionType.AlterTime, x: cell.x, y: cell.y, targetState: s })}
              >
                {TIME_STATE_NAMES[s] ?? s}
              </button>
            ))}
          </div>
        </div>
      );
    }
    case ActionType.Freeze:
      if (!cell.plant || cell.plant.ownerId !== myPlayerId) return <div className="config-hint">Pas de plante alliee ici</div>;
      if (cell.temporalEffect) return <div className="config-hint">Deja sous effet temporel</div>;
      return (
        <div className="action-config">
          <button onClick={() => onConfirm({ type: ActionType.Freeze, x: cell.x, y: cell.y })}>
            Figer cette plante
          </button>
        </div>
      );
    case ActionType.Harvest:
      if (!cell.plant || cell.plant.ownerId !== myPlayerId) return <div className="config-hint">Pas de plante alliee ici</div>;
      return (
        <div className="action-config">
          <button onClick={() => onConfirm({ type: ActionType.Harvest, x: cell.x, y: cell.y })}>
            Recolter
          </button>
        </div>
      );
    case ActionType.Spread:
      if (!cell.plant || cell.plant.ownerId !== myPlayerId || cell.plant.species !== Species.EchoShroom) {
        return <div className="config-hint">Champignon d'Echo allie requis</div>;
      }
      return (
        <div className="action-config">
          <button onClick={() => onConfirm({ type: ActionType.Spread, x: cell.x, y: cell.y })}>
            Disseminer
          </button>
        </div>
      );
    default:
      return null;
  }
}
