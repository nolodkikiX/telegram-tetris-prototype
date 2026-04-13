import Phaser from 'phaser';

import { GAME_WIDTH } from '../../app/config';

export interface HudElements {
  scoreText: Phaser.GameObjects.Text;
  bestText: Phaser.GameObjects.Text;
  levelText: Phaser.GameObjects.Text;
  linesText: Phaser.GameObjects.Text;
  nextLabelText: Phaser.GameObjects.Text;
  lineClearScorePopText: Phaser.GameObjects.Text;
}

export function createHud(scene: Phaser.Scene, bestScore: number): HudElements {
  const scoreText = scene.add.text(20, 66, 'Score: 0', {
    color: '#f9fafb',
    fontFamily: 'Arial',
    fontSize: '18px',
  });

  const bestText = scene.add.text(20, 86, `Best: ${bestScore}`, {
    color: '#cbd5e1',
    fontFamily: 'Arial',
    fontSize: '15px',
  });

  const levelText = scene.add.text(20, 104, 'Level: 1', {
    color: '#93c5fd',
    fontFamily: 'Arial',
    fontSize: '14px',
  });

  const lineClearScorePopText = scene.add.text(88, 48, '', {
    color: '#facc15',
    fontFamily: 'Arial',
    fontSize: '16px',
    fontStyle: 'bold',
  }).setAlpha(0);

  const linesText = scene.add.text(GAME_WIDTH - 20, 66, 'Lines: 0', {
    color: '#f9fafb',
    fontFamily: 'Arial',
    fontSize: '18px',
  }).setOrigin(1, 0);

  const nextLabelText = scene.add.text(GAME_WIDTH - 20, 86, 'Next', {
    color: '#cbd5e1',
    fontFamily: 'Arial',
    fontSize: '15px',
  }).setOrigin(1, 0);

  return {
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
  hud.scoreText.setText(`Score: ${data.score}`);
  hud.bestText.setText(`Best: ${data.bestScore}`);
  hud.levelText.setText(`Level: ${data.level}`);
  hud.linesText.setText(`Lines: ${data.linesCleared}`);
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
