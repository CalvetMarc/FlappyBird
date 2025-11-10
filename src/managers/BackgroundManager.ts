import { Application, Container, Sprite, Texture, Rectangle, Assets } from "pixi.js";
import { SceneManager } from "./SceneManager";

// Assets
import backgroundUrl from "../assets/backgrounds/Background2.png";
import groundUrl from "../assets/tiles/SimpleStyle1.png";

export class BackgroundManager {
  private app!: Application;
  private container = new Container();
  private background?: Sprite;
  private groundPieces: Sprite[] = [];

  private baseTextures: Texture[] = [];
  private scaledWidth = 0;
  private scale = 1;
  private groundY = 0;

  private startX = 0;       // 👈 punt inicial del background
  private groundWidthPx = 0; // 👈 amplada total del terra visible

  private scrolling = false;
  private scrollSpeed = 200; // px per segon

  // Singleton
  private static _i: BackgroundManager;
  static get I() {
    return (this._i ??= new BackgroundManager());
  }

  private constructor() {}

  /** Initialize and load assets */
  async init(app: Application) {
    this.app = app;
    const [bgTexture, groundTexture] = await Promise.all([
      Assets.load(backgroundUrl),
      Assets.load(groundUrl),
    ]);

    this.createBackground(bgTexture);
    this.createGroundPieces(groundTexture);
  }

  /** Return the background container so it can be added to scenes */
  get view(): Container {
    return this.container;
  }

  /** Create the background (85% top) */
  private createBackground(texture: Texture) {
    const { width: screenW, height: screenH } = this.app.renderer;

    const aspect = texture.width / texture.height;
    const targetHeight = screenH * 0.85;
    const targetWidth = targetHeight * aspect;

    this.background = new Sprite(texture);
    this.background.width = targetWidth;
    this.background.height = targetHeight;
    this.background.anchor.set(0.5, 0);
    this.background.position.set(screenW / 2, 0);

    this.container.addChildAt(this.background, 0);
  }

  /** Create ground and store cropped base textures for reuse */
  /** Create ground and store cropped base textures for reuse */
  private createGroundPieces(originalTexture: Texture) {
    const { width: screenW, height: screenH } = this.app.renderer;
    const groundWidth = this.background?.width ?? screenW;
    const targetHeight = screenH * 0.15;

    const texW = originalTexture.width;
    const texH = originalTexture.height;
    const baseCropWidth = texW * 0.5;
    const cropHeight = texH * 0.284;
    const cropY = texH - cropHeight;

    this.scale = targetHeight / cropHeight;
    const pieceCount = 4;
    const subWidth = baseCropWidth / pieceCount;
    this.scaledWidth = subWidth * this.scale;
    this.groundY = screenH;

    this.startX = (screenW - groundWidth) / 2;
    this.groundWidthPx = groundWidth;

    // Generate 4 base cropped pieces
    for (let i = 0; i < pieceCount; i++) {
        const cropX = i * subWidth;
        const croppedTexture = new Texture({
        source: originalTexture.source,
        frame: new Rectangle(cropX, cropY, subWidth, cropHeight),
        });
        this.baseTextures.push(croppedTexture);
    }

    // 🟩 Fill the screen + one extra tile to prevent visible gaps
    let currentX = this.startX;
    const endX = this.startX + groundWidth + this.scaledWidth; // 👈 tile extra
    while (currentX < endX) {
        const piece = this.createRandomPiece(currentX);
        this.groundPieces.push(piece);
        this.container.addChild(piece);
        currentX += this.scaledWidth;
    }
  }


  /** Create a random ground piece based on probabilities */
  private createRandomPiece(x: number): Sprite {
    const probabilities = [0.3, 0.25, 0.25, 0.2];
    const r = Math.random();
    let cumulative = 0;
    let index = 0;
    for (let i = 0; i < probabilities.length; i++) {
      cumulative += probabilities[i];
      if (r < cumulative) {
        index = i;
        break;
      }
    }

    const tex = this.baseTextures[index];
    const piece = new Sprite(tex);
    piece.scale.set(this.scale);
    piece.anchor.set(0, 1);
    piece.position.set(x, this.groundY);
    return piece;
  }

  /** Start and stop scrolling */
  public start() {
    this.scrolling = true;
  }

  public stop() {
    this.scrolling = false;
  }

  /** Called every frame from SceneManager.update(dt) */
  public update(dt: number) {
    if (!this.scrolling) return;

    const delta = (dt / 1000) * this.scrollSpeed;

    // Moure els fragments
    for (const piece of this.groundPieces) {
      piece.x -= delta;
    }

    const first = this.groundPieces[0];
    const last = this.groundPieces[this.groundPieces.length - 1];
    if (!first || !last) return;

    // 👇 Quan la distància entre el startX i el tile sigui >= que l’amplada del tile → reciclar
    if (this.startX - first.x >= this.scaledWidth) {
      this.container.removeChild(first);
      this.groundPieces.shift();

      const newX = last.x + this.scaledWidth;
      const newPiece = this.createRandomPiece(newX);
      this.groundPieces.push(newPiece);
      this.container.addChild(newPiece);
    }
  }

  /** Clear all textures and sprites */
  destroy(): void {
    this.container.destroy({
      children: true,
      texture: true,
      textureSource: true,
    });
    this.groundPieces = [];
    this.background = undefined;
  }
}
