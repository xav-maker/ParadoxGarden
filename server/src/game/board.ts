import {
  type Cell,
  TerrainType,
  TimeState,
  BOARD_WIDTH,
  BOARD_HEIGHT,
  TERRAIN_DISTRIBUTION,
} from '@jardins/shared';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateBoard(): Cell[][] {
  const terrains: TerrainType[] = [];
  for (const [terrain, count] of Object.entries(TERRAIN_DISTRIBUTION)) {
    for (let i = 0; i < count; i++) {
      terrains.push(terrain as TerrainType);
    }
  }

  const shuffled = shuffle(terrains);
  const board: Cell[][] = [];

  for (let y = 0; y < BOARD_HEIGHT; y++) {
    const row: Cell[] = [];
    for (let x = 0; x < BOARD_WIDTH; x++) {
      row.push({
        x,
        y,
        terrain: shuffled[y * BOARD_WIDTH + x],
        timeState: TimeState.Normal,
        temporalEffect: null,
        plant: null,
      });
    }
    board.push(row);
  }

  return board;
}

export function getCell(board: Cell[][], x: number, y: number): Cell | null {
  if (x < 0 || x >= BOARD_WIDTH || y < 0 || y >= BOARD_HEIGHT) return null;
  return board[y][x];
}

export function getOrthogonalNeighbors(board: Cell[][], x: number, y: number): Cell[] {
  const dirs = [
    [0, -1], [0, 1], [-1, 0], [1, 0],
  ];
  const result: Cell[] = [];
  for (const [dx, dy] of dirs) {
    const cell = getCell(board, x + dx, y + dy);
    if (cell) result.push(cell);
  }
  return result;
}
