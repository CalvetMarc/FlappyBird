import { Container, Sprite, Assets, Texture, Rectangle } from "pixi.js";
import { IScene } from "../managers/SceneManager";
import { SceneManager } from "../managers/SceneManager";
import { BackgroundManager } from "../managers/BackgroundManager";
import { Pipe } from "../objects/Pipe";
import birdUrl from "../assets/birds/AllBird1.png";

export class GameScene implements IScene {
  container = new Container();

  private bird?: Sprite;
  private birdFrames: Texture[] = [];
  private currentFrame = 0;
  private frameTimer = 0;
  private frameInterval = 100;

  // 🔽 Física
  private velocityY = 0;
  private gravity = 1500;
  private jumpForce = -700;
  private groundY = 0;

  private isDead = false;
  private topPipe?: Pipe;
  private bottomPipe?: Pipe;

  constructor() {
    this.container.sortableChildren = true;
    this.loadAssets();

    // Controls
    window.addEventListener("pointerdown", this.handleInput);
    window.addEventListener("keydown", this.handleKey);
  }

  private async loadAssets() {
    const birdTexture = await Assets.load(birdUrl);

    const frameW = 16;
    const frameH = 16;
    const totalFrames = 4;

    for (let i = 0; i < totalFrames; i++) {
      const tex = new Texture({
        source: birdTexture.source,
        frame: new Rectangle(i * frameW, 0, frameW, frameH),
      });
      this.birdFrames.push(tex);
    }

    this.bird = new Sprite(this.birdFrames[0]);
    this.bird.anchor.set(0.5);
    this.bird.zIndex = 10;

    const app = SceneManager.I.app;
    const screenW = app.renderer.width;
    const screenH = app.renderer.height;
    const bgWidth =
      (BackgroundManager.I.view.children.find((c) => c instanceof Sprite) as Sprite)?.width ??
      screenW;

    const targetWidth = bgWidth / 10;
    const scale = targetWidth / frameW;
    this.bird.scale.set(scale * 0.7);
    this.bird.position.set(screenW / 2, screenH / 1.7);

    this.groundY = screenH * 0.95;
    SceneManager.I.app.stage.addChild(this.bird);

    // Crea tubs
    this.createPipes();
  }

  /** 🟩 Genera dos tubs enganxats als límits verticals */
private createPipes() {
  const bgSprite = BackgroundManager.I.view.children.find(
    (c) => c instanceof Sprite
  ) as Sprite | undefined;

  const bgHeight = bgSprite?.height ?? SceneManager.I.app.renderer.height;
  const screenW = SceneManager.I.app.renderer.width;

  // 🔹 Alçada fixa per a totes dues canonades
  const pipeHeight = bgHeight / 3;

  // 🔹 Crea la canonada inferior
  this.bottomPipe = new Pipe(pipeHeight);
  this.bottomPipe.x = screenW * 0.8;
  this.bottomPipe.y = bgHeight - pipeHeight; // surt exactament del final del fons

  // 🔹 Crea la canonada superior (mateixa mida)
  this.topPipe = new Pipe(pipeHeight);
  this.topPipe.x = screenW * 0.8;
  this.topPipe.y = 0; // enganxada dalt de tot

  // 🔹 Afegeix-les a l’escenari
  SceneManager.I.app.stage.addChild(this.topPipe);
  SceneManager.I.app.stage.addChild(this.bottomPipe);
}




  private handleInput = () => {
    if (!this.isDead) this.flap();
  };

  private handleKey = (e: KeyboardEvent) => {
    if (e.code === "Space" && !this.isDead) {
      e.preventDefault();
      this.flap();
    }
  };

  private flap() {
    if (!this.bird) return;
    if (this.bird.y >= this.groundY) this.velocityY = 0;
    this.velocityY = this.jumpForce;
    this.bird.rotation = -Math.PI / 6;
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

    requestAnimationFrame(fadeIn);
  }

  update(dt: number): void {
    if (!this.bird || this.isDead) return;

    // Animació d’ales
    this.frameTimer += dt;
    if (this.frameTimer >= this.frameInterval) {
      this.frameTimer = 0;
      this.currentFrame = (this.currentFrame + 1) % this.birdFrames.length;
      this.bird.texture = this.birdFrames[this.currentFrame];
    }

    // Física
    const deltaSeconds = dt / 1000;
    this.velocityY += this.gravity * deltaSeconds;
    this.bird.y += this.velocityY * deltaSeconds;

    const bgSprite = BackgroundManager.I.view.children.find(
      (c) => c instanceof Sprite
    ) as Sprite | undefined;
    const bgHeight = bgSprite?.height ?? SceneManager.I.app.renderer.height;

    if (this.bird.y > this.groundY) {
      this.bird.y = this.groundY;
      this.velocityY = 0;
    }

    if (this.bird.y > bgHeight) {
      this.bird.y = bgHeight;
      this.velocityY = 0;
      this.isDead = true;
      this.bird.rotation = Math.PI / 2;
      BackgroundManager.I.stop();
      return;
    }

    const maxFallAngle = Math.PI / 3;
    this.bird.rotation = Math.max(-Math.PI / 6, Math.min(this.velocityY / 400, maxFallAngle));
  }

  async onEnd(): Promise<void> {
    window.removeEventListener("pointerdown", this.handleInput);
    window.removeEventListener("keydown", this.handleKey);

    await new Promise<void>((resolve) => {
      const startTime = performance.now();
      const duration = 300;
      const startAlpha = this.container.alpha;

      const fadeOut = (now: number) => {
        const t = Math.min((now - startTime) / duration, 1);
        this.container.alpha = startAlpha * (1 - t);
        if (t < 1) requestAnimationFrame(fadeOut);
        else {
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

    const bgWidth =
      (BackgroundManager.I.view.children.find((c) => c instanceof Sprite) as Sprite)?.width ?? width;

    const frameW = 16;
    const targetWidth = bgWidth / 10;
    const scale = targetWidth / frameW;
    this.bird.scale.set(scale * 0.7);
    this.bird.position.set(width / 2, height / 1.7);
    this.groundY = height * 0.95;
  }

  destroy(): void {
    window.removeEventListener("pointerdown", this.handleInput);
    window.removeEventListener("keydown", this.handleKey);

    if (this.bird) this.bird.destroy({ texture: true, textureSource: true });
    this.container.destroy({ children: true, texture: true, textureSource: true });
  }
}
