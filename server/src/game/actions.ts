import { v4 as uuid } from 'uuid';
import {
  type GameState,
  type GameAction,
  type Cell,
  ActionType,
  Species,
  TimeState,
  ACTION_COSTS,
  SPECIES_TERRAIN_COMPATIBILITY,
  BOARD_WIDTH,
  BOARD_HEIGHT,
} from '@jardins/shared';
import { getActivePlayer } from './GameState.js';
import { getCell, getOrthogonalNeighbors } from './board.js';

export function validateAction(state: GameState, action: GameAction, actionIndex: number): string | null {
  const player = getActivePlayer(state);
  const cost = ACTION_COSTS[action.type];

  if (action.type !== ActionType.Harvest) {
    if (player.sap < cost.sap) return 'Not enough sap';
    if (player.timeCharges < cost.timeCharges) return 'Not enough time charges';
  }

  const { x, y } = action as { x: number; y: number };
  if (x < 0 || x >= BOARD_WIDTH || y < 0 || y >= BOARD_HEIGHT) {
    return 'Position out of bounds';
  }

  const cell = getCell(state.board, x, y)!;

  switch (action.type) {
    case ActionType.Sow:
      return validateSow(state, cell, action.species, player.id);
    case ActionType.AlterTime:
      return validateAlterTime(cell);
    case ActionType.Freeze:
      return validateFreeze(cell, player.id);
    case ActionType.Harvest:
      return validateHarvest(cell, player.id);
    case ActionType.Spread:
      return validateSpread(state, cell, player.id);
    default:
      return 'Unknown action type';
  }
}

function validateSow(state: GameState, cell: Cell, species: Species, playerId: string): string | null {
  if (cell.plant) return 'Cell is already occupied';
  if (!SPECIES_TERRAIN_COMPATIBILITY[species].includes(cell.terrain)) {
    return `${species} cannot grow on ${cell.terrain}`;
  }
  return null;
}

function validateAlterTime(cell: Cell): string | null {
  if (cell.temporalEffect) return 'Cell already has a temporal alteration this turn';
  return null;
}

function validateFreeze(cell: Cell, playerId: string): string | null {
  if (!cell.plant) return 'No plant to freeze';
  if (cell.plant.ownerId !== playerId) return 'Cannot freeze opponent plant';
  if (cell.temporalEffect) return 'Cell already has a temporal alteration';
  return null;
}

function validateHarvest(cell: Cell, playerId: string): string | null {
  if (!cell.plant) return 'No plant to harvest';
  if (cell.plant.ownerId !== playerId) return 'Cannot harvest opponent plant';
  return null;
}

function validateSpread(state: GameState, cell: Cell, playerId: string): string | null {
  if (!cell.plant) return 'No plant to spread from';
  if (cell.plant.ownerId !== playerId) return 'Cannot spread from opponent plant';
  if (cell.plant.species !== Species.EchoShroom) return 'Only Echo Shrooms can spread';
  return null;
}

export function applyAction(state: GameState, action: GameAction): string[] {
  const player = getActivePlayer(state);
  const cost = ACTION_COSTS[action.type];
  const events: string[] = [];

  if (action.type !== ActionType.Harvest) {
    player.sap -= cost.sap;
    player.timeCharges -= cost.timeCharges;
  }

  const { x, y } = action as { x: number; y: number };
  const cell = getCell(state.board, x, y)!;

  switch (action.type) {
    case ActionType.Sow: {
      cell.plant = {
        id: uuid(),
        ownerId: player.id,
        species: action.species,
        age: 0,
        hasRegressed: false,
      };
      events.push(`${player.name} sowed ${action.species} at (${x},${y})`);
      break;
    }
    case ActionType.AlterTime: {
      cell.temporalEffect = { state: action.targetState, turnsRemaining: 2 };
      cell.timeState = action.targetState;
      events.push(`${player.name} altered time at (${x},${y}) to ${action.targetState}`);
      break;
    }
    case ActionType.Freeze: {
      cell.temporalEffect = { state: TimeState.Frozen, turnsRemaining: 4 };
      cell.timeState = TimeState.Frozen;
      events.push(`${player.name} froze plant at (${x},${y}) for 2 rounds`);
      break;
    }
    case ActionType.Harvest: {
      const species = cell.plant!.species;
      cell.plant = null;
      player.sap += 1;
      events.push(`${player.name} harvested ${species} at (${x},${y}), gained 1 sap`);
      break;
    }
    case ActionType.Spread: {
      const neighbors = getOrthogonalNeighbors(state.board, x, y);
      let spread = false;
      for (const neighbor of neighbors) {
        if (!neighbor.plant && SPECIES_TERRAIN_COMPATIBILITY[Species.EchoShroom].includes(neighbor.terrain)) {
          neighbor.plant = {
            id: uuid(),
            ownerId: player.id,
            species: Species.EchoShroom,
            age: 0,
            hasRegressed: false,
          };
          events.push(`Echo Shroom spread to (${neighbor.x},${neighbor.y})`);
          spread = true;
          break;
        }
      }
      if (!spread) {
        events.push(`Echo Shroom at (${x},${y}) could not spread`);
      }
      break;
    }
  }

  return events;
}
