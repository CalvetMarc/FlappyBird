import { Container, Rectangle, Text, TextStyle } from "pixi.js";
import { IScene } from "../managers/SceneManager";
import { SceneManager } from "../managers/SceneManager";
import { BackgroundManager } from "../managers/BackgroundManager";
import { PipeManager } from "../managers/PipeManager";
import { CharacterManager } from "../managers/CharacterManager";

export class GameScene implements IScene {
  container = new Container();
  private scoreText?: Text; 
  private score: number = 0;       

  constructor() {
    this.container.sortableChildren = true;
    this.createScoreText();
  }

  onStart(): void {
    this.container.alpha = 0;
    const startTime = performance.now();
    const duration = 400;

    const fadeIn = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      this.container.alpha = t;
      if (t < 1) requestAnimationFrame(fadeIn);
    };
    PipeManager.I.start();
    requestAnimationFrame(fadeIn);
  }

  update(dt: number): void {
    PipeManager.I.update(dt);
    CharacterManager.I.update(dt);

    const birdBounds = CharacterManager.I.birdBounds;
    if (!birdBounds) return;

    const groundBounds = BackgroundManager.I.groundBounds;
    if (groundBounds) {
      const isTouchingGround =
        birdBounds.y + birdBounds.height >= groundBounds.y &&
        birdBounds.x + birdBounds.width > groundBounds.x &&
        birdBounds.x < groundBounds.x + groundBounds.width;

      if (isTouchingGround) {
        CharacterManager.I.groundTouched(groundBounds);
        PipeManager.I.stop();
        BackgroundManager.I.stop();
        return;
      }
    }

    for (const obs of PipeManager.I.obstacles) {
      for (const s of [...obs.upPipe, ...obs.downPipe]) {
        const pipeBounds = s.getBounds() as unknown as Rectangle;
        if (this.rectsIntersect(birdBounds, pipeBounds)) {
          CharacterManager.I.kill();
          PipeManager.I.stop();
          return;
        }
      }
    }
    
  }

  private async createScoreText() {
    const app = SceneManager.I.app;
    const screenW = app.renderer.width;

    await document.fonts.load('48px "Minecraft"');

    const style = new TextStyle({
      fontFamily: "Minecraft",
      fontSize: 38,
      fill: 0xffffff,
      stroke: { color: 0x000000, width: 6 },
      align: "center",
    });

    this.scoreText = new Text({ text: "0", style });
    this.scoreText.anchor.set(0.5);
    this.scoreText.position.set(screenW / 2, 60);
    this.scoreText.zIndex = 20;

    this.container.addChild(this.scoreText);
  }

  private rectsIntersect(a: Rectangle, b: Rectangle): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  async onEnd(): Promise<void> {
    // 🧹 No cal eliminar listeners: CharacterManager ja ho fa
  }

  public onResize(width: number, height: number): void {
    BackgroundManager.I.rebuild(width, height);
    PipeManager.I.rebuild(width, height);
    CharacterManager.I.rebuild(width, height);
  }

  destroy(): void {
    BackgroundManager.I.destroy();
    PipeManager.I.destroy();
    CharacterManager.I.destroy();
    this.container.destroy({ children: true, texture: true, textureSource: true });
  }
}
