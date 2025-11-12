import { Application, Container, Sprite, Texture, Rectangle, Assets } from "pixi.js";
import { SceneManager } from "./SceneManager";
import { LAYERS } from "./SceneManager";
import { BackgroundManager } from "./BackgroundManager";
import birdUrl from "../assets/birds/AllBird1.png";
import { GameManager } from "./GameManager";

export class CharacterManager {
  private app!: Application;
  private container = new Container();
  private bird?: Sprite;
  private birdFrames: Texture[] = [];
  private currentFrame = 0;
  private frameTimer = 0;
  private frameInterval = 100;

  // 🔽 Física
  private velocityY = 0;
  private gravity = 2;
  private jumpForce = -0.65;

  // Estat
  private isDead = false;
  private deadGrounded = false;

  // Singleton
  private static _i: CharacterManager;
  static get I() {
    return (this._i ??= new CharacterManager());
  }

  private constructor() {
    this.init(GameManager.I.gameApp);
  }

  /** 🔁 Actualització per frame */
  public update(dt: number) {
    if (!this.bird) return;
    const deltaSeconds = dt / 1000;

    // 🕊️ Animació d’ales
    if (!this.isDead) {
      this.frameTimer += dt;
      if (this.frameTimer >= this.frameInterval) {
        this.frameTimer = 0;
        this.currentFrame = (this.currentFrame + 1) % this.birdFrames.length;
        this.bird.texture = this.birdFrames[this.currentFrame];
      }
    }

    // ⚙️ Física (gravetat i moviment vertical)
    if (!this.isDead || (this.isDead && !this.deadGrounded)) {
      this.velocityY += this.gravity * deltaSeconds * BackgroundManager.I.bgHeight;
      this.bird.y += this.velocityY * deltaSeconds;
    }

    // 🎯 Rotació segons velocitat
    const maxFallAngle = Math.PI / 2;
    const minUpAngle = -Math.PI / 6;

    if (!this.isDead) {
      this.bird.rotation = Math.max(minUpAngle, Math.min(this.velocityY / 400, maxFallAngle));
    } else if (!this.deadGrounded) {
      this.bird.rotation = Math.min(this.bird.rotation + 0.05, maxFallAngle);
    }
  }

  /** 🔲 Retorna bounding box per col·lisions */
  public get birdBounds(): Rectangle | undefined {
    if (!this.bird) return;
    const rect = this.bird.getBounds() as unknown as Rectangle;
    const pad = 6;
    rect.x += pad;
    rect.y += pad;
    rect.width -= pad * 2;
    rect.height -= pad * 2;
    return rect;
  }

  /** 💀 Matar ocell externament */
  public kill() {
    if (this.isDead) return;
    this.isDead = true;
    BackgroundManager.I.stop();
  }

  /** 🌍 Quan toca el terra */
  /** 🌍 Quan toca el terra */
public groundTouched(groundRect: Rectangle) {
  if (!this.bird) return;

  // ✋ Aturem la gravetat i el moviment
  this.velocityY = 0;
  this.gravity = 0;

  // 📏 Col·loca l’ocell just a sobre del terra
  const birdBounds = this.birdBounds;
  if (birdBounds) {
    const offset = birdBounds.y + birdBounds.height - groundRect.y;
    if (offset > 0) {
      this.bird.y -= offset; // aixeca’l fins a tocar el terra
    }
  }

  // 💀 Marca com a mort
  if (!this.isDead) {
    this.kill();
  }

  this.deadGrounded = true;
}


  /** 🪶 Getter del contenidor */
  public get containerObject(): Container {
    return this.container;
  }

  /** 🧹 Neteja total */
  public destroy(): void {
    window.removeEventListener("pointerdown", this.handleInput);
    window.removeEventListener("keydown", this.handleKey);
    if (this.bird) this.bird.destroy({ texture: true, textureSource: true });
    this.container.destroy({ children: true, texture: true, textureSource: true });
  }

  /** 📏 Reajustar posicions i escales */
  public rebuild(screenW: number, screenH: number): void {
    if (!this.bird) return;
    const frameW = 16;
    const bgWidth =
      (BackgroundManager.I.containerObject.children.find((c) => c instanceof Sprite) as Sprite)?.width ??
      screenW;
    const targetWidth = bgWidth / 10;
    const scale = targetWidth / frameW;
    this.bird.scale.set(scale * 0.7);
    this.bird.position.set(screenW / 2, screenH / 1.7);
  }

  /** 🪶 Inicialització */
  private async init(app: Application) {
    this.app = app;
    this.container.sortableChildren = true;
    this.container.zIndex = LAYERS.PLAYER;
    await this.loadBird();
    window.addEventListener("pointerdown", this.handleInput);
    window.addEventListener("keydown", this.handleKey);
    BackgroundManager.I.containerObject.addChild(this.container);
  }

  /** 🐦 Carrega els sprites de l’ocell */
  private async loadBird() {
    const birdTexture = await Assets.load(birdUrl);
    const frameW = 16;
    const frameH = 16;
    const totalFrames = 4;

    const birdIndex = SceneManager.I.playerIndex ?? 0;
    const yOffset = birdIndex * frameH;

    for (let i = 0; i < totalFrames; i++) {
      const tex = new Texture({
        source: birdTexture.source,
        frame: new Rectangle(i * frameW, yOffset, frameW, frameH),
      });
      this.birdFrames.push(tex);
    }

    this.bird = new Sprite(this.birdFrames[0]);
    this.bird.anchor.set(0.5);
    this.bird.zIndex = 100;

    const screenW = this.app.renderer.width;
    const screenH = this.app.renderer.height;
    const bgWidth =
      (BackgroundManager.I.containerObject.children.find((c) => c instanceof Sprite) as Sprite)?.width ??
      screenW;

    const targetWidth = bgWidth / 10;
    const scale = targetWidth / frameW;
    this.bird.scale.set(scale * 0.7);
    this.bird.position.set(screenW / 2, screenH / 1.7);

    this.container.addChild(this.bird);
  }

  /** 🎮 Controls */
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
    this.velocityY = BackgroundManager.I.bgHeight * this.jumpForce;
    this.bird.rotation = -Math.PI / 6;
  }
}
