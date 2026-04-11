import { useState, useCallback, useMemo } from 'react';
import type {
  ClientGameState,
  GameAction,
} from '@jardins/shared';
import {
  ActionType,
  Species,
  BOARD_WIDTH,
  BOARD_HEIGHT,
} from '@jardins/shared';
import { Board } from './Board';
import { GameHUD } from './GameHUD';
import { ActionBar } from './ActionBar';
import { ActionLog } from './ActionLog';
import { CellInfoPanel } from './CellInfoPanel';
import { FloraisonGuide } from './FloraisonGuide';

interface GameProps {
  gameState: ClientGameState;
  myPlayerId: string;
  onSubmitTurn: (actions: [GameAction, GameAction]) => void;
  opponentDisconnected: boolean;
  onShowRules: () => void;
}

export function Game({ gameState, myPlayerId, onSubmitTurn, opponentDisconnected, onShowRules }: GameProps) {
  const [pendingActions, setPendingActions] = useState<GameAction[]>([]);
  const [selectedCell, setSelectedCell] = useState<{ x: number; y: number } | null>(null);
  const [currentActionType, setCurrentActionType] = useState<ActionType | null>(null);

  const isMyTurn = gameState.activePlayerId === myPlayerId;

  const [lastTurnNumber, setLastTurnNumber] = useState(gameState.turnNumber);
  if (gameState.turnNumber !== lastTurnNumber) {
    setPendingActions([]);
    setSelectedCell(null);
    setCurrentActionType(null);
    setLastTurnNumber(gameState.turnNumber);
  }

  const targetableCells = useMemo(() => {
    const set = new Set<string>();
    if (!isMyTurn || pendingActions.length >= 2 || !currentActionType) return set;

    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        const cell = gameState.board[y][x];
        switch (currentActionType) {
          case ActionType.Sow:
            if (!cell.plant) set.add(`${x},${y}`);
            break;
          case ActionType.AlterTime:
          case ActionType.Freeze:
            if (!cell.temporalEffect) set.add(`${x},${y}`);
            break;
          case ActionType.Harvest:
            if (cell.plant?.ownerId === myPlayerId) set.add(`${x},${y}`);
            break;
          case ActionType.Root:
            if (cell.plant?.ownerId === myPlayerId && !cell.plant.rooted) set.add(`${x},${y}`);
            break;
          case ActionType.Spread:
            if (cell.plant?.ownerId === myPlayerId && cell.plant.species === Species.EchoShroom)
              set.add(`${x},${y}`);
            break;
        }
      }
    }
    return set;
  }, [gameState, currentActionType, isMyTurn, myPlayerId, pendingActions.length]);

  const handleCellClick = useCallback(
    (x: number, y: number) => {
      setSelectedCell((prev) =>
        prev?.x === x && prev?.y === y ? null : { x, y },
      );
    },
    [],
  );

  const handleAddAction = useCallback(
    (action: GameAction) => {
      if (pendingActions.length >= 2) return;
      setPendingActions((prev) => [...prev, action]);
      setSelectedCell(null);
      setCurrentActionType(null);
    },
    [pendingActions.length],
  );

  const handleUndoAction = useCallback(() => {
    setPendingActions((prev) => prev.slice(0, -1));
  }, []);

  const handleSubmitTurn = useCallback(() => {
    if (pendingActions.length !== 2) return;
    onSubmitTurn(pendingActions as [GameAction, GameAction]);
    setPendingActions([]);
    setSelectedCell(null);
    setCurrentActionType(null);
  }, [pendingActions, onSubmitTurn]);

  const handleSelectAction = useCallback((actionType: ActionType | null) => {
    setCurrentActionType(actionType);
    setSelectedCell(null);
  }, []);

  const selectedCellData = selectedCell
    ? gameState.board[selectedCell.y]?.[selectedCell.x] ?? null
    : null;

  const me = gameState.players.find((p) => p.id === myPlayerId)!;

  return (
    <div className="game-layout">
      {opponentDisconnected && !gameState.isSolo && (
        <div className="disconnect-banner">Adversaire deconnecte -- en attente de reconnexion...</div>
      )}

      {/* Left sidebar: cell info + floraison guide */}
      <div className="game-sidebar left-sidebar">
        {selectedCellData ? (
          <CellInfoPanel
            cell={selectedCellData}
            myPlayerId={myPlayerId}
            players={gameState.players}
          />
        ) : (
          <div className="sidebar-placeholder">
            <p>Selectionnez une case pour voir ses details</p>
          </div>
        )}

        <FloraisonGuide player={me} />

        <button className="secondary rules-ingame-btn" onClick={onShowRules}>
          Regles du jeu
        </button>
      </div>

      {/* Center: HUD + Board + Actions */}
      <div className="game-main">
        <GameHUD gameState={gameState} myPlayerId={myPlayerId} />

        <Board
          gameState={gameState}
          myPlayerId={myPlayerId}
          selectedCell={selectedCell}
          targetableCells={targetableCells}
          onCellClick={handleCellClick}
        />

        <ActionBar
          gameState={gameState}
          myPlayerId={myPlayerId}
          pendingActions={pendingActions}
          selectedCell={selectedCell}
          onAddAction={handleAddAction}
          onUndoAction={handleUndoAction}
          onSubmitTurn={handleSubmitTurn}
          onSelectAction={handleSelectAction}
          currentActionType={currentActionType}
        />
      </div>

      {/* Right sidebar: action log */}
      <ActionLog actionLog={gameState.actionLog} />
    </div>
  );
}
