import {
  type GameState,
  type Cell,
  TimeState,
  TIME_STATE_AGE_DELTA,
  MAX_AGE,
  BOARD_WIDTH,
  BOARD_HEIGHT,
} from '@jardins/shared';

/**
 * Phase C: Resolve growth for plants belonging to a specific player.
 * Each plant ages according to the temporal state of its cell.
 */
export function resolveGrowth(state: GameState, ownerId: string): string[] {
  const events: string[] = [];

  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const cell = state.board[y][x];
      if (!cell.plant || cell.plant.ownerId !== ownerId) continue;

      if (cell.timeState === TimeState.Frozen) {
        continue;
      }

      const delta = TIME_STATE_AGE_DELTA[cell.timeState] ?? 1;

      const oldAge = cell.plant.age;
      let newAge = cell.plant.age + delta;

      if (newAge < 0) newAge = 0;

      if (delta < 0 && newAge < oldAge) {
        cell.plant.hasRegressed = true;
      }

      const maxAge = MAX_AGE[cell.plant.species];
      if (newAge > maxAge) {
        events.push(`${cell.plant.species} at (${x},${y}) reached end of cycle and decomposed`);
        cell.plant = null;
        continue;
      }

      cell.plant.age = newAge;

      if (newAge !== oldAge) {
        events.push(`${cell.plant?.species} at (${x},${y}) aged ${oldAge} → ${newAge}`);
      }
    }
  }

  return events;
}
