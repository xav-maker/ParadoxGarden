import {
  type GameState,
  type GameAction,
  ActionType,
  Species,
  BOARD_WIDTH,
  BOARD_HEIGHT,
  SPECIES_TERRAIN_COMPATIBILITY,
} from '@jardins/shared';
import { generateLegalActions, subtractCost, makePairs } from './actionGenerator.js';
import { simulatePair, evaluateSimulatedState } from './evaluation.js';
import {
  pickBestObjective,
  getObjectiveActions,
  getHarmonyActions,
  getDisruptionActions,
} from './strategy.js';
import { getCell } from '../game/board.js';

/**
 * Compute the best pair of actions for the AI player using
 * objective-directed strategy + simulation-based evaluation.
 */
export function computeAIActions(
  state: GameState,
  aiPlayerId: string,
): [GameAction, GameAction] {
  const player = state.players.find((p) => p.id === aiPlayerId);
  if (!player) return fallbackActions(state, aiPlayerId);

  const resources = { sap: player.sap, timeCharges: player.timeCharges };

  const objective = pickBestObjective(state, aiPlayerId);

  const objActions = getObjectiveActions(state, aiPlayerId, objective);
  const harmActions = getHarmonyActions(state, aiPlayerId);
  const disruptActions = getDisruptionActions(state, aiPlayerId);

  const allSingle = dedupActions([...objActions, ...harmActions, ...disruptActions]);
  const pairs = makePairs(allSingle, resources);

  if (pairs.length === 0) return fallbackActions(state, aiPlayerId);

  let bestPair = pairs[0];
  let bestScore = -Infinity;

  for (const pair of pairs) {
    const sim = simulatePair(state, pair);
    const score = evaluateSimulatedState(sim, aiPlayerId);
    if (score > bestScore) {
      bestScore = score;
      bestPair = pair;
    }
  }

  return bestPair;
}

function dedupActions(actions: GameAction[]): GameAction[] {
  const seen = new Set<string>();
  return actions.filter((a) => {
    const key = `${a.type}:${(a as any).x},${(a as any).y}:${(a as any).species ?? (a as any).targetState ?? ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function fallbackActions(state: GameState, aiPlayerId: string): [GameAction, GameAction] {
  const player = state.players.find((p) => p.id === aiPlayerId);
  const resources = player
    ? { sap: player.sap, timeCharges: player.timeCharges }
    : { sap: 0, timeCharges: 0 };

  const actions1 = generateLegalActions(state, aiPlayerId, resources);

  if (actions1.length === 0) return emergencyActions(state, aiPlayerId);

  const a1 = actions1[Math.floor(Math.random() * actions1.length)];
  const resources2 = subtractCost(resources, a1);
  const actions2 = generateLegalActions(state, aiPlayerId, resources2);

  if (actions2.length === 0) return [a1, a1];

  const a2 = actions2[Math.floor(Math.random() * actions2.length)];
  return [a1, a2];
}

function emergencyActions(state: GameState, aiPlayerId: string): [GameAction, GameAction] {
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const cell = getCell(state.board, x, y)!;
      if (cell.plant?.ownerId === aiPlayerId) {
        const harvestAction: GameAction = { type: ActionType.Harvest, x, y };
        for (let y2 = 0; y2 < BOARD_HEIGHT; y2++) {
          for (let x2 = 0; x2 < BOARD_WIDTH; x2++) {
            const cell2 = getCell(state.board, x2, y2)!;
            if (!cell2.plant) {
              for (const species of Object.values(Species)) {
                if (SPECIES_TERRAIN_COMPATIBILITY[species].includes(cell2.terrain)) {
                  return [harvestAction, { type: ActionType.Sow, x: x2, y: y2, species }];
                }
              }
            }
          }
        }
        return [harvestAction, harvestAction];
      }
    }
  }

  const sowActions: GameAction[] = [];
  for (let y = 0; y < BOARD_HEIGHT && sowActions.length < 2; y++) {
    for (let x = 0; x < BOARD_WIDTH && sowActions.length < 2; x++) {
      const cell = getCell(state.board, x, y)!;
      if (!cell.plant) {
        for (const species of Object.values(Species)) {
          if (SPECIES_TERRAIN_COMPATIBILITY[species].includes(cell.terrain)) {
            sowActions.push({ type: ActionType.Sow, x, y, species });
            break;
          }
        }
      }
    }
  }

  if (sowActions.length >= 2) return [sowActions[0], sowActions[1]] as [GameAction, GameAction];
  if (sowActions.length === 1) return [sowActions[0], sowActions[0]] as [GameAction, GameAction];

  return [
    { type: ActionType.Sow, x: 0, y: 0, species: Species.Liane },
    { type: ActionType.Sow, x: 1, y: 0, species: Species.Liane },
  ];
}
