import {
  type GameState,
  type GameAction,
  ActionType,
  Species,
  TimeState,
  BOARD_WIDTH,
  BOARD_HEIGHT,
  ACTION_COSTS,
  SPECIES_TERRAIN_COMPATIBILITY,
} from '@jardins/shared';
import { getCell } from '../game/board.js';

export interface Resources {
  sap: number;
  timeCharges: number;
}

/**
 * Generate all legal single actions for the given player/resources.
 */
export function generateLegalActions(
  state: GameState,
  playerId: string,
  resources: Resources,
): GameAction[] {
  const actions: GameAction[] = [];

  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const cell = getCell(state.board, x, y)!;

      if (!cell.plant && resources.sap >= ACTION_COSTS[ActionType.Sow].sap) {
        for (const species of Object.values(Species)) {
          if (SPECIES_TERRAIN_COMPATIBILITY[species].includes(cell.terrain)) {
            actions.push({ type: ActionType.Sow, x, y, species });
          }
        }
      }

      if (!cell.temporalEffect && resources.timeCharges >= ACTION_COSTS[ActionType.AlterTime].timeCharges) {
        for (const targetState of [TimeState.Accelerated, TimeState.Slowed, TimeState.Reversed] as const) {
          actions.push({ type: ActionType.AlterTime, x, y, targetState });
        }
      }

      if (cell.plant?.ownerId === playerId && !cell.temporalEffect && resources.sap >= ACTION_COSTS[ActionType.Freeze].sap) {
        actions.push({ type: ActionType.Freeze, x, y });
      }

      if (cell.plant?.ownerId === playerId) {
        actions.push({ type: ActionType.Harvest, x, y });
      }

      if (
        cell.plant?.ownerId === playerId &&
        cell.plant.species === Species.EchoShroom &&
        resources.sap >= ACTION_COSTS[ActionType.Spread].sap
      ) {
        actions.push({ type: ActionType.Spread, x, y });
      }
    }
  }

  return actions;
}

/**
 * Subtract action cost from resources (returns new resources object).
 */
export function subtractCost(resources: Resources, action: GameAction): Resources {
  const cost = ACTION_COSTS[action.type];
  if (action.type === ActionType.Harvest) {
    return { sap: resources.sap + 1, timeCharges: resources.timeCharges };
  }
  return {
    sap: resources.sap - cost.sap,
    timeCharges: resources.timeCharges - cost.timeCharges,
  };
}

/**
 * Check if a player can afford a given action.
 */
export function canAfford(resources: Resources, action: GameAction): boolean {
  if (action.type === ActionType.Harvest) return true;
  const cost = ACTION_COSTS[action.type];
  return resources.sap >= cost.sap && resources.timeCharges >= cost.timeCharges;
}

/**
 * Build valid action pairs from a list of candidate single actions,
 * checking resource constraints and avoiding same-action duplicates.
 */
export function makePairs(
  actions: GameAction[],
  resources: Resources,
): [GameAction, GameAction][] {
  const pairs: [GameAction, GameAction][] = [];
  const seen = new Set<string>();

  for (let i = 0; i < actions.length; i++) {
    if (!canAfford(resources, actions[i])) continue;
    const remaining = subtractCost(resources, actions[i]);

    for (let j = 0; j < actions.length; j++) {
      if (i === j) continue;
      if (!canAfford(remaining, actions[j])) continue;
      if (isSameAction(actions[i], actions[j])) continue;

      const key = actionKey(actions[i]) + '|' + actionKey(actions[j]);
      if (seen.has(key)) continue;
      seen.add(key);
      pairs.push([actions[i], actions[j]]);
    }
  }

  return pairs;
}

function actionKey(a: GameAction): string {
  return `${a.type}:${(a as any).x},${(a as any).y}:${(a as any).species ?? (a as any).targetState ?? ''}`;
}

function isSameAction(a: GameAction, b: GameAction): boolean {
  return actionKey(a) === actionKey(b);
}
