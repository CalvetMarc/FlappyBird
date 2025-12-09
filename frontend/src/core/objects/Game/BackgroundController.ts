import { Container, Sprite, Rectangle, Size, Bounds } from "pixi.js";
import { LAYERS } from "../../abstractions/IScene";
import { IGameObject } from "../../abstractions/IGameObject"; 

import { Milliseconds } from "../../time/TimeUnits";

import { LayoutManager } from "../../managers/LayoutManager";
import { AssetsManager } from "../../managers/AssetsManager";
import { GameManager } from "../../managers/GameManager";
import { Event } from "../../abstractions/events";
import { BlurFilter } from "pixi.js";

const groundTileSpawnProbabilities = [0.3, 0.25, 0.25, 0.2];

const BACKGROUND_KEYS: string[] = [
  "bgNoon",
  "bgAfternoon",
  "bgNight",
  "bgEvening",
  "bgMorning",
];

const DAY_CYCLE_DURATION = 60; 

export class BackgroundController implements IGameObject {
  private backgroundHolder: Container;

  private backgrounds: Map<string, Sprite> = new Map();
  private groundPieces: Sprite[] = [];

  private readonly difficultySpeedIncrease = 0.0592;
  private readonly baseScrollSpeed: number = 0.37;
  private currentScrollSpeed: number;

  private scrolling = false;
  private elapsedSec: number = 0;
  public container: Container;

  public constructor() {
    this.container = new Container();
    this.backgroundHolder = new Container();
    this.currentScrollSpeed = this.baseScrollSpeed;
    this.onCreate();
  }
    
  public async onCreate() {   
    LayoutManager.I.gameContainer.addChild(this.container);

    this.createBackground();
    this.createGroundPieces();
    this.container.sortableChildren = true;
    this.setScrolling(false);
    
    window.addEventListener(Event.DIFFICULTY_INCREASE, this.increaseDifficulty);
    window.addEventListener(Event.DAY_CYCLE_CHANGE, this.updateCycle);
  }  

  public onUpdate(dt: Milliseconds) {
    
    const delta = (dt / 1000);
    this.elapsedSec += delta;

    if (GameManager.I.settings.dayCycleEnabled) {

      const phase = ((this.elapsedSec % DAY_CYCLE_DURATION) + DAY_CYCLE_DURATION) % DAY_CYCLE_DURATION; 
      const segment = DAY_CYCLE_DURATION / BACKGROUND_KEYS.length; 

      const currentIndex = Math.floor(phase / segment);
      const nextIndex = (currentIndex + 1) % BACKGROUND_KEYS.length;
      const localT = (phase - currentIndex * segment) / segment;

      for (let i = 0; i < BACKGROUND_KEYS.length; i++) {
        const key = BACKGROUND_KEYS[i];
        const sprite = this.backgrounds.get(key);
        if (!sprite) continue;

        if (i === currentIndex) {
          sprite.alpha = 1 - localT;
          sprite.zIndex = LAYERS.BACKGROUND - 1;
        } else if (i === nextIndex) {
          sprite.alpha = localT;
          sprite.zIndex = LAYERS.BACKGROUND;
        } else {
          sprite.alpha = 0;
        }
      }
    }
    
    if (!this.scrolling) return;

    for (const piece of this.groundPieces) {
      piece.x -= delta * this.currentScrollSpeed * (LayoutManager.I.layoutCurrentSize.width / LayoutManager.I.layoutScale.x);
    }

    const firstSlice = this.groundPieces[0];
    const lastSlice = this.groundPieces[this.groundPieces.length - 1];    

    if (!firstSlice || !lastSlice) return;

    if (firstSlice.x < -firstSlice.width) {
      this.container.removeChild(firstSlice);
      this.groundPieces.shift();

      const newPiece = this.createRandomPiece(
        new Rectangle(
          lastSlice.x + lastSlice.width,
          lastSlice.y,
          lastSlice.width,
          lastSlice.height
        )
      );

      this.groundPieces.push(newPiece);
      this.container.addChild(newPiece);
    }
  }

  public async onDestroy(): Promise<void> {
    window.removeEventListener(Event.DAY_CYCLE_CHANGE, this.updateCycle);
    window.removeEventListener(Event.DIFFICULTY_INCREASE, this.increaseDifficulty);

    this.backgrounds.forEach((value, key) => {
      AssetsManager.I.releaseSprite(value);
    });

    this.backgrounds.clear();

    this.container.destroy({
      children: true,
      texture: true,
      textureSource: true,
    });

    this.groundPieces = [];
  } 

  public setScrolling(scrolling: boolean) {
    this.scrolling = scrolling;
    if(scrolling){
      this.currentScrollSpeed = this.baseScrollSpeed;
    }
  } 

  public get groundBounds(): Bounds | undefined {
    if (this.groundPieces.length <= 0) return undefined;

    return new Bounds(
      this.groundPieces[0].x,
      this.groundPieces[0].y,
      this.groundPieces[0].x + (this.groundPieces[0].width * this.groundPieces.length),
      this.groundPieces[0].y + this.groundPieces[0].height
    );
  }

  private createBackground() {
    const targetHeight = LayoutManager.I.layoutVirtualSize.height * 0.85;
    const targetWidth = targetHeight;

    const blur = new BlurFilter();
    blur.strength = 3; 

    for (const key of BACKGROUND_KEYS) {
      const currentBG: Sprite = AssetsManager.I.getSprite(key);
      currentBG.width = targetWidth;
      currentBG.height = targetHeight;
      currentBG.zIndex = LAYERS.BACKGROUND; 
      currentBG.alpha = key === "bgNoon" ? 1 : 0; 
      this.backgrounds.set(key, currentBG);
      this.container.addChild(currentBG);          

      this.backgrounds.set(key, currentBG);
      this.backgroundHolder.addChild(currentBG);      
    }    
    this.backgroundHolder.filters = [blur];
    this.container.addChild(this.backgroundHolder);
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
    piece.scale.set(
      pieceRectangle.width  / piece.texture.width,
      pieceRectangle.height / piece.texture.height
    );
    piece.zIndex = LAYERS.GROUND;
    return piece;
  }   

  private increaseDifficulty = () => {
    this.currentScrollSpeed += this.difficultySpeedIncrease;
  }

  private updateCycle = (): void => {
    if(!GameManager.I.settings.dayCycleEnabled){
      for (const key of BACKGROUND_KEYS) {
        this.backgrounds.get(key)!.alpha = key === "bgNoon" ? 1 : 0;
      }  
    }
  }
}
