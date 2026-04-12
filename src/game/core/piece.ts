export type Cell = { x: number; y: number };
export type Matrix = number[][];

export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export interface ActivePiece {
  type: TetrominoType;
  matrix: Matrix;
  x: number;
  y: number;
  color: number;
}

export interface TetrominoDefinition {
  type: TetrominoType;
  matrix: Matrix;
  color: number;
}

export const TETROMINOES: TetrominoDefinition[] = [
  { type: 'I', color: 0x38bdf8, matrix: [[1, 1, 1, 1]] },
  { type: 'O', color: 0xfacc15, matrix: [[1, 1], [1, 1]] },
  { type: 'T', color: 0xa855f7, matrix: [[0, 1, 0], [1, 1, 1]] },
  { type: 'S', color: 0x4ade80, matrix: [[0, 1, 1], [1, 1, 0]] },
  { type: 'Z', color: 0xf87171, matrix: [[1, 1, 0], [0, 1, 1]] },
  { type: 'J', color: 0x60a5fa, matrix: [[1, 0, 0], [1, 1, 1]] },
  { type: 'L', color: 0xfb923c, matrix: [[0, 0, 1], [1, 1, 1]] },
];

export function cloneMatrix(matrix: Matrix): Matrix {
  return matrix.map((row) => [...row]);
}

export function rotateMatrixClockwise(matrix: Matrix): Matrix {
  const height = matrix.length;
  const width = matrix[0].length;
  const rotated: Matrix = Array.from({ length: width }, () => Array<number>(height).fill(0));

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      rotated[x][height - 1 - y] = matrix[y][x];
    }
  }

  return rotated;
}

export function createPieceFromDefinition(definition: TetrominoDefinition, boardCols: number): ActivePiece {
  const matrix = cloneMatrix(definition.matrix);
  const width = matrix[0].length;

  return {
    type: definition.type,
    matrix,
    x: Math.floor((boardCols - width) / 2),
    y: 0,
    color: definition.color,
  };
}

export function createRandomPiece(boardCols: number): ActivePiece {
  const definition = TETROMINOES[Math.floor(Math.random() * TETROMINOES.length)];
  return createPieceFromDefinition(definition, boardCols);
}
