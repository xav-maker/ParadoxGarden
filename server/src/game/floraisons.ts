import {
  type GameState,
  type Cell,
  Species,
  TerrainType,
  TimeState,
  FloraisonId,
  BOARD_WIDTH,
  BOARD_HEIGHT,
} from '@jardins/shared';
import { getCell, getOrthogonalNeighbors } from './board.js';

type FloraisonChecker = (state: GameState, playerId: string) => boolean;

/**
 * Nœud de Rosée:
 * - 4 Mousses matures (age >= 2) in a 2x2 square
 * - At least 2 on Water terrain
 * - At least 1 cell Frozen this turn or previous turn
 */
function checkNodeDeRosee(state: GameState, playerId: string): boolean {
  for (let y = 0; y < BOARD_HEIGHT - 1; y++) {
    for (let x = 0; x < BOARD_WIDTH - 1; x++) {
      const cells = [
        getCell(state.board, x, y)!,
        getCell(state.board, x + 1, y)!,
        getCell(state.board, x, y + 1)!,
        getCell(state.board, x + 1, y + 1)!,
      ];

      const allMossMature = cells.every(
        (c) => c.plant && c.plant.species === Species.Moss && c.plant.age >= 2 && c.plant.ownerId === playerId,
      );
      if (!allMossMature) continue;

      const waterCount = cells.filter((c) => c.terrain === TerrainType.Water).length;
      if (waterCount < 2) continue;

      const hasFrozen = cells.some(
        (c) => c.timeState === TimeState.Frozen || c.temporalEffect?.state === TimeState.Frozen,
      );
      if (!hasFrozen) continue;

      return true;
    }
  }
  return false;
}

/**
 * Couronne Retournée:
 * - 1 VoidFlower at age 2, with 4 orthogonal plants around it
 * - At least 2 of those 4 plants have regressed in age during the game
 */
function checkCouronneRetournee(state: GameState, playerId: string): boolean {
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const center = getCell(state.board, x, y)!;
      if (
        !center.plant ||
        center.plant.species !== Species.VoidFlower ||
        center.plant.age !== 2 ||
        center.plant.ownerId !== playerId
      ) {
        continue;
      }

      const neighbors = getOrthogonalNeighbors(state.board, x, y);
      if (neighbors.length < 4) continue;

      const occupiedNeighbors = neighbors.filter((n) => n.plant && n.plant.ownerId === playerId);
      if (occupiedNeighbors.length < 4) continue;

      const regressedCount = occupiedNeighbors.filter((n) => n.plant!.hasRegressed).length;
      if (regressedCount >= 2) return true;
    }
  }
  return false;
}

/**
 * Siphon des Brumes:
 * - 3 connected EchoShrooms (orthogonally)
 * - At least 2 on Mist terrain
 * - 1 echo copy effect happened this turn
 */
function checkSiphonDesBrumes(state: GameState, playerId: string): boolean {
  if (!state.echoCopiedThisTurn) return false;

  const visited = new Set<string>();

  function floodFill(x: number, y: number): { count: number; mistCount: number } {
    const key = `${x},${y}`;
    if (visited.has(key)) return { count: 0, mistCount: 0 };
    const cell = getCell(state.board, x, y);
    if (!cell || !cell.plant || cell.plant.species !== Species.EchoShroom || cell.plant.ownerId !== playerId) {
      return { count: 0, mistCount: 0 };
    }
    visited.add(key);
    let count = 1;
    let mistCount = cell.terrain === TerrainType.Mist ? 1 : 0;

    for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
      const result = floodFill(x + dx, y + dy);
      count += result.count;
      mistCount += result.mistCount;
    }
    return { count, mistCount };
  }

  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const cell = getCell(state.board, x, y)!;
      if (cell.plant?.species === Species.EchoShroom && cell.plant.ownerId === playerId) {
        const key = `${x},${y}`;
        if (!visited.has(key)) {
          const { count, mistCount } = floodFill(x, y);
          if (count >= 3 && mistCount >= 2) return true;
        }
      }
    }
  }

  return false;
}

/**
 * Spirale Dormante:
 * - Chain of Lianes of length >= 5 (connected orthogonally)
 * - One end is Frozen
 * - Age sequence along the chain is non-increasing
 */
function checkSpiraleDormante(state: GameState, playerId: string): boolean {
  const lianePositions: [number, number][] = [];
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const cell = getCell(state.board, x, y)!;
      if (cell.plant?.species === Species.Liane && cell.plant.ownerId === playerId) {
        lianePositions.push([x, y]);
      }
    }
  }

  // Build adjacency for lianes
  const adj = new Map<string, string[]>();
  for (const [x, y] of lianePositions) {
    const key = `${x},${y}`;
    adj.set(key, []);
    for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
      const nKey = `${x + dx},${y + dy}`;
      if (lianePositions.some(([lx, ly]) => lx === x + dx && ly === y + dy)) {
        adj.get(key)!.push(nKey);
      }
    }
  }

  // Find endpoints (degree 1) to start chain search
  const endpoints = lianePositions.filter(([x, y]) => {
    const key = `${x},${y}`;
    return (adj.get(key)?.length ?? 0) <= 1;
  });

  // DFS from each endpoint to find chains
  for (const [sx, sy] of endpoints) {
    const visited = new Set<string>();
    const chain: [number, number][] = [];

    function dfs(x: number, y: number): boolean {
      const key = `${x},${y}`;
      visited.add(key);
      chain.push([x, y]);

      if (chain.length >= 5) {
        if (isValidSpiraleChain(state, chain, playerId)) return true;
      }

      const neighbors = adj.get(key) ?? [];
      for (const nKey of neighbors) {
        if (!visited.has(nKey)) {
          const [nx, ny] = nKey.split(',').map(Number);
          if (dfs(nx, ny)) return true;
        }
      }

      chain.pop();
      visited.delete(key);
      return false;
    }

    if (dfs(sx, sy)) return true;
  }

  return false;
}

function isValidSpiraleChain(state: GameState, chain: [number, number][], playerId: string): boolean {
  const ages = chain.map(([x, y]) => getCell(state.board, x, y)!.plant!.age);

  // Non-increasing ages
  for (let i = 1; i < ages.length; i++) {
    if (ages[i] > ages[i - 1]) return false;
  }

  // Check if either end is frozen
  const firstCell = getCell(state.board, chain[0][0], chain[0][1])!;
  const lastCell = getCell(state.board, chain[chain.length - 1][0], chain[chain.length - 1][1])!;

  return firstCell.timeState === TimeState.Frozen || lastCell.timeState === TimeState.Frozen;
}

/**
 * Miroir Verdoyant:
 * - Symmetric structure of species (not ages) across a symmetry axis
 * - At least 2 cells with Reversed time state in the structure
 */
function checkMiroirVerdoyant(state: GameState, playerId: string): boolean {
  // Check horizontal symmetry (left-right mirror around center column)
  if (checkSymmetry(state, playerId, 'horizontal')) return true;
  // Check vertical symmetry (top-bottom mirror around center row)
  if (checkSymmetry(state, playerId, 'vertical')) return true;
  return false;
}

function checkSymmetry(state: GameState, playerId: string, axis: 'horizontal' | 'vertical'): boolean {
  let pairCount = 0;
  let reversedCount = 0;

  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const cell = getCell(state.board, x, y)!;
      if (!cell.plant || cell.plant.ownerId !== playerId) continue;

      const mirrorX = axis === 'horizontal' ? BOARD_WIDTH - 1 - x : x;
      const mirrorY = axis === 'vertical' ? BOARD_HEIGHT - 1 - y : y;

      if (mirrorX === x && mirrorY === y) continue;

      const mirrorCell = getCell(state.board, mirrorX, mirrorY);
      if (
        !mirrorCell?.plant ||
        mirrorCell.plant.ownerId !== playerId ||
        mirrorCell.plant.species !== cell.plant.species
      ) {
        continue;
      }

      pairCount++;
      if (cell.timeState === TimeState.Reversed) reversedCount++;
    }
  }

  // Need at least 4 symmetric pairs (8 matched cells = 4 plants per side) and 2 reversed cells
  return pairCount >= 8 && reversedCount >= 2;
}

// ── Registry ──

export const FLORAISON_CHECKERS: Record<FloraisonId, FloraisonChecker> = {
  [FloraisonId.NodeDeRosee]: checkNodeDeRosee,
  [FloraisonId.CouronneRetournee]: checkCouronneRetournee,
  [FloraisonId.SiphonDesBrumes]: checkSiphonDesBrumes,
  [FloraisonId.SpiraleDormante]: checkSpiraleDormante,
  [FloraisonId.MiroirVerdoyant]: checkMiroirVerdoyant,
};
