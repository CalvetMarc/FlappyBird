import { Application, Container, Sprite, Texture, Rectangle, Assets } from "pixi.js";
import { BackgroundManager } from "../managers/BackgroundManager";
import { LAYERS } from "../abstractions/IScene";
import { IGameObject } from "../abstractions/IGameObject";
import { Milliseconds } from "../time/TimeUnits";
import pipeUrl from "../../assets/tiles/SimpleStyle1.png";

interface Obstacle {
  upPipe: Sprite[];
  downPipe: Sprite[];
  gap: number;
  scored: boolean;
  startX: number;
  endX: number;
}

export class PipesController implements IGameObject{  
  private pipeTextures: Texture[] = [];
  private gamePipes: Obstacle[] = [];

  private pipeSpeed = 0.2;
  private pipeInterval = 3000;
  private pipeTimer = 0;
  private maxPipeTiles = 15;
  private bottomTopTilesGapMargin = 5;

  private move!: boolean;

  public container = new Container();

  constructor(){
  } 

  public async onCreate(): Promise<void>{
    this.container.sortableChildren = true;
    this.container.zIndex = LAYERS.PIPES;
    this.pipeTextures = [];

    const pipeTex = await Assets.load(pipeUrl);

    for (let i = 0; i < 5; i++) {
      this.pipeTextures.push(
        new Texture({ source: pipeTex.source, frame: new Rectangle(0, i * 16, 32, 16) })
      );
    }

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
        sprite.x -= this.pipeSpeed * deltaSeconds * BackgroundManager.I.bgRect.width;
      }
    }

    const leftLimit = BackgroundManager.I.bgRect.x - BackgroundManager.I.bgRect.width / 2;

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
      
  }

  public onResize(width: number, height: number): void {
    const pipeTileHeight = BackgroundManager.I.bgRect.height / this.maxPipeTiles;
    const pipeTileWidth = (this.pipeTextures[0].width / this.pipeTextures[0].height) * pipeTileHeight;

    const startX = BackgroundManager.I.bgRect.x + BackgroundManager.I.bgRect.width;
    const endX =
      BackgroundManager.I.bgRect.x - BackgroundManager.I.bgRect.width / 2 - pipeTileWidth / 2;

    for (const obstacle of this.obstacles) {
      const normalizedMovementDone =
        (obstacle.upPipe[0].position.x - obstacle.endX) /
        (obstacle.startX - obstacle.endX);

      const proportionalCurrentPositionX = startX - (startX - endX) * normalizedMovementDone;

      const startIndex = obstacle.upPipe.length - 1;
      for (let i = 0; i < obstacle.upPipe.length; i++) {
        obstacle.upPipe[i].position.x = proportionalCurrentPositionX;
        obstacle.upPipe[i].position.y = pipeTileHeight * (startIndex - i);
      }

      for (let i = 0; i < obstacle.downPipe.length; i++) {
        obstacle.downPipe[i].position.x = proportionalCurrentPositionX;
        obstacle.downPipe[i].position.y = pipeTileHeight * (i + obstacle.gap);
      }

      obstacle.startX = startX;
      obstacle.endX = endX;
    }
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
    const pipeTileHeight = BackgroundManager.I.bgRect.height / this.maxPipeTiles;
    const pipeTileWidth = (this.pipeTextures[0].width / this.pipeTextures[0].height) * pipeTileHeight;

    const gapSlot = this.randomInteger(
      this.bottomTopTilesGapMargin + 1,
      this.maxPipeTiles - this.bottomTopTilesGapMargin + 1
    );
    const startX = BackgroundManager.I.bgRect.x + BackgroundManager.I.bgRect.width;

    const upPipe: Sprite[] = [];
    const downPipe: Sprite[] = [];

    upPipe.push(this.makePipe(this.pipeTextures[4], startX, pipeTileHeight * (gapSlot - 3), pipeTileWidth, pipeTileHeight));
    upPipe.push(this.makePipe(this.pipeTextures[3], startX, pipeTileHeight * (gapSlot - 4), pipeTileWidth, pipeTileHeight));
    for (let i = gapSlot - 4; i > 0; i--) {
      upPipe.push(this.makePipe(this.pipeTextures[2], startX, pipeTileHeight * (i - 1), pipeTileWidth, pipeTileHeight));
    }

    downPipe.push(this.makePipe(this.pipeTextures[0], startX, pipeTileHeight * (gapSlot + 2), pipeTileWidth, pipeTileHeight));
    downPipe.push(this.makePipe(this.pipeTextures[1], startX, pipeTileHeight * (gapSlot + 3), pipeTileWidth, pipeTileHeight));
    for (let i = gapSlot + 3; i < this.maxPipeTiles - 1; i++) {
      downPipe.push(this.makePipe(this.pipeTextures[2], startX, pipeTileHeight * (i + 1), pipeTileWidth, pipeTileHeight));
    }

    this.gamePipes.push({ upPipe, downPipe, gap: gapSlot, scored: false, startX: startX, endX: BackgroundManager.I.bgRect.x - (BackgroundManager.I.bgRect.width / 2) - (pipeTileWidth / 2) });
  }

  private makePipe(tex: Texture, x: number, y: number, w: number, h: number): Sprite {
    const sprite = new Sprite(tex);
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
