import { Application, Container, Sprite, Texture, Rectangle, Assets, Bounds } from "pixi.js";
import { LAYERS } from "../../abstractions/IScene";
import { IGameObject } from "../../abstractions/IGameObject";
import { Milliseconds } from "../../time/TimeUnits";
import pipeUrl from "../../../../public/assets/tiles/SimpleStyle1.png"
import { LayoutManager } from "../../managers/LayoutManager";
import { AssetsManager } from "../../managers/AssetsManager";
import { GameManager } from "../../managers/GameManager";

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

  private pipeSpeed = 200;
  private pipeInterval = 3000;
  private pipeTimer = 0;
  private maxPipeTiles = 15;
  private bottomTopTilesGapMargin = 5;
  private nextToScoreIdx = -1;

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

    if(this.obstacles.length <= 0) return;

    for (const obstacle of this.gamePipes) {
      for (const sprite of [...obstacle.upPipe, ...obstacle.downPipe]) {
        sprite.x -= this.pipeSpeed * deltaSeconds;
      }
    }

    const leftLimit = -this.obstacles[0].upPipe[0].width;

    this.gamePipes = this.gamePipes.filter((obstacle) => {
      const visible = [...obstacle.upPipe, ...obstacle.downPipe].some(
        (s) => s.x + s.width > leftLimit
      );

      if (!visible) {
        for (const sprite of [...obstacle.upPipe, ...obstacle.downPipe]) {
          AssetsManager.I.releaseSprite(sprite);
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

  public get nextObstacleBounds(): Bounds[]{
    this.nextToScoreIdx = this.gamePipes.findIndex(o => !o.scored);
    if(this.nextToScoreIdx === -1) return [];

    const nextObstacle = this.gamePipes[this.nextToScoreIdx];

    const upLastIdx = nextObstacle.upPipe.length -1;
    const downLastIdx = nextObstacle.downPipe.length -1;

    const upBounds: Bounds = new Bounds(nextObstacle.upPipe[upLastIdx].x, nextObstacle.upPipe[upLastIdx].y, nextObstacle.upPipe[upLastIdx].x + nextObstacle.upPipe[upLastIdx].width, 
      nextObstacle.upPipe[0].y + nextObstacle.upPipe[0].height);
    const downBounds: Bounds = new Bounds(nextObstacle.downPipe[0].x, nextObstacle.downPipe[0].y, nextObstacle.downPipe[0].x + nextObstacle.downPipe[0].width, 
      nextObstacle.downPipe[downLastIdx].y + nextObstacle.downPipe[downLastIdx].height);

    return [upBounds, downBounds];
  }

  public scoreNext(){
    if(this.nextToScoreIdx === -1) return;

    this.gamePipes[this.nextToScoreIdx].scored = true;
  }

  private CreateObstacle() {
    const pipeTileSize = AssetsManager.I.getTextureSize("greenPipe");
    const aspectRelationPipeTile = pipeTileSize.width / pipeTileSize.height;
    
    const groundTilesBounds: Bounds = GameManager.I.appBackground.groundBounds;
    const pipeTileHeight = (LayoutManager.I.layoutVirtualSize.height - (groundTilesBounds.maxY - groundTilesBounds.minY)) / this.maxPipeTiles;
    const pipeTileWidth = pipeTileHeight * aspectRelationPipeTile;

    const gapSlot = this.randomInteger(this.bottomTopTilesGapMargin + 1, this.maxPipeTiles - this.bottomTopTilesGapMargin + 1);
    const startX =  LayoutManager.I.layoutVirtualSize.width;

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
