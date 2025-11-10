import { Container, Sprite, Assets, Texture, Rectangle } from "pixi.js";
import { IScene } from "../managers/SceneManager";
import { SceneManager } from "../managers/SceneManager";
import { BackgroundManager } from "../managers/BackgroundManager";
import birdUrl from "../assets/birds/AllBird1.png";

export class GameScene implements IScene {
  container = new Container();

  private bird?: Sprite;
  private birdFrames: Texture[] = [];
  private currentBirdIndex = 0;

  constructor() {
    this.container.sortableChildren = true;
    this.loadAssets();
  }

  /** 🧩 Carrega i crea el mateix ocell que al MainMenu */
  private async loadAssets() {
    const birdTexture = await Assets.load(birdUrl);

    // 🔹 Obtenim totes les variants del sprite (mateix sistema que a MainMenu)
    const frameW = 16;
    const frameH = 16;
    const totalFrames = Math.floor(birdTexture.height / frameH);

    for (let i = 0; i < totalFrames; i++) {
      const tex = new Texture({
        source: birdTexture.source,
        frame: new Rectangle(0, i * frameH, frameW, frameH),
      });
      this.birdFrames.push(tex);
    }

    // 🔹 Mostrem l’ocell triat des del MainMenu
    this.currentBirdIndex = SceneManager.I.playerIndex ?? 0;
    this.bird = new Sprite(this.birdFrames[this.currentBirdIndex]);
    this.bird.anchor.set(0.5);
    this.bird.zIndex = 10;

    // 🔹 Escala i posició idèntiques al MainMenu
    const app = SceneManager.I.app;
    const screenW = app.renderer.width;
    const screenH = app.renderer.height;
    const bgWidth = (BackgroundManager.I.view.children.find(
      c => c instanceof Sprite
    ) as Sprite)?.width ?? screenW;

    const targetWidth = bgWidth / 10;
    const scale = targetWidth / frameW;
    this.bird.scale.set(scale * 0.7);
    this.bird.position.set(screenW / 2, screenH / 1.7);

    // ⚠️ No l’afegim al container — el posarem directament al stage
    SceneManager.I.app.stage.addChild(this.bird);
  }

  onStart(): void {
    this.container.alpha = 0;

    const startTime = performance.now();
    const duration = 400;

    // 🔆 Fade-in només pel container
    const fadeIn = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      this.container.alpha = t;
      if (t < 1) requestAnimationFrame(fadeIn);
    };

    requestAnimationFrame(fadeIn);
  }

  update(dt: number): void {
    // Aquí hi pots afegir moviment o gravetat més endavant
  }

  async onEnd(): Promise<void> {
    // 🟩 Fade out abans de sortir (afecta només al container)
    await new Promise<void>((resolve) => {
      const startTime = performance.now();
      const duration = 300;
      const startAlpha = this.container.alpha;

      const fadeOut = (now: number) => {
        const t = Math.min((now - startTime) / duration, 1);
        this.container.alpha = startAlpha * (1 - t);
        if (t < 1) requestAnimationFrame(fadeOut);
        else {
          // 🔸 Eliminem el container i l’ocell per separat
          SceneManager.I.app.stage.removeChild(this.container);
          if (this.bird) SceneManager.I.app.stage.removeChild(this.bird);
          resolve();
        }
      };

      requestAnimationFrame(fadeOut);
    });
  }

  public onResize(width: number, height: number): void {
    if (!this.bird) return;

    const bgWidth = (BackgroundManager.I.view.children.find(
      c => c instanceof Sprite
    ) as Sprite)?.width ?? width;

    const frameW = 16;
    const targetWidth = bgWidth / 10;
    const scale = targetWidth / frameW;
    this.bird.scale.set(scale * 0.7);
    this.bird.position.set(width / 2, height / 1.7);
  }

  destroy(): void {
    if (this.bird) this.bird.destroy({ texture: true, textureSource: true });
    this.container.destroy({
      children: true,
      texture: true,
      textureSource: true,
    });
  }
}
