import {
  type GameState,
  type GameAction,
  type ActionLogEntry,
  GamePhase,
  SAP_PER_TURN,
  TIME_CHARGE_INTERVAL,
  TIME_CHARGES_PER_GAIN,
} from '@jardins/shared';
import { getActivePlayer, switchTurn } from './GameState.js';
import { validateAction, applyAction } from './actions.js';
import { resolveGrowth } from './growth.js';
import { resolveEffects } from './effects.js';
import { cleanupTemporalEffects } from './temporality.js';
import { checkFloraisons, calculateHarmonyPoints } from './victory.js';

export interface TurnResult {
  success: boolean;
  error?: string;
}

export function resolveTurn(
  state: GameState,
  playerId: string,
  actions: [GameAction, GameAction],
): TurnResult {
  if (state.phase !== GamePhase.InProgress) {
    return { success: false, error: 'Game is not in progress' };
  }
  if (state.activePlayerId !== playerId) {
    return { success: false, error: 'Not your turn' };
  }

  // Validate both actions first
  for (let i = 0; i < actions.length; i++) {
    const err = validateAction(state, actions[i], i);
    if (err) {
      return { success: false, error: `Action ${i + 1}: ${err}` };
    }
  }

  // Phase A: Resource gain
  const player = getActivePlayer(state);
  player.sap += SAP_PER_TURN;
  const playerTurnNumber = Math.ceil(state.turnNumber / 2);
  if (playerTurnNumber % TIME_CHARGE_INTERVAL === 0) {
    player.timeCharges += TIME_CHARGES_PER_GAIN;
  }

  // Phase B: Apply player actions
  const actionEvents: string[] = [];
  for (const action of actions) {
    const events = applyAction(state, action);
    actionEvents.push(...events);
  }

  // Phases C-D run once per round (after both players have acted)
  const isRoundEnd = state.turnNumber % 2 === 0;
  let growthEvents: string[] = [];
  let effectEvents: string[] = [];

  if (isRoundEnd) {
    // Reset echo flag before effects so it reflects this round only
    state.echoCopiedThisTurn = false;

    // Phase C: Growth
    growthEvents = resolveGrowth(state);

    // Phase D: Stage effects
    effectEvents = resolveEffects(state);
  }

  // Phase F: Check victory (before cleanup so temporal states remain visible for floraisons)
  const floraisonWin = checkFloraisons(state, playerId);

  // Phase E: Cleanup temporal effects (once per round, after victory check)
  let cleanupEvents: string[] = [];
  if (isRoundEnd) {
    cleanupEvents = cleanupTemporalEffects(state);
  }

  // Log entry
  const logEntry: ActionLogEntry = {
    turnNumber: state.turnNumber,
    playerId,
    actions: [...actions],
    growthEvents: [...growthEvents, ...cleanupEvents],
    effectEvents,
    timestamp: Date.now(),
  };
  state.actionLog.push(logEntry);
  if (floraisonWin) {
    state.phase = GamePhase.Finished;
    state.winner = playerId;
    state.winReason = 'floraison';
    return { success: true };
  }

  // Check if max turns reached (each player gets maxTurns turns total, so total turn count = maxTurns * 2)
  if (state.turnNumber >= state.maxTurns * 2) {
    calculateHarmonyPoints(state);
    state.phase = GamePhase.Finished;
    const [p1, p2] = state.players;
    if (p1.harmonyPoints > p2.harmonyPoints) {
      state.winner = p1.id;
    } else if (p2.harmonyPoints > p1.harmonyPoints) {
      state.winner = p2.id;
    }
    state.winReason = 'harmony';
    return { success: true };
  }

  // Switch turn
  switchTurn(state);

  return { success: true };
}
