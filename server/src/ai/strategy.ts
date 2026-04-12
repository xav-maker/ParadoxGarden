import {
  type GameState,
  type GameAction,
  ActionType,
  Species,
  TerrainType,
  TimeState,
  FloraisonId,
  BOARD_WIDTH,
  BOARD_HEIGHT,
  SPECIES_TERRAIN_COMPATIBILITY,
  ACTION_COSTS,
} from '@jardins/shared';
import { getCell, getOrthogonalNeighbors } from '../game/board.js';

// ── Objective selection ──

export function pickBestObjective(state: GameState, playerId: string): FloraisonId {
  const player = state.players.find((p) => p.id === playerId)!;
  let bestId = player.secretObjectives[0];
  let bestScore = -1;

  for (const objId of player.secretObjectives) {
    if (player.completedObjectives.includes(objId)) continue;
    const score = objectiveViability(state, playerId, objId);
    if (score > bestScore) {
      bestScore = score;
      bestId = objId;
    }
  }

  return bestId;
}

function objectiveViability(state: GameState, playerId: string, objId: FloraisonId): number {
  switch (objId) {
    case FloraisonId.NodeDeRosee:
      return nodeViability(state, playerId);
    case FloraisonId.CouronneRetournee:
      return couronneViability(state, playerId);
    case FloraisonId.SiphonDesBrumes:
      return siphonViability(state, playerId);
    case FloraisonId.SpiraleDormante:
      return spiraleViability(state, playerId);
    case FloraisonId.MiroirVerdoyant:
      return miroirViability(state, playerId);
    default:
      return 0;
  }
}

function nodeViability(state: GameState, playerId: string): number {
  let best = 0;
  for (let y = 0; y < BOARD_HEIGHT - 1; y++) {
    for (let x = 0; x < BOARD_WIDTH - 1; x++) {
      const cells = get2x2(state, x, y);
      const waterCount = cells.filter((c) => c.terrain === TerrainType.Water).length;
      if (waterCount < 2) continue;
      if (!cells.every((c) => SPECIES_TERRAIN_COMPATIBILITY[Species.Moss].includes(c.terrain)))
        continue;
      const ownMoss = cells.filter(
        (c) => c.plant?.ownerId === playerId && c.plant?.species === Species.Moss,
      );
      const mature = ownMoss.filter((c) => c.plant!.age >= 2);
      const score = mature.length * 3 + ownMoss.length * 2 + waterCount;
      if (score > best) best = score;
    }
  }
  return best;
}

function couronneViability(state: GameState, playerId: string): number {
  let best = 0;
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const neighbors = getOrthogonalNeighbors(state.board, x, y);
      if (neighbors.length < 4) continue;
      const cell = getCell(state.board, x, y)!;
      const hasVF =
        cell.plant?.ownerId === playerId && cell.plant?.species === Species.VoidFlower;
      const canVF =
        !cell.plant && SPECIES_TERRAIN_COMPATIBILITY[Species.VoidFlower].includes(cell.terrain);
      if (!hasVF && !canVF) continue;
      const own = neighbors.filter((n) => n.plant?.ownerId === playerId).length;
      const reg = neighbors.filter((n) => n.plant?.ownerId === playerId && n.plant?.hasRegressed)
        .length;
      let s = own * 2 + reg * 3;
      if (hasVF) s += 4 + (cell.plant!.age === 2 ? 3 : 0);
      else s += 1;
      if (s > best) best = s;
    }
  }
  return best;
}

function siphonViability(state: GameState, playerId: string): number {
  const visited = new Set<string>();
  let best = 0;
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const c = getCell(state.board, x, y)!;
      if (c.plant?.ownerId !== playerId || c.plant?.species !== Species.EchoShroom) continue;
      const k = `${x},${y}`;
      if (visited.has(k)) continue;
      const r = floodShrooms(state.board, playerId, x, y, visited);
      const s = Math.min(r.count, 3) * 3 + Math.min(r.mist, 2) * 2;
      if (s > best) best = s;
    }
  }
  let freeMist = 0;
  for (let y = 0; y < BOARD_HEIGHT; y++)
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const c = getCell(state.board, x, y)!;
      if (!c.plant && c.terrain === TerrainType.Mist) freeMist++;
    }
  return best + freeMist * 0.5;
}

function spiraleViability(state: GameState, playerId: string): number {
  let lianeCount = 0;
  let maxAdj = 0;
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const c = getCell(state.board, x, y)!;
      if (c.plant?.ownerId === playerId && c.plant?.species === Species.Liane) {
        lianeCount++;
        const adj = getOrthogonalNeighbors(state.board, x, y).filter(
          (n) => n.plant?.ownerId === playerId && n.plant?.species === Species.Liane,
        ).length;
        if (adj > maxAdj) maxAdj = adj;
      }
    }
  }
  return lianeCount * 2 + maxAdj;
}

function miroirViability(state: GameState, playerId: string): number {
  let best = 0;
  for (const axis of ['h', 'v'] as const) {
    let pairs = 0;
    let rev = 0;
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        const cell = getCell(state.board, x, y)!;
        if (!cell.plant || cell.plant.ownerId !== playerId) continue;
        const [mx, my] = mirror(x, y, axis);
        if (mx === x && my === y) continue;
        const mc = getCell(state.board, mx, my);
        if (mc?.plant?.ownerId === playerId && mc.plant.species === cell.plant.species) {
          pairs++;
          if (cell.timeState === TimeState.Reversed) rev++;
        }
      }
    }
    if (pairs * 2 + rev * 3 > best) best = pairs * 2 + rev * 3;
  }
  return best;
}

// ── Per-objective action generators (return prioritized single actions) ──

export function getObjectiveActions(
  state: GameState,
  playerId: string,
  objId: FloraisonId,
): GameAction[] {
  switch (objId) {
    case FloraisonId.NodeDeRosee:
      return nodeActions(state, playerId);
    case FloraisonId.CouronneRetournee:
      return couronneActions(state, playerId);
    case FloraisonId.SiphonDesBrumes:
      return siphonActions(state, playerId);
    case FloraisonId.SpiraleDormante:
      return spiraleActions(state, playerId);
    case FloraisonId.MiroirVerdoyant:
      return miroirActions(state, playerId);
    default:
      return [];
  }
}

function nodeActions(state: GameState, playerId: string): GameAction[] {
  const actions: GameAction[] = [];
  const seen = new Set<string>();

  for (let y = 0; y < BOARD_HEIGHT - 1; y++) {
    for (let x = 0; x < BOARD_WIDTH - 1; x++) {
      const cells = get2x2(state, x, y);
      if (cells.filter((c) => c.terrain === TerrainType.Water).length < 2) continue;
      if (!cells.every((c) => SPECIES_TERRAIN_COMPATIBILITY[Species.Moss].includes(c.terrain)))
        continue;

      for (const c of cells) {
        const k = `${c.x},${c.y}`;
        if (seen.has(k)) continue;
        seen.add(k);

        if (!c.plant) {
          actions.push({ type: ActionType.Sow, x: c.x, y: c.y, species: Species.Moss });
        } else if (c.plant.ownerId === playerId && c.plant.species === Species.Moss) {
          if (c.plant.age < 2 && !c.temporalEffect)
            actions.push({
              type: ActionType.AlterTime,
              x: c.x,
              y: c.y,
              targetState: TimeState.Accelerated,
            });
          if (c.plant.age >= 2 && !c.temporalEffect && c.plant.ownerId === playerId)
            actions.push({ type: ActionType.Freeze, x: c.x, y: c.y });
        }
      }
    }
  }
  return actions;
}

function couronneActions(state: GameState, playerId: string): GameAction[] {
  const actions: GameAction[] = [];

  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const neighbors = getOrthogonalNeighbors(state.board, x, y);
      if (neighbors.length < 4) continue;
      const cell = getCell(state.board, x, y)!;

      const hasVF =
        cell.plant?.ownerId === playerId && cell.plant?.species === Species.VoidFlower;
      const canVF =
        !cell.plant && SPECIES_TERRAIN_COMPATIBILITY[Species.VoidFlower].includes(cell.terrain);
      if (!hasVF && !canVF) continue;

      if (canVF) {
        actions.push({ type: ActionType.Sow, x, y, species: Species.VoidFlower });
      }
      if (hasVF && cell.plant!.age < 2 && !cell.temporalEffect) {
        actions.push({ type: ActionType.AlterTime, x, y, targetState: TimeState.Accelerated });
      }

      for (const n of neighbors) {
        if (!n.plant) {
          for (const sp of Object.values(Species)) {
            if (SPECIES_TERRAIN_COMPATIBILITY[sp].includes(n.terrain)) {
              actions.push({ type: ActionType.Sow, x: n.x, y: n.y, species: sp });
              break;
            }
          }
        } else if (n.plant.ownerId === playerId && !n.temporalEffect && !n.plant.hasRegressed) {
          actions.push({
            type: ActionType.AlterTime,
            x: n.x,
            y: n.y,
            targetState: TimeState.Reversed,
          });
        }
      }
    }
  }
  return dedupActions(actions);
}

function siphonActions(state: GameState, playerId: string): GameAction[] {
  const actions: GameAction[] = [];

  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const cell = getCell(state.board, x, y)!;

      if (
        !cell.plant &&
        SPECIES_TERRAIN_COMPATIBILITY[Species.EchoShroom].includes(cell.terrain)
      ) {
        const neighbors = getOrthogonalNeighbors(state.board, x, y);
        const nearShroom = neighbors.some(
          (n) => n.plant?.ownerId === playerId && n.plant?.species === Species.EchoShroom,
        );
        const isMist = cell.terrain === TerrainType.Mist;
        if (nearShroom || isMist) {
          actions.push({ type: ActionType.Sow, x, y, species: Species.EchoShroom });
        }
      }

      if (cell.plant?.ownerId === playerId && cell.plant?.species === Species.EchoShroom) {
        if (cell.plant.age < 2 && !cell.temporalEffect)
          actions.push({
            type: ActionType.AlterTime,
            x,
            y,
            targetState: TimeState.Accelerated,
          });
        if (ACTION_COSTS[ActionType.Spread].sap >= 0)
          actions.push({ type: ActionType.Spread, x, y });
      }
    }
  }
  return dedupActions(actions);
}

function spiraleActions(state: GameState, playerId: string): GameAction[] {
  const actions: GameAction[] = [];

  const lianes: { x: number; y: number; age: number }[] = [];
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const c = getCell(state.board, x, y)!;
      if (c.plant?.ownerId === playerId && c.plant?.species === Species.Liane) {
        lianes.push({ x, y, age: c.plant.age });
      }
    }
  }

  if (lianes.length === 0) {
    // Plant first Lianes on compatible terrain
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        const c = getCell(state.board, x, y)!;
        if (!c.plant && SPECIES_TERRAIN_COMPATIBILITY[Species.Liane].includes(c.terrain)) {
          actions.push({ type: ActionType.Sow, x, y, species: Species.Liane });
          if (actions.length >= 8) return actions;
        }
      }
    }
    return actions;
  }

  // Extend existing chain: sow adjacent to Lianes
  const lianeSet = new Set(lianes.map((l) => `${l.x},${l.y}`));
  for (const l of lianes) {
    const neighbors = getOrthogonalNeighbors(state.board, l.x, l.y);
    for (const n of neighbors) {
      if (
        !n.plant &&
        !lianeSet.has(`${n.x},${n.y}`) &&
        SPECIES_TERRAIN_COMPATIBILITY[Species.Liane].includes(n.terrain)
      ) {
        actions.push({ type: ActionType.Sow, x: n.x, y: n.y, species: Species.Liane });
      }
    }
  }

  // Find chain endpoints for freezing (degree <= 1)
  if (lianes.length >= 4) {
    for (const l of lianes) {
      const adjLianes = getOrthogonalNeighbors(state.board, l.x, l.y).filter((n) =>
        lianeSet.has(`${n.x},${n.y}`),
      );
      const cell = getCell(state.board, l.x, l.y)!;
      if (adjLianes.length <= 1 && !cell.temporalEffect) {
        actions.push({ type: ActionType.Freeze, x: l.x, y: l.y });
      }
    }
  }

  return dedupActions(actions);
}

function miroirActions(state: GameState, playerId: string): GameAction[] {
  const actions: GameAction[] = [];

  // Pick best axis
  let bestAxis: 'h' | 'v' = 'h';
  let bestPairs = 0;
  for (const axis of ['h', 'v'] as const) {
    let p = 0;
    for (let y = 0; y < BOARD_HEIGHT; y++)
      for (let x = 0; x < BOARD_WIDTH; x++) {
        const c = getCell(state.board, x, y)!;
        if (!c.plant || c.plant.ownerId !== playerId) continue;
        const [mx, my] = mirror(x, y, axis);
        if (mx === x && my === y) continue;
        const mc = getCell(state.board, mx, my);
        if (mc?.plant?.ownerId === playerId && mc.plant.species === c.plant.species) p++;
      }
    if (p > bestPairs) {
      bestPairs = p;
      bestAxis = axis;
    }
  }

  // Generate symmetric sow pairs and reversed actions
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const [mx, my] = mirror(x, y, bestAxis);
      if (mx === x && my === y) continue;
      const cell = getCell(state.board, x, y)!;
      const mc = getCell(state.board, mx, my)!;

      // Sow symmetric pair (both empty)
      if (!cell.plant && !mc.plant) {
        for (const sp of Object.values(Species)) {
          if (
            SPECIES_TERRAIN_COMPATIBILITY[sp].includes(cell.terrain) &&
            SPECIES_TERRAIN_COMPATIBILITY[sp].includes(mc.terrain)
          ) {
            actions.push({ type: ActionType.Sow, x, y, species: sp });
            actions.push({ type: ActionType.Sow, x: mx, y: my, species: sp });
            break;
          }
        }
      }

      // Sow to complete a missing mirror partner
      if (cell.plant?.ownerId === playerId && !mc.plant) {
        if (SPECIES_TERRAIN_COMPATIBILITY[cell.plant.species].includes(mc.terrain)) {
          actions.push({
            type: ActionType.Sow,
            x: mx,
            y: my,
            species: cell.plant.species,
          });
        }
      }

      // Reversed on own plant in symmetric position
      if (
        cell.plant?.ownerId === playerId &&
        !cell.temporalEffect &&
        cell.timeState !== TimeState.Reversed
      ) {
        const [pmx, pmy] = mirror(cell.x, cell.y, bestAxis);
        const pm = getCell(state.board, pmx, pmy);
        if (pm?.plant?.ownerId === playerId && pm.plant.species === cell.plant.species) {
          actions.push({
            type: ActionType.AlterTime,
            x: cell.x,
            y: cell.y,
            targetState: TimeState.Reversed,
          });
        }
      }
    }
  }

  return dedupActions(actions);
}

// ── Harmony actions (special terrain, maturation) ──

export function getHarmonyActions(state: GameState, playerId: string): GameAction[] {
  const actions: GameAction[] = [];

  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const cell = getCell(state.board, x, y)!;

      if (!cell.plant && cell.terrain !== TerrainType.Earth) {
        for (const sp of Object.values(Species)) {
          if (SPECIES_TERRAIN_COMPATIBILITY[sp].includes(cell.terrain)) {
            actions.push({ type: ActionType.Sow, x, y, species: sp });
            break;
          }
        }
      }

      if (cell.plant?.ownerId === playerId && cell.plant.age < 2 && !cell.temporalEffect) {
        actions.push({ type: ActionType.AlterTime, x, y, targetState: TimeState.Accelerated });
      }
    }
  }

  return actions;
}

// ── Disruption actions (reverse/freeze opponent plants) ──

export function getDisruptionActions(state: GameState, playerId: string): GameAction[] {
  const actions: GameAction[] = [];
  const opponentId = state.players.find((p) => p.id !== playerId)!.id;

  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const cell = getCell(state.board, x, y)!;
      if (!cell.plant || cell.plant.ownerId !== opponentId || cell.temporalEffect) continue;

      if (cell.plant.age >= 1) {
        actions.push({ type: ActionType.AlterTime, x, y, targetState: TimeState.Reversed });
      }
    }
  }

  return actions;
}

// ── Helpers ──

function get2x2(state: GameState, x: number, y: number) {
  return [
    getCell(state.board, x, y)!,
    getCell(state.board, x + 1, y)!,
    getCell(state.board, x, y + 1)!,
    getCell(state.board, x + 1, y + 1)!,
  ];
}

function mirror(x: number, y: number, axis: 'h' | 'v'): [number, number] {
  return axis === 'h' ? [BOARD_WIDTH - 1 - x, y] : [x, BOARD_HEIGHT - 1 - y];
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

function dedupActions(actions: GameAction[]): GameAction[] {
  const seen = new Set<string>();
  return actions.filter((a) => {
    const key = `${a.type}:${(a as any).x},${(a as any).y}:${(a as any).species ?? (a as any).targetState ?? ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
