import { Application, Container, Sprite, Texture, Rectangle, Assets } from "pixi.js";
import { LAYERS } from "../../abstractions/IScene";
import { IGameObject } from "../../abstractions/IGameObject";
import { Milliseconds } from "../../time/TimeUnits";
import pipeUrl from "../../../../public/assets/tiles/SimpleStyle1.png"
import { LayoutManager } from "../../managers/LayoutManager";
import { AssetsManager } from "../../managers/AssetsManager";

interface Obstacle {
  upPipe: Sprite[];
  downPipe: Sprite[];
  gap: number;
  scored: boolean;
  startX: number;
  endX: number;
}

export class PipesController implements IGameObject{  
  private gamePipes: Obstacle[] = [];

  private pipeSpeed = 0.2;
  private pipeInterval = 3000;
  private pipeTimer = 0;
  private maxPipeTiles = 15;
  private bottomTopTilesGapMargin = 5;

  private move!: boolean;

  public container :Container;

  constructor(){
    this.container = new Container();
    this.container.sortableChildren = true;
    this.container.zIndex = LAYERS.PIPES;
  } 

  public async onCreate(): Promise<void>{

    this.gamePipes = [];
    this.pipeTimer = 0;

    this.CreateObstacle();
    this.move = true;

  }  

  public onUpdate(dt: Milliseconds): void {   
    if (!this.move) return;

    const deltaSeconds = dt / 1000;
    this.pipeTimer += dt;

    if (this.pipeTimer >= this.pipeInterval) {
      this.pipeTimer = 0;
      this.CreateObstacle();
    }

    for (const obstacle of this.gamePipes) {
      for (const sprite of [...obstacle.upPipe, ...obstacle.downPipe]) {
        sprite.x -= this.pipeSpeed * deltaSeconds * LayoutManager.I.layoutSize.width;
      }
    }

    const leftLimit = LayoutManager.I.layoutBounds.minX;

    this.gamePipes = this.gamePipes.filter((obstacle) => {
      const visible = [...obstacle.upPipe, ...obstacle.downPipe].some(
        (s) => s.x + s.width > leftLimit
      );

      if (!visible) {
        for (const sprite of [...obstacle.upPipe, ...obstacle.downPipe]) {
          sprite.destroy({ children: true, texture: false });
        }
      }

      return visible;
    });
  }

  public async onDestroy(): Promise<void> {
      //Todo
  }

 public setScroll(move: boolean){
  this.move = move;
 }

  public get containerObject(): Container {
    return this.container;
  }

  public get obstacles(): ReadonlyArray<Obstacle> {
    return this.gamePipes;
  }  

  private CreateObstacle() {
    const pipeTileSize = AssetsManager.I.getTextureSize("greenPipe");
    const aspectRelationPipeTile = pipeTileSize.width / pipeTileSize.height;
    
    const pipeTileHeight = LayoutManager.I.layoutSize.height / this.maxPipeTiles;
    const pipeTileWidth = pipeTileHeight * pipeTileHeight;

    const gapSlot = this.randomInteger(this.bottomTopTilesGapMargin + 1, this.maxPipeTiles - this.bottomTopTilesGapMargin + 1);
    const startX =  LayoutManager.I.layoutBounds.maxX;

    const upPipe: Sprite[] = [];
    const downPipe: Sprite[] = [];

    upPipe.push(this.makePipe("greenPipe", 4, startX, pipeTileHeight * (gapSlot - 3), pipeTileWidth, pipeTileHeight));
    upPipe.push(this.makePipe("greenPipe", 3, startX, pipeTileHeight * (gapSlot - 4), pipeTileWidth, pipeTileHeight));
    for (let i = gapSlot - 4; i > 0; i--) {
      upPipe.push(this.makePipe("greenPipe", 2, startX, pipeTileHeight * (i - 1), pipeTileWidth, pipeTileHeight));
    }

    downPipe.push(this.makePipe("greenPipe", 0, startX, pipeTileHeight * (gapSlot + 2), pipeTileWidth, pipeTileHeight));
    downPipe.push(this.makePipe("greenPipe", 1, startX, pipeTileHeight * (gapSlot + 3), pipeTileWidth, pipeTileHeight));
    for (let i = gapSlot + 3; i < this.maxPipeTiles - 1; i++) {
      downPipe.push(this.makePipe("greenPipe", 2, startX, pipeTileHeight * (i + 1), pipeTileWidth, pipeTileHeight));
    }

    this.gamePipes.push({ upPipe, downPipe, gap: gapSlot, scored: false, startX: startX, endX: LayoutManager.I.layoutBounds.minX });
  }

  private makePipe(asset: string, frame: number, x: number, y: number, w: number, h: number): Sprite {
    const sprite = AssetsManager.I.getSprite(asset, frame);
    sprite.width = w;
    sprite.height = h;
    sprite.position.set(x, y);
    this.container.addChild(sprite);
    return sprite;
  }

  private randomInteger(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
