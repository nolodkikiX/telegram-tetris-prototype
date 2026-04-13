import { BOARD_COLS, BOARD_ROWS } from '../../app/config';
import { canPlacePiece, clearFullLines, createBoard, lockPiece, type BoardGrid } from './board';
import { createRandomPiece, rotateMatrixClockwise, type ActivePiece } from './piece';

export interface GameState {
  board: BoardGrid;
  activePiece: ActivePiece;
  nextPiece: ActivePiece;
  score: number;
  linesCleared: number;
  gameOver: boolean;
}

const LINE_CLEAR_POINTS = [0, 100, 300, 500, 800];

export function createInitialGameState(): GameState {
  const board = createBoard(BOARD_ROWS, BOARD_COLS);
  const activePiece = createRandomPiece(BOARD_COLS);
  const nextPiece = createRandomPiece(BOARD_COLS);

  return {
    board,
    activePiece,
    nextPiece,
    score: 0,
    linesCleared: 0,
    gameOver: !canPlacePiece(board, activePiece),
  };
}

export function movePiece(state: GameState, deltaX: number): void {
  if (state.gameOver) {
    return;
  }

  if (canPlacePiece(state.board, state.activePiece, deltaX, 0)) {
    state.activePiece.x += deltaX;
  }
}

export function softDrop(state: GameState): void {
  if (state.gameOver) {
    return;
  }

  if (canPlacePiece(state.board, state.activePiece, 0, 1)) {
    state.activePiece.y += 1;
    return;
  }

  lockActivePieceAndSpawn(state);
}

export function hardDrop(state: GameState): void {
  if (state.gameOver) {
    return;
  }

  let droppedRows = 0;
  while (canPlacePiece(state.board, state.activePiece, 0, droppedRows + 1)) {
    droppedRows += 1;
  }

  state.activePiece.y += droppedRows;
  lockActivePieceAndSpawn(state);
}

export function stepGravity(state: GameState): void {
  if (state.gameOver) {
    return;
  }

  if (canPlacePiece(state.board, state.activePiece, 0, 1)) {
    state.activePiece.y += 1;
    return;
  }

  lockActivePieceAndSpawn(state);
}

export function rotatePiece(state: GameState): void {
  if (state.gameOver) {
    return;
  }

  const rotatedMatrix = rotateMatrixClockwise(state.activePiece.matrix);
  const candidate: ActivePiece = {
    ...state.activePiece,
    matrix: rotatedMatrix,
  };

  if (canPlacePiece(state.board, candidate)) {
    state.activePiece = candidate;
    return;
  }

  for (const offsetX of [-1, 1]) {
    if (canPlacePiece(state.board, candidate, offsetX, 0)) {
      state.activePiece = {
        ...candidate,
        x: candidate.x + offsetX,
      };
      return;
    }
  }
}

export function resetGameState(state: GameState): void {
  const next = createInitialGameState();
  state.board = next.board;
  state.activePiece = next.activePiece;
  state.nextPiece = next.nextPiece;
  state.score = next.score;
  state.linesCleared = next.linesCleared;
  state.gameOver = next.gameOver;
}

function lockActivePieceAndSpawn(state: GameState): void {
  lockPiece(state.board, state.activePiece);
  const clearedLines = clearFullLines(state.board);
  state.linesCleared += clearedLines;
  state.score += LINE_CLEAR_POINTS[clearedLines] ?? clearedLines * 200;

  state.activePiece = {
    ...state.nextPiece,
    matrix: state.nextPiece.matrix.map((row) => [...row]),
  };
  state.nextPiece = createRandomPiece(BOARD_COLS);

  if (!canPlacePiece(state.board, state.activePiece)) {
    state.gameOver = true;
  }
}
