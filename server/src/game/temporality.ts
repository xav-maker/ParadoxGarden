import {
  type GameState,
  TimeState,
  BOARD_WIDTH,
  BOARD_HEIGHT,
} from '@jardins/shared';

/**
 * Phase E: Clean up expired temporal effects on cells owned by a specific player.
 * Only decrements/expires effects on cells containing a plant belonging to ownerId,
 * or on empty cells (shared cleanup).
 */
export function cleanupTemporalEffects(state: GameState, ownerId: string): string[] {
  const events: string[] = [];

  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const cell = state.board[y][x];
      if (!cell.temporalEffect) continue;

      const isOwnedByPlayer = cell.plant?.ownerId === ownerId;
      const isEmpty = !cell.plant;
      if (!isOwnedByPlayer && !isEmpty) continue;

      cell.temporalEffect.turnsRemaining--;
      if (cell.temporalEffect.turnsRemaining <= 0) {
        events.push(`Temporal effect ${cell.timeState} expired at (${x},${y})`);
        cell.temporalEffect = null;
        cell.timeState = TimeState.Normal;
      }
    }
  }

  return events;
}
