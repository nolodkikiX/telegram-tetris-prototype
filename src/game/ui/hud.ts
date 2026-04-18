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
  const glow = scene.add.rectangle(
    0,
    2,
    width + 8,
    height + 8,
    LIQUID_GLASS_TOKENS.ambientGlowPrimary,
    LIQUID_GLASS_TOKENS.hudGlowAlpha,
  );
  const fill = scene.add.rectangle(0, 0, width, height, LIQUID_GLASS_TOKENS.hudGlassFill, 0.86);
  const altFill = scene.add.rectangle(
    0,
    -height * 0.22,
    width - 4,
    Math.max(10, height * 0.4),
    LIQUID_GLASS_TOKENS.hudGlassFillAlt,
    0.56,
  );
  const stroke = scene.add.rectangle(0, 0, width, height);
  stroke.setStrokeStyle(1, LIQUID_GLASS_TOKENS.hudGlassStroke, 0.76);
  const highlight = scene.add.rectangle(
    0,
    -height * 0.34,
    width - 12,
    6,
    LIQUID_GLASS_TOKENS.hudGlassHighlight,
    0.14,
  );

  glow.setOrigin(0.5);
  fill.setOrigin(0.5);
  altFill.setOrigin(0.5);
  stroke.setOrigin(0.5);
  highlight.setOrigin(0.5);

  return scene.add.container(x, y, [glow, fill, altFill, stroke, highlight]);
}

function createStatPill(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  label: string,
  value: string,
  valueColor: string,
): { container: Phaser.GameObjects.Container; valueText: Phaser.GameObjects.Text } {
  const container = createGlassCard(scene, x, y, width, 22);
  const labelText = scene.add.text(-width / 2 + 10, -4, label, {
    color: LIQUID_GLASS_TOKENS.hudLabelText,
    fontFamily: 'Arial',
    fontSize: '8px',
    fontStyle: 'bold',
    letterSpacing: 1,
  }).setOrigin(0, 0.5);
  const valueText = scene.add.text(width / 2 - 10, -4, value, {
    color: valueColor,
    fontFamily: 'Arial',
    fontSize: '11px',
    fontStyle: 'bold',
  }).setOrigin(1, 0.5);

  container.add([labelText, valueText]);
  return { container, valueText };
}

export const NEXT_PREVIEW_LAYOUT = {
  cardX: GAME_WIDTH - 34,
  cardY: 82,
  cardWidth: 58,
  cardHeight: 52,
  labelX: GAME_WIDTH - 34,
  labelY: 66,
  boxX: GAME_WIDTH - 53,
  boxY: 77,
  boxWidth: 38,
  boxHeight: 22,
} as const;

export function createHud(scene: Phaser.Scene, bestScore: number): HudElements {
  const scoreCard = createGlassCard(scene, 90, 70, 136, 48);
  const bestPill = createStatPill(scene, 56, 97, 74, 'BEST', `${bestScore}`, LIQUID_GLASS_TOKENS.hudSecondaryAccentText);
  const levelPill = createStatPill(scene, 143, 97, 52, 'LVL', '1', LIQUID_GLASS_TOKENS.hudAccentText);
  const linesPill = createStatPill(scene, 205, 97, 56, 'LINES', '0', LIQUID_GLASS_TOKENS.hudValueText);
  const statGroup = scene.add.container(0, 0, [
    bestPill.container,
    levelPill.container,
    linesPill.container,
  ]);

  const nextCard = createGlassCard(
    scene,
    NEXT_PREVIEW_LAYOUT.cardX,
    NEXT_PREVIEW_LAYOUT.cardY,
    NEXT_PREVIEW_LAYOUT.cardWidth,
    NEXT_PREVIEW_LAYOUT.cardHeight,
  );

  scene.add.text(32, 52, 'SCORE', {
    color: LIQUID_GLASS_TOKENS.hudLabelText,
    fontFamily: 'Arial',
    fontSize: '9px',
    fontStyle: 'bold',
    letterSpacing: 1.2,
  });

  const scoreText = scene.add.text(32, 66, '0', {
    color: LIQUID_GLASS_TOKENS.hudValueText,
    fontFamily: 'Arial',
    fontSize: '26px',
    fontStyle: 'bold',
  });

  const lineClearScorePopText = scene.add.text(106, 42, '', {
    color: '#fde047',
    fontFamily: 'Arial',
    fontSize: '15px',
    fontStyle: 'bold',
  }).setAlpha(0);

  const nextLabelText = scene.add.text(NEXT_PREVIEW_LAYOUT.labelX, NEXT_PREVIEW_LAYOUT.labelY, 'NEXT', {
    color: LIQUID_GLASS_TOKENS.hudLabelText,
    fontFamily: 'Arial',
    fontSize: '8px',
    fontStyle: 'bold',
    letterSpacing: 1.2,
  }).setOrigin(0.5, 0.5);

  return {
    leftCard: scoreCard,
    rightCard: statGroup,
    nextCard,
    scoreText,
    bestText: bestPill.valueText,
    levelText: levelPill.valueText,
    linesText: linesPill.valueText,
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
  hud.lineClearScorePopText.setPosition(106, 42);
  hud.lineClearScorePopText.setAlpha(1);

  scene.tweens.killTweensOf(hud.lineClearScorePopText);
  scene.tweens.add({
    targets: hud.lineClearScorePopText,
    y: 34,
    alpha: 0,
    duration: 240,
    ease: 'Linear',
  });
}
