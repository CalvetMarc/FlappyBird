import { Container, Sprite, Assets, Texture, Rectangle } from "pixi.js";
import { IScene } from "../managers/SceneManager";
import { SceneManager } from "../managers/SceneManager";
import { BackgroundManager } from "../managers/BackgroundManager";
import { PipeManager } from "../managers/PipeManager";
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
  private gravity = 2;
  private jumpForce = -0.65;
  private groundY = 0;

  // Estat
  private isDead = false;
  private deadGrounded = false; // nou: mort i ja al terra

  // 🔹 Tubs
  private pipeTimer = 0;
  private pipeInterval = 3000; // cada 3 segons
  private pipeSpeed = 0.2; // píxels per segon

  constructor() {
    this.container.sortableChildren = true;
    this.loadAssets();

    window.addEventListener("pointerdown", this.handleInput);
    window.addEventListener("keydown", this.handleKey);
  }

  private async loadAssets() {
    const app = SceneManager.I.app;
    await PipeManager.I.init(app);
    SceneManager.I.app.stage.addChild(PipeManager.I.view);

    const birdTexture = await Assets.load(birdUrl);
    const frameW = 16;
    const frameH = 16;
    const totalFrames = 4;

    for (let i = 0; i < totalFrames; i++) {
      const tex = new Texture({
        source: birdTexture.source,
        frame: new Rectangle(i * frameW, SceneManager.I.playerIndex * 16, frameW, frameH),
      });
      this.birdFrames.push(tex);
    }

    this.bird = new Sprite(this.birdFrames[0]);
    this.bird.anchor.set(0.5);
    this.bird.zIndex = 10;

    const screenW = app.renderer.width;
    const screenH = app.renderer.height;
    const bgWidth =
      (BackgroundManager.I.view.children.find((c) => c instanceof Sprite) as Sprite)?.width ??
      screenW;

    const targetWidth = bgWidth / 10;
    const scale = targetWidth / frameW;
    this.bird.scale.set(scale * 0.7);
    this.bird.position.set(screenW / 2, screenH / 1.7);

    this.groundY = screenH * 0.835;
    SceneManager.I.app.stage.addChild(this.bird);
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
    this.velocityY = BackgroundManager.I.bgHeight * this.jumpForce;
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
    if (!this.bird) return;
    const deltaSeconds = dt / 1000;

    // 🟢 Animació d’ales (només si és viu)
    if (!this.isDead) {
      this.frameTimer += dt;
      if (this.frameTimer >= this.frameInterval) {
        this.frameTimer = 0;
        this.currentFrame = (this.currentFrame + 1) % this.birdFrames.length;
        this.bird.texture = this.birdFrames[this.currentFrame];
      }
    }

    // 🔽 Física (només si no està mort o si està mort però encara no ha tocat terra)
    if (!this.isDead || (this.isDead && !this.deadGrounded)) {
      this.velocityY += this.gravity * deltaSeconds * BackgroundManager.I.bgHeight;
      this.bird.y += this.velocityY * deltaSeconds;
    }

    // 🔁 Rotació segons velocitat
    const maxFallAngle = Math.PI / 2;
    const minUpAngle = -Math.PI / 6;
    if (!this.isDead) {
      this.bird.rotation = Math.max(minUpAngle, Math.min(this.velocityY / 400, maxFallAngle));
    } else if (!this.deadGrounded) {
      this.bird.rotation = Math.min(this.bird.rotation + 0.05, maxFallAngle);
    }

    // 🌍 Límits
    const bgSprite = BackgroundManager.I.view.children.find(
      (c) => c instanceof Sprite
    ) as Sprite | undefined;
    const bgHeight = bgSprite?.height ?? SceneManager.I.app.renderer.height;

    // 🧱 Toca el terra
    if (this.bird.y >= this.groundY) {
      this.bird.y = this.groundY;
      this.velocityY = 0;

      if (!this.isDead) {
        // cau sense haver xocat amb cap tub
        this.isDead = true;
        this.deadGrounded = true;
        this.bird.rotation = Math.PI / 2;
        BackgroundManager.I.stop();
      } else {
        // ja era mort i acaba de tocar el terra
        this.deadGrounded = true;
      }

      return;
    }

    // ❌ Si està mort, no fem col·lisions ni noves pipes
    if (this.isDead) {
      return;
    }

    // 🧱 Col·lisions amb pipes
    const birdBounds = this.bird.getBounds() as unknown as Rectangle;
    const pad = 6;
    birdBounds.x += pad;
    birdBounds.y += pad;
    birdBounds.width -= pad * 2;
    birdBounds.height -= pad * 2;

    for (const obs of PipeManager.I.obstacles) {
      for (const s of [...obs.upPipe, ...obs.downPipe]) {
        const pipeBounds = s.getBounds() as unknown as Rectangle;
        if (this.rectsIntersect(birdBounds, pipeBounds)) {
          this.killBird(); // mor però seguirà caient amb gravetat
          return;
        }
      }
    }

    // 🕒 Crear obstacles
    this.pipeTimer += dt;
    if (this.pipeTimer >= this.pipeInterval) {
      this.pipeTimer = 0;
      PipeManager.I.CreateObstacle();
    }

    // 🌀 Moure pipes
    for (const obstacle of (PipeManager.I as any).gamePipes) {
      for (const sprite of [...obstacle.upPipe, ...obstacle.downPipe]) {
        sprite.x -= this.pipeSpeed * deltaSeconds * BackgroundManager.I.bgWidth;
      }
    }
  }

  private rectsIntersect(a: Rectangle, b: Rectangle): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  private killBird() {
    this.isDead = true;
    this.deadGrounded = false; // segueix caient fins terra

    if (this.bird) {
      this.bird.rotation = Math.PI / 3;
    }

    BackgroundManager.I.stop();
  }

  async onEnd(): Promise<void> {
    window.removeEventListener("pointerdown", this.handleInput);
    window.removeEventListener("keydown", this.handleKey);
  }

  public onResize(width: number, height: number): void {
    if (!this.bird) return;

    const bgWidth =
      (BackgroundManager.I.view.children.find((c) => c instanceof Sprite) as Sprite)?.width ??
      width;

    const frameW = 16;
    const targetWidth = bgWidth / 10;
    const scale = targetWidth / frameW;
    this.bird.scale.set(scale * 0.7);
    this.bird.position.set(width / 2, height / 1.7);
    this.groundY = height * 0.835;
  }

  destroy(): void {
    window.removeEventListener("pointerdown", this.handleInput);
    window.removeEventListener("keydown", this.handleKey);

    if (this.bird) this.bird.destroy({ texture: true, textureSource: true });
    this.container.destroy({ children: true, texture: true, textureSource: true });
  }
}
