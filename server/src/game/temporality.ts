import {
  type GameState,
  TimeState,
  BOARD_WIDTH,
  BOARD_HEIGHT,
} from '@jardins/shared';

/**
 * Phase E: Clean up expired temporal effects, resetting cells to Normal.
 */
export function cleanupTemporalEffects(state: GameState): string[] {
  const events: string[] = [];

  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const cell = state.board[y][x];
      if (cell.temporalEffect) {
        cell.temporalEffect.turnsRemaining--;
        if (cell.temporalEffect.turnsRemaining <= 0) {
          events.push(`Temporal effect ${cell.timeState} expired at (${x},${y})`);
          cell.temporalEffect = null;
          cell.timeState = TimeState.Normal;
        }
      }
    }
  }

  return events;
}
