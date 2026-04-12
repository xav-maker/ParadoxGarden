import { v4 as uuid } from 'uuid';
import {
  type GameState,
  type Cell,
  Species,
  BOARD_WIDTH,
  BOARD_HEIGHT,
  SPECIES_TERRAIN_COMPATIBILITY,
} from '@jardins/shared';
import { getOrthogonalNeighbors } from './board.js';

/**
 * Phase D: Resolve stage effects for plants belonging to a specific player.
 */
export function resolveEffects(state: GameState, ownerId: string): string[] {
  const events: string[] = [];

  const plantsToProcess: { cell: Cell; x: number; y: number }[] = [];
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const cell = state.board[y][x];
      if (cell.plant && cell.plant.ownerId === ownerId) {
        plantsToProcess.push({ cell, x, y });
      }
    }
  }

  for (const { cell, x, y } of plantsToProcess) {
    if (!cell.plant) continue;
    const { species, age, ownerId } = cell.plant;

    switch (species) {
      case Species.Liane: {
        if (age === 2) {
          const neighbors = getOrthogonalNeighbors(state.board, x, y);
          for (const n of neighbors) {
            if (!n.plant && SPECIES_TERRAIN_COMPATIBILITY[Species.Liane].includes(n.terrain)) {
              n.plant = {
                id: uuid(),
                ownerId,
                species: Species.Liane,
                age: 0,
                hasRegressed: false,
              };
              events.push(`Liane propagated from (${x},${y}) to (${n.x},${n.y})`);
              break;
            }
          }
        }
        break;
      }
      case Species.Moss: {
        if (age === 2) {
          const player = state.players.find((p) => p.id === ownerId);
          if (player) {
            player.sap += 1;
            events.push(`Mature Moss at (${x},${y}) generated 1 sap`);
          }
        }
        break;
      }
      case Species.VoidFlower: {
        // VoidFlower at age 3 grants harmony points
        if (age === 3) {
          const player = state.players.find((p) => p.id === ownerId);
          if (player) {
            player.harmonyPoints += 2;
            events.push(`Specialized Void Flower at (${x},${y}) granted 2 harmony points`);
          }
        }
        break;
      }
      case Species.EchoShroom: {
        if (age >= 2) {
          const neighbors = getOrthogonalNeighbors(state.board, x, y);
          for (const n of neighbors) {
            if (n.plant && n.plant.ownerId !== ownerId && n.plant.species !== Species.EchoShroom) {
              const copiedSpecies = n.plant.species;
              events.push(`Echo Shroom at (${x},${y}) copied effect from ${copiedSpecies} at (${n.x},${n.y})`);
              state.echoCopiedThisTurn = true;
              if (copiedSpecies === Species.Moss) {
                const player = state.players.find((p) => p.id === ownerId);
                if (player) player.sap += 1;
              }
              break;
            }
          }
        }
        break;
      }
    }
  }

  return events;
}
