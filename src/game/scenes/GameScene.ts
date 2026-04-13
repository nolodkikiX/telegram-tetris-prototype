import Phaser from 'phaser';

import {
  BOARD_COLS,
  BOARD_PIXEL_HEIGHT,
  BOARD_PIXEL_WIDTH,
  BOARD_ROWS,
  CELL_SIZE,
  GAME_WIDTH,
} from '../../app/config';
import { triggerHapticFeedback } from '../../app/haptics';
import { getAppRuntimeInfo } from '../../app/runtime';
import {
  loadBestScore,
  loadHapticsEnabled,
  loadLastLevel,
  loadLastLines,
  loadLastScore,
  loadSessionsPlayed,
  loadTotalLinesCleared,
  saveBestScore,
  saveHapticsEnabled,
  saveLastLevel,
  saveLastLines,
  saveLastScore,
  saveSessionsPlayed,
  saveTotalLinesCleared,
} from '../../app/storage';
import {
  createInitialGameState,
  hardDrop,
  movePiece,
  resetGameState,
  rotatePiece,
  softDrop,
  stepGravity,
  type GameState,
} from '../core/gameState';
import { canPlacePiece } from '../core/board';
import { createHud, showHudLineClearScorePop, updateHud, type HudElements } from '../ui/hud';
import {
  createGameOverOverlay,
  createPausedOverlay,
  createStartOverlay,
} from '../ui/overlays';
import {
  createTouchControls,
  refreshTouchActionControlState,
  refreshTouchPauseControlState,
  refreshTouchPauseToggleText,
  type TouchControlVisual,
} from '../ui/touchControls';
import { applyUiTextClarity } from '../ui/textClarity';

const BASE_GRAVITY_INTERVAL_MS = 700;
const GRAVITY_STEP_LINES = 5;
const GRAVITY_STEP_MS = 60;
const MIN_GRAVITY_INTERVAL_MS = 260;
const BOARD_ORIGIN_Y = 108;
const LINE_CLEAR_SCORE_POP = [0, 100, 300, 500, 800];

export class GameScene extends Phaser.Scene {
  private gameState!: GameState;
  private boardFrameGraphics!: Phaser.GameObjects.Graphics;
  private boardLockedCellsGraphics!: Phaser.GameObjects.Graphics;
  private ghostPieceGraphics!: Phaser.GameObjects.Graphics;
  private hardDropImpactGraphics!: Phaser.GameObjects.Graphics;
  private activePieceGraphics!: Phaser.GameObjects.Graphics;
  private previewGraphics!: Phaser.GameObjects.Graphics;
  private lineClearFlash!: Phaser.GameObjects.Rectangle;
  private hud!: HudElements;
  private pausedOverlay!: Phaser.GameObjects.Container;
  private startOverlay!: Phaser.GameObjects.Container;
  private startLastScoreText!: Phaser.GameObjects.Text;
  private startLastLevelText!: Phaser.GameObjects.Text;
  private startLastLinesText!: Phaser.GameObjects.Text;
  private startSessionsText!: Phaser.GameObjects.Text;
  private startTotalLinesText!: Phaser.GameObjects.Text;
  private startHapticsToggleText!: Phaser.GameObjects.Text;
  private touchActionControls: TouchControlVisual[] = [];
  private touchPauseControl!: TouchControlVisual;
  private gameOverOverlay!: Phaser.GameObjects.Container;
  private gameOverScoreText!: Phaser.GameObjects.Text;
  private gameOverBestText!: Phaser.GameObjects.Text;
  private gameOverNewBestText!: Phaser.GameObjects.Text;
  private gravityTimer = 0;
  private isVisibilityPaused = false;
  private isManuallyPaused = false;
  private bestScore = 0;
  private lastScore = 0;
  private lastLevel = 0;
  private lastLines = 0;
  private sessionsPlayed = 0;
  private totalLinesCleared = 0;
  private hapticsEnabled = true;
  private hasStarted = false;
  private previousLinesCleared = 0;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private rotateKey?: Phaser.Input.Keyboard.Key;
  private spaceKey?: Phaser.Input.Keyboard.Key;
  private restartKey?: Phaser.Input.Keyboard.Key;
  private startKey?: Phaser.Input.Keyboard.Key;
  private pauseKey?: Phaser.Input.Keyboard.Key;
  private visibilityHandler?: () => void;
  private lastBoardSnapshot = '';
  private lastPreviewSnapshot = '';
  private lastActivePieceSnapshot = '';
  private lastGhostPieceSnapshot = '';

  constructor() {
    super('GameScene');
  }

  create(): void {
    this.bestScore = loadBestScore();
    this.lastScore = loadLastScore();
    this.lastLevel = loadLastLevel();
    this.lastLines = loadLastLines();
    this.sessionsPlayed = loadSessionsPlayed();
    this.totalLinesCleared = loadTotalLinesCleared();
    this.hapticsEnabled = loadHapticsEnabled();
    this.gameState = createInitialGameState();
    this.previousLinesCleared = this.gameState.linesCleared;

    this.boardFrameGraphics = this.add.graphics();
    this.boardLockedCellsGraphics = this.add.graphics();
    this.ghostPieceGraphics = this.add.graphics();
    this.hardDropImpactGraphics = this.add.graphics();
    this.activePieceGraphics = this.add.graphics();
    this.previewGraphics = this.add.graphics();

    const boardOriginX = Math.floor((GAME_WIDTH - BOARD_PIXEL_WIDTH) / 2);
    this.lineClearFlash = this.add.rectangle(
      boardOriginX + BOARD_PIXEL_WIDTH / 2,
      BOARD_ORIGIN_Y + BOARD_PIXEL_HEIGHT / 2,
      BOARD_PIXEL_WIDTH,
      BOARD_PIXEL_HEIGHT,
      0xe0f2fe,
      0,
    );

    this.cursors = this.input.keyboard?.createCursorKeys();
    this.rotateKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.spaceKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.restartKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.startKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.pauseKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.P);

    this.add.text(GAME_WIDTH / 2, 22, 'Iteration 3 / Step AF', {
      color: '#f9fafb',
      fontFamily: 'Arial',
      fontSize: '22px',
    }).setOrigin(0.5);

    const runtimeInfo = getAppRuntimeInfo();
    this.add.text(GAME_WIDTH / 2, 44, runtimeInfo.label, {
      color: runtimeInfo.isTelegram ? '#93c5fd' : '#cbd5e1',
      fontFamily: 'Arial',
      fontSize: '13px',
    }).setOrigin(0.5);

    this.hud = createHud(this, this.bestScore);

    this.add.text(GAME_WIDTH / 2, 122, 'Desktop: ← → ↑ ↓ Space, P pause, R restart', {
      color: '#94a3b8',
      fontFamily: 'Arial',
      fontSize: '13px',
    }).setOrigin(0.5);

    this.createTouchControls();

    const gameOverOverlay = createGameOverOverlay(this, {
      onRestart: () => this.restartGame(),
    });
    this.gameOverOverlay = gameOverOverlay.container;
    this.gameOverScoreText = gameOverOverlay.scoreText;
    this.gameOverBestText = gameOverOverlay.bestText;
    this.gameOverNewBestText = gameOverOverlay.newBestText;
    this.gameOverOverlay.setVisible(false);

    const pausedOverlay = createPausedOverlay(this);
    this.pausedOverlay = pausedOverlay.container;
    this.pausedOverlay.setVisible(false);

    const startOverlay = createStartOverlay(
      this,
      {
        bestScore: this.bestScore,
        lastScore: this.lastScore,
        lastLevel: this.lastLevel,
        lastLines: this.lastLines,
        sessionsPlayed: this.sessionsPlayed,
        totalLinesCleared: this.totalLinesCleared,
        runtimeHint: runtimeInfo.isTelegram
          ? 'Running inside Telegram Mini App, same core gameplay.'
          : 'Local browser preview, progress saves only on this device.',
      },
      {
        onToggleHaptics: () => this.toggleHaptics(),
        onStart: () => this.startGame(),
      },
    );
    this.startOverlay = startOverlay.container;
    this.startLastScoreText = startOverlay.lastScoreText;
    this.startLastLevelText = startOverlay.lastLevelText;
    this.startLastLinesText = startOverlay.lastLinesText;
    this.startSessionsText = startOverlay.sessionsText;
    this.startTotalLinesText = startOverlay.totalLinesText;
    this.startHapticsToggleText = startOverlay.hapticsToggleText;
    this.startOverlay.setVisible(true);
    applyUiTextClarity(this.children.list);

    this.visibilityHandler = () => this.handleVisibilityChange();
    document.addEventListener('visibilitychange', this.visibilityHandler);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      if (this.visibilityHandler) {
        document.removeEventListener('visibilitychange', this.visibilityHandler);
      }
    });

    this.renderBoardFrame();
    this.renderLockedBoardCells(true);
    this.renderFallingPieceState();
    this.renderNextPiecePreview(true);
    this.refreshHud();
  }

  update(_time: number, delta: number): void {
    if (this.pauseKey && Phaser.Input.Keyboard.JustDown(this.pauseKey)) {
      this.toggleManualPause();
    }

    if (!this.hasStarted) {
      if (this.startKey && Phaser.Input.Keyboard.JustDown(this.startKey)) {
        this.startGame();
      }
      return;
    }

    if (this.isVisibilityPaused || this.isManuallyPaused) {
      return;
    }

    if (this.gameState.gameOver) {
      if (
        (this.restartKey && Phaser.Input.Keyboard.JustDown(this.restartKey))
        || (this.startKey && Phaser.Input.Keyboard.JustDown(this.startKey))
      ) {
        this.restartGame();
      }
      return;
    }

    this.handleInput();

    this.gravityTimer += delta;
    if (this.gravityTimer >= this.getGravityInterval()) {
      this.gravityTimer = 0;
      stepGravity(this.gameState);
      this.refreshView();
    }
  }

  private startGame(): void {
    this.hasStarted = true;
    this.incrementSessionsPlayed();
    this.startOverlay.setVisible(false);
    this.refreshTouchPauseControlState();
    this.gravityTimer = 0;
    this.refreshView();
  }

  private handleVisibilityChange(): void {
    if (document.hidden) {
      this.isVisibilityPaused = true;
      this.scene.pause();
      return;
    }

    if (this.isVisibilityPaused) {
      this.isVisibilityPaused = false;
      this.scene.resume();
      this.gravityTimer = 0;
    }
  }

  private handleInput(): void {
    if (this.isManuallyPaused) {
      return;
    }

    if (this.cursors?.left && Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      movePiece(this.gameState, -1);
      this.renderFallingPieceState();
    }

    if (this.cursors?.right && Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      movePiece(this.gameState, 1);
      this.renderFallingPieceState();
    }

    if (this.cursors?.down && Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      softDrop(this.gameState);
      this.refreshView();
    }

    if (this.rotateKey && Phaser.Input.Keyboard.JustDown(this.rotateKey)) {
      rotatePiece(this.gameState);
      this.renderFallingPieceState();
    }

    if (this.spaceKey && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.performHardDrop();
    }
  }

  private createTouchControls(): void {
    const touchControls = createTouchControls(this, {
      onSoftDrop: () => {
        if (this.startOverlay.visible) {
          this.startGame();
          return;
        }

        if (this.gameState.gameOver) {
          this.restartGame();
          return;
        }

        if (this.isManuallyPaused) {
          return;
        }

        softDrop(this.gameState);
        this.refreshView();
      },
      onMoveLeft: () => {
        if (this.startOverlay.visible) {
          this.startGame();
          return;
        }

        if (this.gameState.gameOver) {
          this.restartGame();
          return;
        }

        if (this.isManuallyPaused) {
          return;
        }

        movePiece(this.gameState, -1);
        this.renderFallingPieceState();
      },
      onRotate: () => {
        if (this.startOverlay.visible) {
          this.startGame();
          return;
        }

        if (this.gameState.gameOver) {
          this.restartGame();
          return;
        }

        if (this.isManuallyPaused) {
          return;
        }

        rotatePiece(this.gameState);
        this.renderFallingPieceState();
      },
      onMoveRight: () => {
        if (this.startOverlay.visible) {
          this.startGame();
          return;
        }

        if (this.gameState.gameOver) {
          this.restartGame();
          return;
        }

        if (this.isManuallyPaused) {
          return;
        }

        movePiece(this.gameState, 1);
        this.renderFallingPieceState();
      },
      onHardDrop: () => {
        if (this.startOverlay.visible) {
          this.startGame();
          return;
        }

        if (this.gameState.gameOver) {
          this.restartGame();
          return;
        }

        if (this.isManuallyPaused) {
          return;
        }

        this.performHardDrop();
      },
      onPauseToggle: () => {
        if (this.startOverlay.visible || this.gameState.gameOver) {
          return;
        }

        this.toggleManualPause();
      },
    });

    this.touchActionControls = touchControls.actionControls;
    this.touchPauseControl = touchControls.pauseControl;

    this.refreshTouchPauseToggleText();
    this.refreshTouchPauseControlState();
    this.refreshTouchActionControlState();
  }

  private toggleManualPause(): void {
    if (!this.hasStarted || this.gameState.gameOver || this.isVisibilityPaused) {
      return;
    }

    this.isManuallyPaused = !this.isManuallyPaused;
    this.pausedOverlay.setVisible(this.isManuallyPaused);
    this.refreshTouchPauseToggleText();
    this.refreshTouchPauseControlState();
    this.refreshTouchActionControlState();

    if (!this.isManuallyPaused) {
      this.gravityTimer = 0;
    }
  }

  private performHardDrop(): void {
    this.playHardDropImpact();
    hardDrop(this.gameState);
    this.refreshView();
  }

  private playHardDropImpact(): void {
    this.hardDropImpactGraphics.clear();

    if (this.gameState.gameOver || !this.hasStarted) {
      return;
    }

    triggerHapticFeedback(10);

    const originX = Math.floor((GAME_WIDTH - BOARD_PIXEL_WIDTH) / 2);
    const originY = BOARD_ORIGIN_Y;
    const { activePiece, board } = this.gameState;
    let dropDistance = 0;

    while (canPlacePiece(board, activePiece, 0, dropDistance + 1)) {
      dropDistance += 1;
    }

    for (let y = 0; y < activePiece.matrix.length; y += 1) {
      for (let x = 0; x < activePiece.matrix[y].length; x += 1) {
        if (activePiece.matrix[y][x] === 0) {
          continue;
        }

        this.drawCell(
          this.hardDropImpactGraphics,
          originX,
          originY,
          activePiece.x + x,
          activePiece.y + y + dropDistance,
          0xffffff,
          0.45,
          false,
        );
      }
    }

    this.tweens.killTweensOf(this.hardDropImpactGraphics);
    this.tweens.addCounter({
      from: 0.45,
      to: 0,
      duration: 90,
      ease: 'Linear',
      onUpdate: (tween) => {
        const alpha = Number(tween.getValue() ?? 0);
        this.hardDropImpactGraphics.setAlpha(alpha / 0.45);
      },
      onComplete: () => {
        this.hardDropImpactGraphics.clear();
        this.hardDropImpactGraphics.setAlpha(1);
      },
    });
  }

  private refreshHud(): void {
    updateHud(this.hud, {
      score: this.gameState.score,
      bestScore: this.bestScore,
      level: this.getSpeedLevel(),
      linesCleared: this.gameState.linesCleared,
    });
  }

  private getSpeedLevel(): number {
    return Math.floor(this.gameState.linesCleared / GRAVITY_STEP_LINES) + 1;
  }

  private getGravityInterval(): number {
    const levelSteps = this.getSpeedLevel() - 1;
    return Math.max(MIN_GRAVITY_INTERVAL_MS, BASE_GRAVITY_INTERVAL_MS - levelSteps * GRAVITY_STEP_MS);
  }

  private syncGameOverState(): void {
    if (this.gameState.gameOver) {
      saveLastScore(this.gameState.score);
      this.lastScore = this.gameState.score;
      this.startLastScoreText.setText(`Last score: ${this.lastScore}`);
      this.lastLevel = this.getSpeedLevel();
      saveLastLevel(this.lastLevel);
      this.startLastLevelText.setText(`Last level: ${this.lastLevel}`);
      this.lastLines = this.gameState.linesCleared;
      saveLastLines(this.lastLines);
      this.startLastLinesText.setText(`Last lines: ${this.lastLines}`);
      const isNewBest = this.ensureBestScoreSaved();
      this.gameOverScoreText.setText(`Final score: ${this.gameState.score}\nLines: ${this.gameState.linesCleared}\nLevel: ${this.getSpeedLevel()}`);
      this.gameOverBestText.setText(`Best score: ${this.bestScore}`);
      this.gameOverNewBestText.setVisible(isNewBest);
      this.refreshTouchPauseControlState();
      this.gameOverOverlay.setVisible(true);
    }
  }

  private ensureBestScoreSaved(): boolean {
    if (this.gameState.score > this.bestScore) {
      this.bestScore = this.gameState.score;
      saveBestScore(this.bestScore);
      return true;
    }

    return false;
  }

  private restartGame(): void {
    resetGameState(this.gameState);
    this.previousLinesCleared = this.gameState.linesCleared;
    this.lastBoardSnapshot = '';
    this.lastPreviewSnapshot = '';
    this.lastActivePieceSnapshot = '';
    this.lastGhostPieceSnapshot = '';
    this.incrementSessionsPlayed();
    this.gravityTimer = 0;
    this.isManuallyPaused = false;
    this.pausedOverlay.setVisible(false);
    this.refreshTouchPauseToggleText();
    this.refreshTouchPauseControlState();
    this.refreshTouchActionControlState();
    this.gameOverOverlay.setVisible(false);
    this.refreshView();
  }

  private refreshView(): void {
    this.renderLockedBoardCells();
    this.renderFallingPieceState();
    this.renderNextPiecePreview();
    this.refreshHud();
    this.syncGameOverState();
    this.maybeTriggerLineClearFlash();
  }

  private renderFallingPieceState(): void {
    this.renderGhostPiece();
    this.renderActivePiece();
  }

  private incrementSessionsPlayed(): void {
    this.sessionsPlayed += 1;
    saveSessionsPlayed(this.sessionsPlayed);
    this.startSessionsText.setText(`Sessions played: ${this.sessionsPlayed}`);
  }

  private toggleHaptics(): void {
    this.hapticsEnabled = !this.hapticsEnabled;
    saveHapticsEnabled(this.hapticsEnabled);
    this.refreshHapticsToggleText();
  }

  private refreshHapticsToggleText(): void {
    this.startHapticsToggleText.setText(`Haptics: ${this.hapticsEnabled ? 'On' : 'Off'}`);
  }

  private refreshTouchPauseToggleText(): void {
    refreshTouchPauseToggleText(this.touchPauseControl, this.isManuallyPaused);
  }

  private refreshTouchPauseControlState(): void {
    refreshTouchPauseControlState(this.touchPauseControl, this.hasStarted && !this.gameState.gameOver);
  }

  private refreshTouchActionControlState(): void {
    refreshTouchActionControlState(this.touchActionControls, this.isManuallyPaused);
  }

  private maybeTriggerLineClearFlash(): void {
    if (this.gameState.linesCleared <= this.previousLinesCleared) {
      return;
    }

    const clearedNow = this.gameState.linesCleared - this.previousLinesCleared;
    this.previousLinesCleared = this.gameState.linesCleared;
    this.totalLinesCleared += clearedNow;
    saveTotalLinesCleared(this.totalLinesCleared);
    this.startTotalLinesText.setText(`Total lines cleared: ${this.totalLinesCleared}`);
    this.lineClearFlash.setAlpha(0.22);
    triggerHapticFeedback(16);
    this.showLineClearScorePop(LINE_CLEAR_SCORE_POP[clearedNow] ?? clearedNow * 200);

    this.tweens.killTweensOf(this.lineClearFlash);
    this.tweens.add({
      targets: this.lineClearFlash,
      alpha: 0,
      duration: 90,
      ease: 'Linear',
    });
  }

  private showLineClearScorePop(points: number): void {
    showHudLineClearScorePop(this, this.hud, points);
  }

  private renderGhostPiece(): void {
    if (this.gameState.gameOver || !this.hasStarted) {
      this.lastGhostPieceSnapshot = '';
      this.ghostPieceGraphics.clear();
      return;
    }

    const originX = Math.floor((GAME_WIDTH - BOARD_PIXEL_WIDTH) / 2);
    const originY = BOARD_ORIGIN_Y;
    const { activePiece, board } = this.gameState;
    let dropDistance = 0;

    while (canPlacePiece(board, activePiece, 0, dropDistance + 1)) {
      dropDistance += 1;
    }

    if (dropDistance === 0) {
      this.lastGhostPieceSnapshot = '';
      this.ghostPieceGraphics.clear();
      return;
    }

    const ghostSnapshot = `${activePiece.color}:${activePiece.x},${activePiece.y},${dropDistance}:${activePiece.matrix.map((row) => row.join('')).join('|')}`;
    if (ghostSnapshot === this.lastGhostPieceSnapshot) {
      return;
    }

    this.lastGhostPieceSnapshot = ghostSnapshot;
    this.ghostPieceGraphics.clear();

    for (let y = 0; y < activePiece.matrix.length; y += 1) {
      for (let x = 0; x < activePiece.matrix[y].length; x += 1) {
        if (activePiece.matrix[y][x] === 0) {
          continue;
        }

        this.drawCell(
          this.ghostPieceGraphics,
          originX,
          originY,
          activePiece.x + x,
          activePiece.y + y + dropDistance,
          activePiece.color,
          0.22,
          false,
        );
      }
    }
  }

  private renderNextPiecePreview(force = false): void {
    const { nextPiece } = this.gameState;
    const nextSnapshot = `${nextPiece.color}:${nextPiece.matrix.map((row) => row.join('')).join('|')}`;
    if (!force && nextSnapshot === this.lastPreviewSnapshot) {
      return;
    }

    this.lastPreviewSnapshot = nextSnapshot;
    this.previewGraphics.clear();

    const boxWidth = 42;
    const boxHeight = 42;
    const boxX = GAME_WIDTH - boxWidth - 16;
    const boxY = 100;

    this.previewGraphics.fillStyle(0x0f172a, 1);
    this.previewGraphics.fillRect(boxX, boxY, boxWidth, boxHeight);
    this.previewGraphics.lineStyle(2, 0x334155, 1);
    this.previewGraphics.strokeRect(boxX, boxY, boxWidth, boxHeight);

    const previewCellSize = 8;
    const matrixWidth = nextPiece.matrix[0].length;
    const matrixHeight = nextPiece.matrix.length;
    const offsetX = boxX + Math.floor((boxWidth - matrixWidth * previewCellSize) / 2);
    const offsetY = boxY + Math.floor((boxHeight - matrixHeight * previewCellSize) / 2);

    for (let y = 0; y < matrixHeight; y += 1) {
      for (let x = 0; x < matrixWidth; x += 1) {
        if (nextPiece.matrix[y][x] === 0) {
          continue;
        }

        const cellX = offsetX + x * previewCellSize;
        const cellY = offsetY + y * previewCellSize;
        this.previewGraphics.fillStyle(nextPiece.color, 1);
        this.previewGraphics.fillRect(cellX + 1, cellY + 1, previewCellSize - 2, previewCellSize - 2);
        this.previewGraphics.lineStyle(1, 0xe5e7eb, 0.15);
        this.previewGraphics.strokeRect(cellX + 1, cellY + 1, previewCellSize - 2, previewCellSize - 2);
      }
    }
  }

  private renderBoardFrame(): void {
    const originX = Math.floor((GAME_WIDTH - BOARD_PIXEL_WIDTH) / 2);
    const originY = BOARD_ORIGIN_Y;

    this.boardFrameGraphics.clear();
    this.boardFrameGraphics.fillStyle(0x0f172a, 1);
    this.boardFrameGraphics.fillRect(originX, originY, BOARD_PIXEL_WIDTH, BOARD_PIXEL_HEIGHT);
    this.boardFrameGraphics.lineStyle(2, 0x334155, 1);
    this.boardFrameGraphics.strokeRect(originX, originY, BOARD_PIXEL_WIDTH, BOARD_PIXEL_HEIGHT);

    this.boardFrameGraphics.lineStyle(1, 0x1e293b, 1);
    for (let col = 1; col < BOARD_COLS; col += 1) {
      const x = originX + col * CELL_SIZE;
      this.boardFrameGraphics.lineBetween(x, originY, x, originY + BOARD_PIXEL_HEIGHT);
    }

    for (let row = 1; row < BOARD_ROWS; row += 1) {
      const y = originY + row * CELL_SIZE;
      this.boardFrameGraphics.lineBetween(originX, y, originX + BOARD_PIXEL_WIDTH, y);
    }
  }

  private renderLockedBoardCells(force = false): void {
    const boardSnapshot = this.gameState.board
      .map((row) => row.map((cell) => (cell === null ? '.' : cell.toString(16))).join(','))
      .join(';');

    if (!force && boardSnapshot === this.lastBoardSnapshot) {
      return;
    }

    this.lastBoardSnapshot = boardSnapshot;
    this.boardLockedCellsGraphics.clear();

    const originX = Math.floor((GAME_WIDTH - BOARD_PIXEL_WIDTH) / 2);
    const originY = BOARD_ORIGIN_Y;

    for (let y = 0; y < this.gameState.board.length; y += 1) {
      for (let x = 0; x < this.gameState.board[y].length; x += 1) {
        const cellColor = this.gameState.board[y][x];
        if (cellColor === null) {
          continue;
        }

        this.drawCell(this.boardLockedCellsGraphics, originX, originY, x, y, cellColor);
      }
    }
  }

  private renderActivePiece(): void {
    if (this.gameState.gameOver) {
      this.lastActivePieceSnapshot = '';
      this.activePieceGraphics.clear();
      return;
    }

    const originX = Math.floor((GAME_WIDTH - BOARD_PIXEL_WIDTH) / 2);
    const originY = BOARD_ORIGIN_Y;
    const { activePiece } = this.gameState;
    const activeSnapshot = `${activePiece.color}:${activePiece.x},${activePiece.y}:${activePiece.matrix.map((row) => row.join('')).join('|')}`;
    if (activeSnapshot === this.lastActivePieceSnapshot) {
      return;
    }

    this.lastActivePieceSnapshot = activeSnapshot;
    this.activePieceGraphics.clear();

    for (let y = 0; y < activePiece.matrix.length; y += 1) {
      for (let x = 0; x < activePiece.matrix[y].length; x += 1) {
        if (activePiece.matrix[y][x] === 0) {
          continue;
        }

        this.drawCell(
          this.activePieceGraphics,
          originX,
          originY,
          activePiece.x + x,
          activePiece.y + y,
          activePiece.color,
        );
      }
    }
  }

  private drawCell(
    graphics: Phaser.GameObjects.Graphics,
    originX: number,
    originY: number,
    boardX: number,
    boardY: number,
    color: number,
    alpha = 1,
    withStroke = true,
  ): void {
    const x = originX + boardX * CELL_SIZE;
    const y = originY + boardY * CELL_SIZE;
    const padding = 1;
    const size = CELL_SIZE - padding * 2;

    graphics.fillStyle(color, alpha);
    graphics.fillRect(x + padding, y + padding, size, size);

    if (!withStroke) {
      return;
    }

    graphics.lineStyle(1, 0xe5e7eb, 0.15);
    graphics.strokeRect(x + padding, y + padding, size, size);
  }
}
