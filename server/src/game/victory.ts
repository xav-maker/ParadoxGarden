import {
  type GameState,
  Species,
  BOARD_WIDTH,
  BOARD_HEIGHT,
} from '@jardins/shared';
import { FLORAISON_CHECKERS } from './floraisons.js';

/**
 * Phase F: Check if the active player has completed any Floraison-Signe.
 */
export function checkFloraisons(state: GameState, playerId: string): boolean {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return false;

  for (const objectiveId of player.secretObjectives) {
    if (player.completedObjectives.includes(objectiveId)) continue;

    const checker = FLORAISON_CHECKERS[objectiveId];
    if (checker && checker(state, playerId)) {
      player.completedObjectives.push(objectiveId);
      return true;
    }
  }

  return false;
}

/**
 * Calculate harmony points at end of game.
 * Sources:
 * - +1 per mature plant (age >= 2)
 * - +2 per specialized plant (age === 3)
 * - +1 per controlled special terrain (non-Earth with own plant)
 * - +3 per partially completed floraison (based on objective progress)
 */
export function calculateHarmonyPoints(state: GameState): void {
  for (const player of state.players) {
    let points = player.harmonyPoints;

    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        const cell = state.board[y][x];
        if (!cell.plant || cell.plant.ownerId !== player.id) continue;

        if (cell.plant.age >= 2) points += 1;
        if (cell.plant.age === 3) points += 2;

        if (cell.terrain !== 'earth') points += 1;
      }
    }

    player.harmonyPoints = points;
  }
}
