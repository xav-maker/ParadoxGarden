import { v4 as uuid } from 'uuid';
import {
  type GameState,
  type Player,
  type ClientGameState,
  type ClientPlayer,
  type ActionLogEntry,
  type FloraisonId,
  GamePhase,
  INITIAL_SAP,
  INITIAL_TIME_CHARGES,
  MAX_TURNS,
  ALL_FLORAISON_IDS,
  FLORAISON_DEFINITIONS,
} from '@jardins/shared';
import { generateBoard } from './board.js';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function dealObjectives(): [FloraisonId[], FloraisonId[]] {
  const shuffled = shuffle([...ALL_FLORAISON_IDS]);
  return [shuffled.slice(0, 3), shuffled.slice(2, 5)];
}

export function createGameState(
  gameId: string,
  player1Id: string,
  player1Name: string,
  player2Id: string,
  player2Name: string,
): GameState {
  const [obj1, obj2] = dealObjectives();

  const player1: Player = {
    id: player1Id,
    name: player1Name,
    sap: INITIAL_SAP,
    timeCharges: INITIAL_TIME_CHARGES,
    secretObjectives: obj1,
    harmonyPoints: 0,
    completedObjectives: [],
  };

  const player2: Player = {
    id: player2Id,
    name: player2Name,
    sap: INITIAL_SAP,
    timeCharges: INITIAL_TIME_CHARGES,
    secretObjectives: obj2,
    harmonyPoints: 0,
    completedObjectives: [],
  };

  return {
    gameId,
    board: generateBoard(),
    players: [player1, player2],
    activePlayerId: player1Id,
    turnNumber: 1,
    maxTurns: MAX_TURNS,
    phase: GamePhase.InProgress,
    winner: null,
    winReason: null,
    actionLog: [],
    echoCopiedThisTurn: false,
  };
}

export function toClientState(state: GameState, forPlayerId: string, isSolo?: boolean): ClientGameState {
  const clientPlayers = state.players.map((p): ClientPlayer => {
    const isMe = p.id === forPlayerId;
    return {
      ...p,
      secretObjectives: isMe ? p.secretObjectives : null,
      objectiveCategories: isMe
        ? p.secretObjectives.map((objId) => FLORAISON_DEFINITIONS[objId].category)
        : [],
    };
  }) as [ClientPlayer, ClientPlayer];

  return {
    ...state,
    players: clientPlayers,
    ...(isSolo !== undefined && { isSolo }),
  };
}

export function getActivePlayer(state: GameState): Player {
  return state.players.find((p) => p.id === state.activePlayerId)!;
}

export function getOpponent(state: GameState): Player {
  return state.players.find((p) => p.id !== state.activePlayerId)!;
}

export function switchTurn(state: GameState): void {
  const opponent = getOpponent(state);
  state.activePlayerId = opponent.id;
  state.turnNumber++;
}
