import {
  type GameState,
  type GameAction,
  type Cell,
  type Player,
  Species,
  TerrainType,
  TimeState,
  FloraisonId,
  BOARD_WIDTH,
  BOARD_HEIGHT,
} from '@jardins/shared';
import { getCell, getOrthogonalNeighbors } from '../game/board.js';
import { applyAction } from '../game/actions.js';
import { resolveGrowth } from '../game/growth.js';
import { resolveEffects } from '../game/effects.js';

// ── State cloning & simulation ──

export function cloneState(state: GameState): GameState {
  const board: Cell[][] = state.board.map((row) =>
    row.map((cell) => ({
      ...cell,
      plant: cell.plant ? { ...cell.plant } : null,
      temporalEffect: cell.temporalEffect ? { ...cell.temporalEffect } : null,
    })),
  );

  const players = state.players.map((p) => ({
    ...p,
    secretObjectives: [...p.secretObjectives],
    completedObjectives: [...p.completedObjectives],
  })) as [Player, Player];

  return { ...state, board, players, actionLog: [] };
}

export function simulatePair(state: GameState, pair: [GameAction, GameAction]): GameState {
  const clone = cloneState(state);
  try {
    applyAction(clone, pair[0]);
    applyAction(clone, pair[1]);
  } catch {
    return clone;
  }
  resolveGrowth(clone);
  resolveEffects(clone);
  return clone;
}

// ── Unified evaluation ──

export function evaluateSimulatedState(
  simulated: GameState,
  playerId: string,
): number {
  const phase = getPhaseWeights(simulated);
  const opponentId = simulated.players.find((p) => p.id !== playerId)!.id;

  const board = boardValue(simulated, playerId);
  const floraison = ownFloraisonScore(simulated, playerId);
  const threat = opponentThreatScore(simulated, opponentId);

  return board * phase.board + floraison * phase.floraison - threat * phase.threat;
}

interface PhaseWeights {
  board: number;
  floraison: number;
  threat: number;
}

function getPhaseWeights(state: GameState): PhaseWeights {
  const progress = state.turnNumber / (state.maxTurns * 2);
  if (progress < 0.3) return { board: 1.0, floraison: 0.6, threat: 0.2 };
  if (progress < 0.6) return { board: 0.6, floraison: 1.0, threat: 0.6 };
  return { board: 0.8, floraison: 1.2, threat: 0.9 };
}

// ── Board value ──

function boardValue(state: GameState, playerId: string): number {
  const player = state.players.find((p) => p.id === playerId)!;
  const opponent = state.players.find((p) => p.id !== playerId)!;
  let score = 0;

  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const cell = state.board[y][x];
      if (!cell.plant) continue;

      if (cell.plant.ownerId === playerId) {
        score += 2 + cell.plant.age * 1.5;
        if (cell.terrain !== TerrainType.Earth) score += 2;
        if (cell.plant.age >= 2) score += 2;
      } else {
        score -= 1 + (cell.plant.age >= 2 ? 1.5 : 0);
      }
    }
  }

  score += player.sap * 0.5 + player.timeCharges * 0.8;
  score += (player.harmonyPoints - opponent.harmonyPoints) * 1.5;
  return score;
}

// ── Own floraison scoring (uses known secret objectives) ──

function ownFloraisonScore(state: GameState, playerId: string): number {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return 0;

  let score = 0;
  for (const objId of player.secretObjectives) {
    if (player.completedObjectives.includes(objId)) continue;
    const prox = floraisonProximity(state, playerId, objId);
    score += prox * 30;
    if (prox > 0.7) score += 15;
    if (prox > 0.9) score += 25;
  }
  return score;
}

// ── Opponent threat (blind: checks all floraisons since objectives are hidden) ──

function opponentThreatScore(state: GameState, opponentId: string): number {
  let threat = 0;
  for (const objId of Object.values(FloraisonId)) {
    const prox = floraisonProximity(state, opponentId, objId);
    threat += prox * 15;
    if (prox > 0.7) threat += 10;
    if (prox > 0.9) threat += 20;
  }
  return threat;
}

function floraisonProximity(state: GameState, playerId: string, objId: FloraisonId): number {
  switch (objId) {
    case FloraisonId.NodeDeRosee:
      return nodeProximity(state, playerId);
    case FloraisonId.CouronneRetournee:
      return couronneProximity(state, playerId);
    case FloraisonId.SiphonDesBrumes:
      return siphonProximity(state, playerId);
    case FloraisonId.SpiraleDormante:
      return spiraleProximity(state, playerId);
    case FloraisonId.MiroirVerdoyant:
      return miroirProximity(state, playerId);
    default:
      return 0;
  }
}

function nodeProximity(state: GameState, playerId: string): number {
  let best = 0;
  for (let y = 0; y < BOARD_HEIGHT - 1; y++) {
    for (let x = 0; x < BOARD_WIDTH - 1; x++) {
      const cells = [
        getCell(state.board, x, y)!,
        getCell(state.board, x + 1, y)!,
        getCell(state.board, x, y + 1)!,
        getCell(state.board, x + 1, y + 1)!,
      ];
      const ownMoss = cells.filter(
        (c) => c.plant?.ownerId === playerId && c.plant?.species === Species.Moss,
      );
      const mature = ownMoss.filter((c) => c.plant!.age >= 2);
      const waterCount = cells.filter((c) => c.terrain === TerrainType.Water).length;
      const hasFrozen = cells.some(
        (c) => c.timeState === TimeState.Frozen || c.temporalEffect?.state === TimeState.Frozen,
      );
      const s =
        (ownMoss.length / 4) * 0.35 +
        (mature.length / 4) * 0.35 +
        (Math.min(waterCount, 2) / 2) * 0.15 +
        (hasFrozen ? 0.15 : 0);
      if (s > best) best = s;
    }
  }
  return best;
}

function couronneProximity(state: GameState, playerId: string): number {
  let best = 0;
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const cell = getCell(state.board, x, y)!;
      const neighbors = getOrthogonalNeighbors(state.board, x, y);
      if (neighbors.length < 4) continue;
      const hasVF =
        cell.plant?.ownerId === playerId && cell.plant?.species === Species.VoidFlower;
      const isAge2 = hasVF && cell.plant!.age === 2;
      const own = neighbors.filter((n) => n.plant?.ownerId === playerId);
      const reg = own.filter((n) => n.plant!.hasRegressed).length;
      const s =
        (hasVF ? 0.25 : 0) +
        (isAge2 ? 0.15 : 0) +
        (own.length / 4) * 0.35 +
        (Math.min(reg, 2) / 2) * 0.25;
      if (s > best) best = s;
    }
  }
  return best;
}

function siphonProximity(state: GameState, playerId: string): number {
  const visited = new Set<string>();
  let bestSize = 0;
  let bestMist = 0;
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const c = getCell(state.board, x, y)!;
      if (c.plant?.ownerId !== playerId || c.plant?.species !== Species.EchoShroom) continue;
      const k = `${x},${y}`;
      if (visited.has(k)) continue;
      const r = floodShrooms(state.board, playerId, x, y, visited);
      if (r.count > bestSize) {
        bestSize = r.count;
        bestMist = r.mist;
      }
    }
  }
  return (
    (Math.min(bestSize, 3) / 3) * 0.45 +
    (Math.min(bestMist, 2) / 2) * 0.35 +
    (state.echoCopiedThisTurn ? 0.2 : 0)
  );
}

function floodShrooms(
  board: GameState['board'],
  playerId: string,
  sx: number,
  sy: number,
  visited: Set<string>,
): { count: number; mist: number } {
  let count = 0;
  let mist = 0;
  const stack: [number, number][] = [[sx, sy]];
  while (stack.length > 0) {
    const [x, y] = stack.pop()!;
    const k = `${x},${y}`;
    if (visited.has(k)) continue;
    const c = getCell(board, x, y);
    if (!c?.plant || c.plant.ownerId !== playerId || c.plant.species !== Species.EchoShroom)
      continue;
    visited.add(k);
    count++;
    if (c.terrain === TerrainType.Mist) mist++;
    for (const [dx, dy] of [
      [0, -1],
      [0, 1],
      [-1, 0],
      [1, 0],
    ])
      stack.push([x + dx, y + dy]);
  }
  return { count, mist };
}

function spiraleProximity(state: GameState, playerId: string): number {
  const lianes: [number, number][] = [];
  for (let y = 0; y < BOARD_HEIGHT; y++)
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const c = getCell(state.board, x, y)!;
      if (c.plant?.ownerId === playerId && c.plant?.species === Species.Liane)
        lianes.push([x, y]);
    }
  if (lianes.length === 0) return 0;

  const set = new Set(lianes.map(([x, y]) => `${x},${y}`));
  const adj = new Map<string, string[]>();
  for (const [x, y] of lianes) {
    const k = `${x},${y}`;
    const nb: string[] = [];
    for (const [dx, dy] of [
      [0, -1],
      [0, 1],
      [-1, 0],
      [1, 0],
    ]) {
      const nk = `${x + dx},${y + dy}`;
      if (set.has(nk)) nb.push(nk);
    }
    adj.set(k, nb);
  }

  let longest = 0;
  let endFrozen = false;
  let agesOk = false;

  const endpoints = lianes.filter(([x, y]) => (adj.get(`${x},${y}`)?.length ?? 0) <= 1);
  const starts = endpoints.length > 0 ? endpoints : [lianes[0]];

  for (const [sx, sy] of starts) {
    const visited = new Set<string>();
    const chain: [number, number][] = [];

    const dfs = (cx: number, cy: number): void => {
      const k = `${cx},${cy}`;
      visited.add(k);
      chain.push([cx, cy]);

      if (chain.length > longest) {
        longest = chain.length;
        const first = getCell(state.board, chain[0][0], chain[0][1])!;
        const last = getCell(state.board, chain[chain.length - 1][0], chain[chain.length - 1][1])!;
        endFrozen = first.timeState === TimeState.Frozen || last.timeState === TimeState.Frozen;
        const ages = chain.map(([px, py]) => getCell(state.board, px, py)!.plant!.age);
        agesOk = ages.every((a, i) => i === 0 || a <= ages[i - 1]);
      }

      for (const nk of adj.get(k) ?? []) {
        if (!visited.has(nk)) {
          const [nx, ny] = nk.split(',').map(Number);
          dfs(nx, ny);
        }
      }
      chain.pop();
      visited.delete(k);
    };

    dfs(sx, sy);
  }

  return (
    (Math.min(longest, 5) / 5) * 0.45 + (endFrozen ? 0.3 : 0) + (agesOk ? 0.25 : 0)
  );
}

function miroirProximity(state: GameState, playerId: string): number {
  let best = 0;
  for (const axis of ['h', 'v'] as const) {
    let pairs = 0;
    let rev = 0;
    for (let y = 0; y < BOARD_HEIGHT; y++)
      for (let x = 0; x < BOARD_WIDTH; x++) {
        const c = getCell(state.board, x, y)!;
        if (!c.plant || c.plant.ownerId !== playerId) continue;
        const mx = axis === 'h' ? BOARD_WIDTH - 1 - x : x;
        const my = axis === 'v' ? BOARD_HEIGHT - 1 - y : y;
        if (mx === x && my === y) continue;
        const mc = getCell(state.board, mx, my);
        if (mc?.plant?.ownerId === playerId && mc.plant.species === c.plant.species) {
          pairs++;
          if (c.timeState === TimeState.Reversed) rev++;
        }
      }
    const s =
      (Math.min(pairs, 8) / 8) * 0.4 +
      (Math.min(rev, 2) / 2) * 0.35 +
      Math.max(0, 1 - 0) * 0.25;
    if (s > best) best = s;
  }
  return best;
}
