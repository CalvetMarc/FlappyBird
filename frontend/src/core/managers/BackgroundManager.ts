import { Container, Sprite, Texture, Rectangle, Assets, Graphics, Size, ObservablePoint, Point } from "pixi.js";
import { LAYERS } from "../abstractions/IScene";
import { SingletonBase } from "../abstractions/SingletonBase";
import { IGameObject } from "../abstractions/IGameObject"; 

import { Milliseconds } from "../time/TimeUnits";

import { LayoutManager } from "./LayoutManager";
import { AssetsManager } from "./AssetsManager";

export class BackgroundManager extends SingletonBase<BackgroundManager> implements IGameObject {
  private background?: Sprite;
  private groundPieces: Sprite[] = [];

  private scrolling = false;
  private scrollSpeed = 300;

  public container: Container;

  private constructor() {
    super();

    this.container = new Container();
  }

  private async init() {   
    LayoutManager.I.gameContainer.addChild(this.container);

    this.createBackground();
    this.createGroundPieces();
    this.container.sortableChildren = true;
  }  

  private createBackground() {
    const targetHeight = LayoutManager.I.layoutSize.height * 0.85;
    const targetWidth = targetHeight;

    this.background = AssetsManager.I.getSprite("backgrounds", "noon") as Sprite;
    this.background.width = targetWidth;
    this.background.height = targetHeight;
    this.background.zIndex = LAYERS.BACKGROUND;    
        
    this.container.addChild(this.background);    
  }

  private createGroundPieces() {    

    const textureSize: Size = AssetsManager.I.getTextureSize("tiles", "groundDay", 0);
    const sliceAspectRatio = textureSize.width / textureSize.height;

    const sliceHeight = LayoutManager.I.layoutSize.height * 0.15;    
    const sliceWidth = sliceHeight * sliceAspectRatio;    

    const sliceY = LayoutManager.I.layoutSize.height * (1 - 0.15);
    let currentX = 0;
    const endX = LayoutManager.I.layoutSize.width;

    while (currentX < endX + sliceWidth) {
      const piece = this.createRandomPiece(new Rectangle(currentX, sliceY, sliceWidth, sliceHeight));
      this.groundPieces.push(piece);
      this.container.addChild(piece);
      currentX += sliceWidth;
    }
  }

  private createRandomPiece(pieceRectangle: Rectangle): Sprite {
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

    const piece = AssetsManager.I.getSprite("tiles", "groundDay", index);
    piece.position.set(pieceRectangle.x, pieceRectangle.y);
    piece.scale.set(pieceRectangle.width  / piece.texture.width, pieceRectangle.height / piece.texture.height
);
    piece.zIndex = LAYERS.GROUND;
    return piece;
  }  

  public async onCreate(): Promise<void> {
    await this.init();
    this.setScrolling(true);
  }

  public onUpdate(dt: Milliseconds) {
    if (!this.scrolling) return;

    //const scaleFactor = LayoutManager.I.layoutSize.width * 0.3;
    const delta = (dt / 1000) * (this.scrollSpeed);

    for (const piece of this.groundPieces) {
      piece.x -= delta;
    }

    const firstSlice = this.groundPieces[0];
    const lastSlice = this.groundPieces[this.groundPieces.length - 1];    

    if (!firstSlice || !lastSlice) return;

    if (firstSlice.x < -firstSlice.width) {
      this.container.removeChild(firstSlice);
      this.groundPieces.shift();

      const newPiece = this.createRandomPiece(new Rectangle(lastSlice.x + lastSlice.width, lastSlice.y, lastSlice.width, lastSlice.height));
      this.groundPieces.push(newPiece);
      this.container.addChild(newPiece);
    }
  }

  public async onDestroy(): Promise<void> {
    this.container.destroy({
      children: true,
      texture: true,
      textureSource: true,
    });
    this.groundPieces = [];
    this.background = undefined;
  }
  public onResize(screenW: number, screenH: number): void{

  }
  /*
  public onResize(screenW: number, screenH: number): void {
    //if (!this.background || !this.groundTexture) return;

    // 👉 Recalcular background (SENSE destruir)
    const aspect = this.background.texture.width / this.background.texture.height;
    const targetHeight = screenH * 0.85;
    const targetWidth = targetHeight * aspect;

    this.background.width = targetWidth;
    this.background.height = targetHeight;
    this.background.position.set(screenW / 2, 0);

    // 👉 Recalcular mask (SENSE recalc crear-la cada cop)
    if (this.container.mask instanceof Graphics) {
        const mask = this.container.mask as Graphics;
        mask.clear();
        mask.rect((screenW - targetWidth) / 2, 0, targetWidth, screenH).fill(0xffffff);
    }

    // 👉 Recalcular configuració del terra
    const texW = this.groundTexture.width;
    const texH = this.groundTexture.height;
    const cropHeight = texH * 0.284;

    this.scale = (screenH * 0.15) / cropHeight;
    this.scaledWidth = (texW * 0.5 / 4) * this.scale;
    this.groundY = screenH;
    this.startX = (screenW - targetWidth) / 2;
    this.groundWidthPx = targetWidth;

    // 👉 Reposicionar i rescalar peces existents del terra
    let x = this.startX;
    for (let i = 0; i < this.groundPieces.length; i++) {
        const piece = this.groundPieces[i];
        piece.scale.set(this.scale);
        piece.position.set(x, this.groundY);
        x += this.scaledWidth;
    }
}
*/

  

  public setScrolling(scrolling: boolean) {
    this.scrolling = scrolling;
  }

  
  
}
