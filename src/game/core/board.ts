import type { ActivePiece } from './piece';

export type BoardCell = number | null;
export type BoardGrid = BoardCell[][];

export function createBoard(rows: number, cols: number): BoardGrid {
  return Array.from({ length: rows }, () => Array<BoardCell>(cols).fill(null));
}

export function canPlacePiece(board: BoardGrid, piece: ActivePiece, offsetX = 0, offsetY = 0): boolean {
  for (let y = 0; y < piece.matrix.length; y += 1) {
    for (let x = 0; x < piece.matrix[y].length; x += 1) {
      if (piece.matrix[y][x] === 0) {
        continue;
      }

      const nextX = piece.x + x + offsetX;
      const nextY = piece.y + y + offsetY;

      if (nextX < 0 || nextX >= board[0].length) {
        return false;
      }

      if (nextY >= board.length) {
        return false;
      }

      if (nextY >= 0 && board[nextY][nextX] !== null) {
        return false;
      }
    }
  }

  return true;
}

export function lockPiece(board: BoardGrid, piece: ActivePiece): void {
  for (let y = 0; y < piece.matrix.length; y += 1) {
    for (let x = 0; x < piece.matrix[y].length; x += 1) {
      if (piece.matrix[y][x] === 0) {
        continue;
      }

      const boardX = piece.x + x;
      const boardY = piece.y + y;

      if (boardY >= 0 && boardY < board.length && boardX >= 0 && boardX < board[0].length) {
        board[boardY][boardX] = piece.color;
      }
    }
  }
}

export function clearFullLines(board: BoardGrid): number {
  let cleared = 0;

  for (let row = board.length - 1; row >= 0; row -= 1) {
    if (board[row].every((cell) => cell !== null)) {
      board.splice(row, 1);
      board.unshift(Array<BoardCell>(board[0].length).fill(null));
      cleared += 1;
      row += 1;
    }
  }

  return cleared;
}
