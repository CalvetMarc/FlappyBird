import { Container, Sprite, Texture, Rectangle, Assets, Graphics, Size, ObservablePoint, Point, Bounds } from "pixi.js";
import { LAYERS } from "../../abstractions/IScene";
import { SingletonBase } from "../../abstractions/SingletonBase";
import { IGameObject } from "../../abstractions/IGameObject"; 

import { Milliseconds } from "../../time/TimeUnits";

import { LayoutManager } from "../../managers/LayoutManager";
import { AssetsManager } from "../../managers/AssetsManager";

const scrollSpeed = 230;
const groundTileSpawnProbabilities = [0.3, 0.25, 0.25, 0.2];


export class BackgroundController implements IGameObject {
  private background?: Sprite;
  private groundPieces: Sprite[] = [];

  private scrolling = false;

  public container: Container;

  public constructor() {
    this.container = new Container();
    this.onCreate();
  }
    
  public async onCreate() {   
    LayoutManager.I.gameContainer.addChild(this.container);

    this.createBackground();
    this.createGroundPieces();
    this.container.sortableChildren = true;
    this.setScrolling(true);
  }  

  public onUpdate(dt: Milliseconds) {
    if (!this.scrolling) return;

    const delta = (dt / 1000);

    for (const piece of this.groundPieces) {
      piece.x -= delta * scrollSpeed ;
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

  public setScrolling(scrolling: boolean) {
    this.scrolling = scrolling;
  } 

  public get groundBounds(): Bounds | undefined{
    if(this.groundPieces.length <= 0) return undefined;

    return new Bounds(this.groundPieces[0].x, this.groundPieces[0].y, this.groundPieces[0].x + (this.groundPieces[0].width * this.groundPieces.length), this.groundPieces[0].y + this.groundPieces[0].height);
  }

  private createBackground() {
    const targetHeight = LayoutManager.I.layoutVirtualSize.height * 0.85;
    const targetWidth = targetHeight;

    this.background = AssetsManager.I.getSprite("bgNoon") as Sprite;
    this.background.width = targetWidth;
    this.background.height = targetHeight;
    this.background.zIndex = LAYERS.BACKGROUND;    
        
    this.container.addChild(this.background);    
  }

  private createGroundPieces() {    

    const textureSize: Size = AssetsManager.I.getTextureSize("groundDay", 0);
    const sliceAspectRatio = textureSize.width / textureSize.height;

    const sliceHeight = LayoutManager.I.layoutVirtualSize.height * 0.15;    
    const sliceWidth = sliceHeight * sliceAspectRatio;    

    const sliceY = LayoutManager.I.layoutCurrentSize.height * (1 - 0.15);
    let currentX = 0;
    const endX = LayoutManager.I.layoutCurrentSize.width;

    while (currentX < endX + sliceWidth) {
      const piece = this.createRandomPiece(new Rectangle(currentX, sliceY, sliceWidth, sliceHeight));
      this.groundPieces.push(piece);
      this.container.addChild(piece);
      currentX += sliceWidth;
    }
  }

  private createRandomPiece(pieceRectangle: Rectangle): Sprite {
    const r = Math.random();
    let cumulative = 0;
    let index = 0;

    for (let i = 0; i < groundTileSpawnProbabilities.length; i++) {
      cumulative += groundTileSpawnProbabilities[i];
      if (r < cumulative) {
        index = i;
        break;
      }
    }

    const piece = AssetsManager.I.getSprite("groundDay", index);
    piece.position.set(pieceRectangle.x, pieceRectangle.y);
    piece.scale.set(pieceRectangle.width  / piece.texture.width, pieceRectangle.height / piece.texture.height);
    piece.zIndex = LAYERS.GROUND;
    return piece;
  }   
  
}
