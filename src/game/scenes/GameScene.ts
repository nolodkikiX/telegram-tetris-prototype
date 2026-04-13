import Phaser from 'phaser';

import {
  BOARD_COLS,
  BOARD_PIXEL_HEIGHT,
  BOARD_PIXEL_WIDTH,
  BOARD_ROWS,
  CELL_SIZE,
  GAME_HEIGHT,
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
import { applyUiTextClarity } from '../ui/textClarity';

const BASE_GRAVITY_INTERVAL_MS = 700;
const GRAVITY_STEP_LINES = 5;
const GRAVITY_STEP_MS = 60;
const MIN_GRAVITY_INTERVAL_MS = 260;
const BOARD_ORIGIN_Y = 108;
const LINE_CLEAR_SCORE_POP = [0, 100, 300, 500, 800];

interface TouchControlVisual {
  container: Phaser.GameObjects.Container;
  background: Phaser.GameObjects.Rectangle;
  text: Phaser.GameObjects.Text;
}

export class GameScene extends Phaser.Scene {
  private gameState!: GameState;
  private boardFrameGraphics!: Phaser.GameObjects.Graphics;
  private boardLockedCellsGraphics!: Phaser.GameObjects.Graphics;
  private ghostPieceGraphics!: Phaser.GameObjects.Graphics;
  private hardDropImpactGraphics!: Phaser.GameObjects.Graphics;
  private activePieceGraphics!: Phaser.GameObjects.Graphics;
  private previewGraphics!: Phaser.GameObjects.Graphics;
  private lineClearFlash!: Phaser.GameObjects.Rectangle;
  private lineClearScorePopText!: Phaser.GameObjects.Text;
  private hudScoreText!: Phaser.GameObjects.Text;
  private hudLinesText!: Phaser.GameObjects.Text;
  private hudBestText!: Phaser.GameObjects.Text;
  private hudLevelText!: Phaser.GameObjects.Text;
  private pausedOverlay!: Phaser.GameObjects.Container;
  private startOverlay!: Phaser.GameObjects.Container;
  private startBestText!: Phaser.GameObjects.Text;
  private startLastScoreText!: Phaser.GameObjects.Text;
  private startLastLevelText!: Phaser.GameObjects.Text;
  private startLastLinesText!: Phaser.GameObjects.Text;
  private startSessionsText!: Phaser.GameObjects.Text;
  private startTotalLinesText!: Phaser.GameObjects.Text;
  private startHapticsToggleText!: Phaser.GameObjects.Text;
  private touchControlsPanel!: Phaser.GameObjects.Container;
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

    const runtime = getAppRuntimeInfo();
    this.add.text(GAME_WIDTH / 2, 44, runtime.label, {
      color: runtime.isTelegram ? '#93c5fd' : '#cbd5e1',
      fontFamily: 'Arial',
      fontSize: '13px',
    }).setOrigin(0.5);

    this.hudScoreText = this.add.text(20, 66, 'Score: 0', {
      color: '#f9fafb',
      fontFamily: 'Arial',
      fontSize: '18px',
    });

    this.hudBestText = this.add.text(20, 86, `Best: ${this.bestScore}`, {
      color: '#cbd5e1',
      fontFamily: 'Arial',
      fontSize: '15px',
    });

    this.hudLevelText = this.add.text(20, 104, 'Level: 1', {
      color: '#93c5fd',
      fontFamily: 'Arial',
      fontSize: '14px',
    });

    this.lineClearScorePopText = this.add.text(88, 48, '', {
      color: '#facc15',
      fontFamily: 'Arial',
      fontSize: '16px',
      fontStyle: 'bold',
    }).setAlpha(0);

    this.hudLinesText = this.add.text(GAME_WIDTH - 20, 66, 'Lines: 0', {
      color: '#f9fafb',
      fontFamily: 'Arial',
      fontSize: '18px',
    }).setOrigin(1, 0);

    this.add.text(GAME_WIDTH - 20, 86, 'Next', {
      color: '#cbd5e1',
      fontFamily: 'Arial',
      fontSize: '15px',
    }).setOrigin(1, 0);

    this.add.text(GAME_WIDTH / 2, 122, 'Desktop: ← → ↑ ↓ Space, P pause, R restart', {
      color: '#94a3b8',
      fontFamily: 'Arial',
      fontSize: '13px',
    }).setOrigin(0.5);

    this.createTouchControls();

    this.gameOverOverlay = this.createGameOverOverlay();
    this.gameOverOverlay.setVisible(false);

    this.pausedOverlay = this.createPausedOverlay();
    this.pausedOverlay.setVisible(false);

    this.startOverlay = this.createStartOverlay();
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

  private getBottomSafeAreaInset(): number {
    try {
      const probe = document.createElement('div');
      probe.style.position = 'absolute';
      probe.style.visibility = 'hidden';
      probe.style.pointerEvents = 'none';
      probe.style.paddingBottom = 'env(safe-area-inset-bottom, 0px)';
      document.body.appendChild(probe);
      const inset = Number.parseFloat(getComputedStyle(probe).paddingBottom || '0');
      probe.remove();
      return Number.isFinite(inset) ? inset : 0;
    } catch {
      return 0;
    }
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
    const safeBottom = this.getBottomSafeAreaInset();
    const panelHeight = 92 + safeBottom;
    const panelTop = GAME_HEIGHT - panelHeight;
    const pauseRowY = panelTop + 18;
    const mainRowY = panelTop + 56;

    const panelBackground = this.add.rectangle(
      GAME_WIDTH / 2,
      panelTop + panelHeight / 2,
      GAME_WIDTH,
      panelHeight,
      0x020617,
      0.96,
    ).setStrokeStyle(1, 0x1e293b, 1);

    this.touchControlsPanel = this.add.container(0, 0, [panelBackground]);

    this.touchActionControls.push(this.createControlButton(42, mainRowY, '▼', () => {
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
    }, 56, '16px'));

    this.touchActionControls.push(this.createControlButton(128, mainRowY, '←', () => {
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
    }, 52));

    this.touchActionControls.push(this.createControlButton(180, mainRowY, '⟳', () => {
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
    }, 52));

    this.touchActionControls.push(this.createControlButton(232, mainRowY, '→', () => {
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
    }, 52));

    this.touchActionControls.push(this.createControlButton(318, mainRowY, 'DROP', () => {
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
    }, 64, '14px'));

    this.touchPauseControl = this.createControlButton(318, pauseRowY, 'Pause', () => {
      if (this.startOverlay.visible || this.gameState.gameOver) {
        return;
      }

      this.toggleManualPause();
    }, 64, '13px');

    this.touchControlsPanel.add([
      ...this.touchActionControls.map((control) => control.container),
      this.touchPauseControl.container,
    ]);

    this.refreshTouchPauseToggleText();
    this.refreshTouchPauseControlState();
    this.refreshTouchActionControlState();
  }

  private createControlButton(
    x: number,
    y: number,
    label: string,
    onPress: () => void,
    width = 52,
    fontSize?: string,
  ): TouchControlVisual {
    const button = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, width, 44, 0x1e293b, 0.95)
      .setStrokeStyle(2, 0x475569, 1)
      .setInteractive({ useHandCursor: true });

    const text = this.add.text(0, 0, label, {
      color: '#f8fafc',
      fontFamily: 'Arial',
      fontSize: fontSize ?? (label === 'DROP' ? '14px' : '20px'),
    }).setOrigin(0.5);

    bg.on('pointerdown', () => {
      bg.setFillStyle(0x334155, 1);
      onPress();
    });
    bg.on('pointerup', () => bg.setFillStyle(0x1e293b, 0.95));
    bg.on('pointerout', () => bg.setFillStyle(0x1e293b, 0.95));

    button.add([bg, text]);
    return { container: button, background: bg, text };
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
    this.hudScoreText.setText(`Score: ${this.gameState.score}`);
    this.hudBestText.setText(`Best: ${this.bestScore}`);
    this.hudLevelText.setText(`Level: ${this.getSpeedLevel()}`);
    this.hudLinesText.setText(`Lines: ${this.gameState.linesCleared}`);
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
    this.touchPauseControl.text.setText(this.isManuallyPaused ? 'Resume' : 'Pause');
  }

  private refreshTouchPauseControlState(): void {
    const isAvailable = this.hasStarted && !this.gameState.gameOver;
    this.touchPauseControl.container.setAlpha(isAvailable ? 1 : 0.35);
  }

  private refreshTouchActionControlState(): void {
    const alpha = this.isManuallyPaused ? 0.35 : 1;

    for (const control of this.touchActionControls) {
      control.container.setAlpha(alpha);
    }
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
    this.lineClearScorePopText.setText(`+${points}`);
    this.lineClearScorePopText.setPosition(88, 48);
    this.lineClearScorePopText.setAlpha(1);

    this.tweens.killTweensOf(this.lineClearScorePopText);
    this.tweens.add({
      targets: this.lineClearScorePopText,
      y: 40,
      alpha: 0,
      duration: 240,
      ease: 'Linear',
    });
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

  private createStartOverlay(): Phaser.GameObjects.Container {
    const overlay = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 4);
    const background = this.add.rectangle(0, 0, 268, 286, 0x020617, 0.94);
    background.setStrokeStyle(2, 0x60a5fa, 1);

    const title = this.add.text(0, -46, 'Telegram Tetris', {
      color: '#f9fafb',
      fontFamily: 'Arial',
      fontSize: '28px',
    }).setOrigin(0.5);

    this.startBestText = this.add.text(0, -20, `Best score: ${this.bestScore}`, {
      color: '#cbd5e1',
      fontFamily: 'Arial',
      fontSize: '16px',
    }).setOrigin(0.5);

    this.startLastScoreText = this.add.text(0, -1, `Last score: ${this.lastScore}`, {
      color: '#cbd5e1',
      fontFamily: 'Arial',
      fontSize: '14px',
    }).setOrigin(0.5);

    this.startLastLevelText = this.add.text(0, 17, `Last level: ${this.lastLevel}`, {
      color: '#cbd5e1',
      fontFamily: 'Arial',
      fontSize: '14px',
    }).setOrigin(0.5);

    this.startLastLinesText = this.add.text(0, 35, `Last lines: ${this.lastLines}`, {
      color: '#cbd5e1',
      fontFamily: 'Arial',
      fontSize: '14px',
    }).setOrigin(0.5);

    this.startSessionsText = this.add.text(0, 55, `Sessions played: ${this.sessionsPlayed}`, {
      color: '#94a3b8',
      fontFamily: 'Arial',
      fontSize: '14px',
    }).setOrigin(0.5);

    this.startTotalLinesText = this.add.text(0, 75, `Total lines cleared: ${this.totalLinesCleared}`, {
      color: '#94a3b8',
      fontFamily: 'Arial',
      fontSize: '14px',
    }).setOrigin(0.5);

    const objectiveHint = this.add.text(0, 100, 'Stack pieces and clear full lines.', {
      color: '#93c5fd',
      fontFamily: 'Arial',
      fontSize: '15px',
      align: 'center',
      wordWrap: { width: 220 },
    }).setOrigin(0.5);

    const desktopHint = this.add.text(0, 128, 'Desktop: arrows move, Space drops, P pauses.', {
      color: '#cbd5e1',
      fontFamily: 'Arial',
      fontSize: '13px',
      align: 'center',
      wordWrap: { width: 228 },
    }).setOrigin(0.5);

    const touchHint = this.add.text(0, 148, 'Touch: use the buttons below to move, rotate, drop.', {
      color: '#cbd5e1',
      fontFamily: 'Arial',
      fontSize: '13px',
      align: 'center',
      wordWrap: { width: 228 },
    }).setOrigin(0.5);

    const runtime = getAppRuntimeInfo();
    const runtimeHint = this.add.text(
      0,
      168,
      runtime.isTelegram
        ? 'Running inside Telegram Mini App, same core gameplay.'
        : 'Local browser preview, progress saves only on this device.',
      {
        color: '#94a3b8',
        fontFamily: 'Arial',
        fontSize: '12px',
        align: 'center',
        wordWrap: { width: 228 },
      },
    ).setOrigin(0.5);

    this.startHapticsToggleText = this.add.text(0, 192, '', {
      color: '#f8fafc',
      fontFamily: 'Arial',
      fontSize: '14px',
      backgroundColor: '#0f172a',
      padding: { left: 10, right: 10, top: 6, bottom: 6 },
    }).setOrigin(0.5);
    this.startHapticsToggleText.setInteractive({ useHandCursor: true });
    this.startHapticsToggleText.on('pointerdown', () => this.toggleHaptics());
    this.refreshHapticsToggleText();

    const cta = this.add.text(0, 228, 'Press Enter or tap move, rotate, or drop', {
      color: '#f8fafc',
      fontFamily: 'Arial',
      fontSize: '15px',
      backgroundColor: '#1d4ed8',
      padding: { left: 14, right: 14, top: 8, bottom: 8 },
    }).setOrigin(0.5);
    cta.setInteractive({ useHandCursor: true });
    cta.on('pointerdown', () => this.startGame());

    overlay.add([
      background,
      title,
      this.startBestText,
      this.startLastScoreText,
      this.startLastLevelText,
      this.startLastLinesText,
      this.startSessionsText,
      this.startTotalLinesText,
      objectiveHint,
      desktopHint,
      touchHint,
      runtimeHint,
      this.startHapticsToggleText,
      cta,
    ]);
    return overlay;
  }

  private createPausedOverlay(): Phaser.GameObjects.Container {
    const overlay = this.add.container(GAME_WIDTH / 2, BOARD_ORIGIN_Y + 36);
    const background = this.add.rectangle(0, 0, 138, 48, 0x020617, 0.9);
    background.setStrokeStyle(1, 0xfbbf24, 1);

    const label = this.add.text(0, -10, 'Paused', {
      color: '#fef3c7',
      fontFamily: 'Arial',
      fontSize: '15px',
    }).setOrigin(0.5);

    const hint = this.add.text(0, 10, 'P or tap Resume', {
      color: '#fde68a',
      fontFamily: 'Arial',
      fontSize: '12px',
    }).setOrigin(0.5);

    overlay.add([background, label, hint]);
    return overlay;
  }

  private createGameOverOverlay(): Phaser.GameObjects.Container {
    const overlay = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 18);
    const background = this.add.rectangle(0, 0, 270, 228, 0x020617, 0.94);
    background.setStrokeStyle(2, 0xf87171, 1);

    const title = this.add.text(0, -62, 'Game Over', {
      color: '#f9fafb',
      fontFamily: 'Arial',
      fontSize: '28px',
    }).setOrigin(0.5);

    const hint = this.add.text(0, -4, 'Press Enter, R, or tap move, rotate, or drop', {
      color: '#d1d5db',
      fontFamily: 'Arial',
      fontSize: '18px',
    }).setOrigin(0.5);

    this.gameOverScoreText = this.add.text(0, 34, '', {
      color: '#93c5fd',
      fontFamily: 'Arial',
      fontSize: '16px',
      align: 'center',
    }).setOrigin(0.5);

    this.gameOverBestText = this.add.text(0, 64, '', {
      color: '#cbd5e1',
      fontFamily: 'Arial',
      fontSize: '15px',
      align: 'center',
    }).setOrigin(0.5);

    this.gameOverNewBestText = this.add.text(0, 88, 'New best!', {
      color: '#facc15',
      fontFamily: 'Arial',
      fontSize: '17px',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5);
    this.gameOverNewBestText.setVisible(false);

    const restartCta = this.add.text(0, 112, 'Restart', {
      color: '#f8fafc',
      fontFamily: 'Arial',
      fontSize: '16px',
      backgroundColor: '#dc2626',
      padding: { left: 18, right: 18, top: 8, bottom: 8 },
    }).setOrigin(0.5);
    restartCta.setInteractive({ useHandCursor: true });
    restartCta.on('pointerdown', () => this.restartGame());

    overlay.add([
      background,
      title,
      hint,
      this.gameOverScoreText,
      this.gameOverBestText,
      this.gameOverNewBestText,
      restartCta,
    ]);
    return overlay;
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
