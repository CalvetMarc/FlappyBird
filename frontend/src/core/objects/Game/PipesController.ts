import { Application, Container, Sprite, Texture, Rectangle, Assets, Bounds } from "pixi.js";
import { LAYERS } from "../../abstractions/IScene";
import { IGameObject } from "../../abstractions/IGameObject";
import { Milliseconds } from "../../time/TimeUnits";
import { LayoutManager } from "../../managers/LayoutManager";
import { AssetsManager } from "../../managers/AssetsManager";
import { GameManager } from "../../managers/GameManager";
import { Event } from "../../abstractions/events";

interface Obstacle {
  upPipe: Sprite[];
  downPipe: Sprite[];
  gap: number;
  scored: boolean;
  startX: number;
  endX: number;
}

type Difficulty = {
  pipeSpeed: number,
  pipeInterval: number
}

const pipeColors: string[] = ["greenPipe", "orangePipe", "redPipe", "bluePipe"]

export class PipesController implements IGameObject{  
  private gamePipes: Obstacle[] = [];

  private readonly baseDifficulty: Difficulty = { pipeSpeed: 0.25, pipeInterval: 2000 }
  private currentDifficulty: Difficulty;

  private pipeTimer: number = 0;
  
  private readonly difficultySpeedIncrease = 0.04;
  private readonly difficultyIntervalDecrease = 100;

  private maxPipeTiles: number = 15;
  private minTilesPerPipe: number = 2;
  private upGapSlots: number = 3;
  private downGapSlots: number = 2;
  private nextToScoreIdx: number = -1;
  private scored: number = 0;

  private move!: boolean;

  private lastPipesColor: string = "";

  public container :Container;

  constructor(){
    this.container = new Container();
    this.container.sortableChildren = true;
    this.container.zIndex = LAYERS.PIPES;
    this.currentDifficulty = { ...this.baseDifficulty };
  } 

  public async onCreate(): Promise<void>{
    this.gamePipes = [];
    this.pipeTimer = 0;    
    window.addEventListener(Event.DIFFICULTY_INCREASE, this.increaseDifficulty);

    this.currentDifficulty = { ...this.baseDifficulty };

    this.CreateObstacle();
    this.move = true;
    this.scored = 0;
  }  

  public onUpdate(dt: Milliseconds): void {   
    if (!this.move) return;

    const deltaSeconds = dt / 1000;    

    this.pipeTimer += dt;
    const pipeScaledInterval = this.currentDifficulty.pipeInterval;

    if (this.pipeTimer >= pipeScaledInterval) {
      this.pipeTimer = 0;
      this.CreateObstacle();
    }

    if(this.obstacles.length <= 0) return;

    for (const obstacle of this.gamePipes) {
      for (const sprite of [...obstacle.upPipe, ...obstacle.downPipe]) {
        sprite.x -= this.currentDifficulty.pipeSpeed * deltaSeconds * 
            (LayoutManager.I.layoutCurrentSize.width / LayoutManager.I.layoutScale.x);
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
    window.removeEventListener(Event.DIFFICULTY_INCREASE, this.increaseDifficulty);

    for(const obstacle of this.obstacles){
      for (const spr of obstacle.upPipe.concat(obstacle.downPipe)) {
        spr.removeFromParent();
        AssetsManager.I.releaseSprite(spr);
      }
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
    this.scored++;
  }

  private CreateObstacle() {
    const selectedPipe: string = this.getPipeName();

    const pipeTileSize = AssetsManager.I.getTextureSize(selectedPipe);
    const aspectRelationPipeTile = pipeTileSize.width / pipeTileSize.height;
    
    const groundTilesBounds: Bounds = GameManager.I.appBackground.groundBounds;
    const pipeTileHeight = (LayoutManager.I.layoutVirtualSize.height - (groundTilesBounds.maxY - groundTilesBounds.minY)) / this.maxPipeTiles;
    const pipeTileWidth = pipeTileHeight * aspectRelationPipeTile;

    const gapSlot = this.randomInteger(this.minTilesPerPipe + this.upGapSlots - 1, 
        (this.maxPipeTiles) - (this.minTilesPerPipe + this.downGapSlots));

    const startX =  LayoutManager.I.layoutVirtualSize.width;

    const upPipe: Sprite[] = [];
    const downPipe: Sprite[] = [];

    upPipe.push(this.makePipe(selectedPipe, 4, startX, pipeTileHeight * (gapSlot - this.upGapSlots), pipeTileWidth, pipeTileHeight));
    upPipe.push(this.makePipe(selectedPipe, 3, startX, pipeTileHeight * (gapSlot - (this.upGapSlots + 1)), pipeTileWidth, pipeTileHeight));
    for (let i = gapSlot - 4; i > 0; i--) {
      upPipe.push(this.makePipe(selectedPipe, 2, startX, pipeTileHeight * (i - 1), pipeTileWidth, pipeTileHeight));
    }

    downPipe.push(this.makePipe(selectedPipe, 0, startX, pipeTileHeight * (gapSlot + this.downGapSlots), pipeTileWidth, pipeTileHeight));
    downPipe.push(this.makePipe(selectedPipe, 1, startX, pipeTileHeight * (gapSlot + (this.downGapSlots + 1)), pipeTileWidth, pipeTileHeight));
    for (let i = gapSlot + 3; i < this.maxPipeTiles - 1; i++) {
      downPipe.push(this.makePipe(selectedPipe, 2, startX, pipeTileHeight * (i + 1), pipeTileWidth, pipeTileHeight));
    }

    this.gamePipes.push({ 
      upPipe, 
      downPipe, 
      gap: gapSlot, 
      scored: false, 
      startX: startX, 
      endX: LayoutManager.I.layoutBounds.minX 
    });
  }

  private makePipe(asset: string, frame: number, x: number, y: number, w: number, h: number): Sprite {
    const sprite = AssetsManager.I.getSprite(asset, frame);
    sprite.width = w;
    sprite.height = h;
    sprite.position.set(x, y);
    this.container.addChild(sprite);
    return sprite;
  }

  private increaseDifficulty = () => {
    this.currentDifficulty.pipeSpeed += this.difficultySpeedIncrease;
    this.currentDifficulty.pipeInterval = Math.max(900,  this.currentDifficulty.pipeInterval - this.difficultyIntervalDecrease);
  }

  private randomInteger(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private getPipeName(): string{
    let colorToSpawn: string = "";

    if(this.scored < 10){
      colorToSpawn = pipeColors[0];
    }
    else if(this.scored < 20){
      colorToSpawn = pipeColors[1];
    }
    else if(this.scored < 30){
      colorToSpawn = pipeColors[2];
    }
    else if(this.scored < 40){
      colorToSpawn = pipeColors[3];
    }
    else if(this.scored < 55){
      colorToSpawn = this.lastPipesColor === pipeColors[0] ? pipeColors[1] : pipeColors[0];
    }
    else if(this.scored < 70){
      colorToSpawn = this.lastPipesColor === pipeColors[2] ? pipeColors[3] : pipeColors[2];
    }
    else if(this.scored < 85){
      colorToSpawn = this.lastPipesColor === pipeColors[0] ? pipeColors[2] : pipeColors[0];
    }
    else if(this.scored < 100){
      colorToSpawn = this.lastPipesColor === pipeColors[3] ? pipeColors[1] : pipeColors[3];
    }
    else{
      return pipeColors[Math.floor(Math.random() * (pipeColors.length))];
    }

    this.lastPipesColor = colorToSpawn;
    return colorToSpawn;
  }
}
