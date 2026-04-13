import Phaser from 'phaser';

import { GAME_WIDTH } from '../../app/config';
import { LIQUID_GLASS_TOKENS } from './visualTokens';

export interface HudElements {
  leftCard: Phaser.GameObjects.Container;
  rightCard: Phaser.GameObjects.Container;
  nextCard: Phaser.GameObjects.Container;
  scoreText: Phaser.GameObjects.Text;
  bestText: Phaser.GameObjects.Text;
  levelText: Phaser.GameObjects.Text;
  linesText: Phaser.GameObjects.Text;
  nextLabelText: Phaser.GameObjects.Text;
  lineClearScorePopText: Phaser.GameObjects.Text;
}

function createGlassCard(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
): Phaser.GameObjects.Container {
  const glow = scene.add.rectangle(0, 0, width + 8, height + 8, LIQUID_GLASS_TOKENS.ambientGlowPrimary, LIQUID_GLASS_TOKENS.hudGlowAlpha);
  const fill = scene.add.rectangle(0, 0, width, height, LIQUID_GLASS_TOKENS.hudGlassFill, 0.82);
  const altFill = scene.add.rectangle(0, -height * 0.18, width - 4, height * 0.42, LIQUID_GLASS_TOKENS.hudGlassFillAlt, 0.5);
  const stroke = scene.add.rectangle(0, 0, width, height);
  stroke.setStrokeStyle(1, LIQUID_GLASS_TOKENS.hudGlassStroke, 0.8);
  const highlight = scene.add.rectangle(0, -height * 0.32, width - 10, 8, LIQUID_GLASS_TOKENS.hudGlassHighlight, 0.18);

  glow.setOrigin(0.5);
  fill.setOrigin(0.5);
  altFill.setOrigin(0.5);
  stroke.setOrigin(0.5);
  highlight.setOrigin(0.5);

  const container = scene.add.container(x, y, [glow, fill, altFill, stroke, highlight]);
  return container;
}

export function createHud(scene: Phaser.Scene, bestScore: number): HudElements {
  const leftCard = createGlassCard(scene, 74, 88, 116, 64);
  const rightCard = createGlassCard(scene, GAME_WIDTH - 60, 88, 92, 64);
  const nextCard = createGlassCard(scene, GAME_WIDTH - 40, 115, 62, 74);

  scene.add.text(28, 58, 'SCORE', {
    color: LIQUID_GLASS_TOKENS.hudLabelText,
    fontFamily: 'Arial',
    fontSize: '10px',
    fontStyle: 'bold',
    letterSpacing: 1.2,
  });

  const scoreText = scene.add.text(28, 70, '0', {
    color: LIQUID_GLASS_TOKENS.hudValueText,
    fontFamily: 'Arial',
    fontSize: '22px',
    fontStyle: 'bold',
  });

  scene.add.text(28, 95, 'BEST', {
    color: LIQUID_GLASS_TOKENS.hudLabelText,
    fontFamily: 'Arial',
    fontSize: '10px',
    fontStyle: 'bold',
    letterSpacing: 1.2,
  });

  const bestText = scene.add.text(28, 107, `${bestScore}`, {
    color: LIQUID_GLASS_TOKENS.hudSecondaryAccentText,
    fontFamily: 'Arial',
    fontSize: '15px',
    fontStyle: 'bold',
  });

  scene.add.text(GAME_WIDTH - 98, 58, 'LEVEL', {
    color: LIQUID_GLASS_TOKENS.hudLabelText,
    fontFamily: 'Arial',
    fontSize: '10px',
    fontStyle: 'bold',
    letterSpacing: 1.2,
  });

  const levelText = scene.add.text(GAME_WIDTH - 98, 70, '1', {
    color: LIQUID_GLASS_TOKENS.hudAccentText,
    fontFamily: 'Arial',
    fontSize: '20px',
    fontStyle: 'bold',
  });

  scene.add.text(GAME_WIDTH - 98, 95, 'LINES', {
    color: LIQUID_GLASS_TOKENS.hudLabelText,
    fontFamily: 'Arial',
    fontSize: '10px',
    fontStyle: 'bold',
    letterSpacing: 1.2,
  });

  const lineClearScorePopText = scene.add.text(88, 48, '', {
    color: '#fde047',
    fontFamily: 'Arial',
    fontSize: '16px',
    fontStyle: 'bold',
  }).setAlpha(0);

  const linesText = scene.add.text(GAME_WIDTH - 98, 107, '0', {
    color: LIQUID_GLASS_TOKENS.hudValueText,
    fontFamily: 'Arial',
    fontSize: '15px',
    fontStyle: 'bold',
  });

  const nextLabelText = scene.add.text(GAME_WIDTH - 67, 82, 'NEXT', {
    color: LIQUID_GLASS_TOKENS.hudLabelText,
    fontFamily: 'Arial',
    fontSize: '10px',
    fontStyle: 'bold',
    letterSpacing: 1.2,
  });

  return {
    leftCard,
    rightCard,
    nextCard,
    scoreText,
    bestText,
    levelText,
    linesText,
    nextLabelText,
    lineClearScorePopText,
  };
}

export function updateHud(
  hud: HudElements,
  data: { score: number; bestScore: number; level: number; linesCleared: number },
): void {
  hud.scoreText.setText(`${data.score}`);
  hud.bestText.setText(`${data.bestScore}`);
  hud.levelText.setText(`${data.level}`);
  hud.linesText.setText(`${data.linesCleared}`);
}

export function showHudLineClearScorePop(
  scene: Phaser.Scene,
  hud: HudElements,
  points: number,
): void {
  hud.lineClearScorePopText.setText(`+${points}`);
  hud.lineClearScorePopText.setPosition(88, 48);
  hud.lineClearScorePopText.setAlpha(1);

  scene.tweens.killTweensOf(hud.lineClearScorePopText);
  scene.tweens.add({
    targets: hud.lineClearScorePopText,
    y: 40,
    alpha: 0,
    duration: 240,
    ease: 'Linear',
  });
}
