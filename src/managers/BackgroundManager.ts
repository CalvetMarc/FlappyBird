import { Application, Container, Sprite, Texture, Rectangle, Assets, Graphics } from "pixi.js";
import { LAYERS } from "./SceneManager";
import { SingletonBase } from "../abstractions/SingletonBase";

import backgroundUrl from "../assets/backgrounds/Background2.png";
import groundUrl from "../assets/tiles/SimpleStyle1.png";

export class BackgroundManager extends SingletonBase<BackgroundManager> {
  private app!: Application;
  private container = new Container();
  private background?: Sprite;
  private groundPieces: Sprite[] = [];

  private baseTextures: Texture[] = [];
  private scaledWidth = 0;
  private scale = 1;
  private groundY = 0;

  private startX = 0;
  private groundWidthPx = 0;
  private groundTexture?: Texture;

  private scrolling = false;
  private scrollSpeed = 1;

  private constructor() {
    super();
  }

  async init(app: Application) {
    this.app = app;
    const [bgTexture, groundTexture] = await Promise.all([
      Assets.load(backgroundUrl),
      Assets.load(groundUrl),
    ]);

    this.groundTexture = groundTexture;
    this.createBackground(bgTexture);
    this.createGroundPieces(groundTexture);
    this.container.sortableChildren = true;
  }

  get containerObject(): Container {
    return this.container;
  }

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
    this.background.zIndex = LAYERS.BACKGROUND;
    this.background.alpha = 0;

    this.container.addChild(this.background);
    return;
    const maskRect = new Graphics()
      .rect((screenW - targetWidth) / 2, 0, targetWidth, screenH)
      .fill(0xffffff);

    this.container.mask = maskRect;
    this.container.addChild(maskRect);
  }

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

    for (let i = 0; i < pieceCount; i++) {
      const cropX = i * subWidth;
      const croppedTexture = new Texture({
        source: originalTexture.source,
        frame: new Rectangle(cropX, cropY, subWidth, cropHeight),
      });
      this.baseTextures.push(croppedTexture);
    }

    let currentX = this.startX;
    const endX = this.startX + groundWidth + this.scaledWidth;
    while (currentX < endX) {
      const piece = this.createRandomPiece(currentX);
      this.groundPieces.push(piece);
      this.container.addChild(piece);
      currentX += this.scaledWidth;
    }
  }

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
    piece.zIndex = LAYERS.GROUND;
    return piece;
  }

  public start() {
    this.scrolling = true;
  }

  public stop() {
    this.scrolling = false;
  }

  public update(dt: number) {
    if (!this.scrolling) return;

    const scaleFactor = (this.background?.width ?? 800) * 0.3;
    const delta = (dt / 1000) * (this.scrollSpeed * scaleFactor);

    for (const piece of this.groundPieces) {
      piece.x -= delta;
    }

    const first = this.groundPieces[0];
    const last = this.groundPieces[this.groundPieces.length - 1];
    if (!first || !last) return;

    if (this.startX - first.x >= this.scaledWidth) {
      this.container.removeChild(first);
      this.groundPieces.shift();

      const newX = last.x + this.scaledWidth;
      const newPiece = this.createRandomPiece(newX);
      this.groundPieces.push(newPiece);
      this.container.addChild(newPiece);
    }
  }

  public destroy(): void {
    this.container.destroy({
      children: true,
      texture: true,
      textureSource: true,
    });
    this.groundPieces = [];
    this.background = undefined;
  }

  public rebuild(screenW: number, screenH: number): void {
    this.container.removeChildren();
    this.groundPieces = [];
    this.baseTextures = [];

    const bgTexture = this.background?.texture;
    if (!bgTexture || !this.groundTexture) return;

    this.createBackground(bgTexture);
    this.createGroundPieces(this.groundTexture);
  }

  public get groundBounds(): Rectangle | undefined {
    if (this.groundPieces.length === 0) return;

    const first = this.groundPieces[0];
    const bounds = first.getBounds();

    let minX = bounds.x;
    let maxX = bounds.x + bounds.width;
    let minY = bounds.y;
    let maxY = bounds.y + bounds.height;

    for (const piece of this.groundPieces) {
      const b = piece.getBounds();
      minX = Math.min(minX, b.x);
      maxX = Math.max(maxX, b.x + b.width);
      minY = Math.min(minY, b.y);
      maxY = Math.max(maxY, b.y + b.height);
    }

    return new Rectangle(minX, minY, maxX - minX, maxY - minY);
  }

  public get bgWidth(): number {
    return this.background?.width ?? 800;
  }

  public get bgHeight(): number {
    return this.background?.height ?? 1000;
  }

  public get bgPosX(): number {
    return this.background?.position.x ?? 400;
  }

  public get bgPosY(): number {
    return this.background?.position.y ?? 500;
  }
}
