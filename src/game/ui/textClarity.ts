import Phaser from 'phaser';

export function getCappedUiResolution(maxResolution = 2): number {
  if (typeof window === 'undefined') {
    return 1;
  }

  const devicePixelRatio = window.devicePixelRatio || 1;
  return Math.min(Math.max(devicePixelRatio, 1), maxResolution);
}

export function applyUiTextClarity(
  gameObjects: Phaser.GameObjects.GameObject[],
  options?: { maxResolution?: number },
): void {
  const resolution = getCappedUiResolution(options?.maxResolution ?? 2);
  const upscaleFactor = resolution >= 2 ? 2 : 1;

  for (const gameObject of gameObjects) {
    if (!(gameObject instanceof Phaser.GameObjects.Text)) {
      continue;
    }

    const parsedFontSize = Number.parseFloat(String(gameObject.style.fontSize ?? '0'));

    gameObject.setResolution(resolution);
    gameObject.setPosition(Math.round(gameObject.x), Math.round(gameObject.y));

    if (upscaleFactor > 1 && Number.isFinite(parsedFontSize) && parsedFontSize > 0) {
      gameObject.setFontSize(parsedFontSize * upscaleFactor);
      gameObject.setScale(1 / upscaleFactor);
      gameObject.setPosition(Math.round(gameObject.x), Math.round(gameObject.y));
      gameObject.updateDisplayOrigin();
    }
  }
}
