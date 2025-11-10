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

  /** Create random ground using weighted selection */
  private createGroundPieces(originalTexture: Texture) {
    const { width: screenW, height: screenH } = this.app.renderer;
    const groundWidth = this.background?.width ?? screenW;
    const targetHeight = screenH * 0.15;

    const texW = originalTexture.width;
    const texH = originalTexture.height;
    const baseCropX = 0;
    const baseCropWidth = texW * 0.5;
    const cropHeight = texH * 0.284;
    const cropY = texH - cropHeight;

    const scale = targetHeight / cropHeight;
    const pieceCount = 4;
    const subWidth = baseCropWidth / pieceCount;
    const scaledWidth = subWidth * scale;
    const y = screenH;
    const startX = (screenW - groundWidth) / 2;

    // Generate 4 base cropped pieces
    const baseTextures: Texture[] = [];
    for (let i = 0; i < pieceCount; i++) {
      const cropX = baseCropX + i * subWidth;
      const croppedTexture = new Texture({
        source: originalTexture.source,
        frame: new Rectangle(cropX, cropY, subWidth, cropHeight),
      });
      baseTextures.push(croppedTexture);
    }

    // Weighted probabilities for each piece
    const probabilities = [0.3, 0.25, 0.25, 0.2];
    const pickRandomIndex = (): number => {
      const r = Math.random();
      let cumulative = 0;
      for (let i = 0; i < probabilities.length; i++) {
        cumulative += probabilities[i];
        if (r < cumulative) return i;
      }
      return probabilities.length - 1;
    };

    // Fill screen width with random pieces
    let currentX = startX;
    while (currentX < startX + groundWidth) {
      const index = pickRandomIndex();
      const tex = baseTextures[index];
      const piece = new Sprite(tex);
      piece.scale.set(scale);
      piece.anchor.set(0, 1);
      piece.position.set(currentX, y);

      this.container.addChild(piece);
      this.groundPieces.push(piece);
      currentX += scaledWidth;
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
