import { Application, Container, Sprite, Texture, Rectangle, Assets, Graphics } from "pixi.js";
import { SceneManager } from "./SceneManager";

// Assets
import pipeUrl from "../assets/tiles/SimpleStyle1.png";
import { BackgroundManager } from "./BackgroundManager";

interface Obstacle{
    upPipe: Sprite[];
    downPipe: Sprite[];
    gap: number;
}

export class PipeManager {
  private app!: Application;
  private container = new Container();
  private pipeTextures: Texture[] = [];
  private gamePipes: Obstacle[] = [];

  // Singleton
  private static _i: PipeManager;
  static get I() {
    return (this._i ??= new PipeManager());
  }

  private constructor() {}

  /** Initialize and load assets */
  async init(app: Application) {
    const pipeTex = await Assets.load(pipeUrl);

    for(let i = 0; i < 5; i++){
        this.pipeTextures.push(new Texture({source: pipeTex.source, frame: new Rectangle(0, i * 16, 32, 16)}));
    }
    
  }

  /** Return the background container so it can be added to scenes */
  get view(): Container {
    return this.container;
  }  

  /** Called every frame from SceneManager.update(dt) */
  public update(dt: number) {
    
  }

  /** Clear all textures and sprites */
  destroy(): void {
    this.container.destroy({
      children: true,
      texture: true,
      textureSource: true,
    });
   
  }

  public CreateObstacle(){
    const maxPipeTiles = 15;
    const pipeTileHeight = BackgroundManager.I.bgHeight / 15;
    const pipeTileWidth = this.pipeTextures[0].width / this.pipeTextures[0].height * pipeTileHeight;

    const bottomTopSlotsMargin = 5;
    const gapSlot = this.randomInteger(bottomTopSlotsMargin + 1, maxPipeTiles - bottomTopSlotsMargin + 1);

    const upPipe: Sprite[] = [];
    upPipe.push(new Sprite(this.pipeTextures[this.pipeTextures.length - 1]));
    upPipe[upPipe.length - 1].position.x = BackgroundManager.I.bgPosX + (BackgroundManager.I.bgWidth/2);
    upPipe[upPipe.length - 1].position.y = pipeTileHeight * (gapSlot - 3);
    upPipe.push(new Sprite(this.pipeTextures[this.pipeTextures.length - 2]));
    upPipe[upPipe.length - 1].position.x = BackgroundManager.I.bgPosX + (BackgroundManager.I.bgWidth/2);
    upPipe[upPipe.length - 1].position.y = pipeTileHeight * (gapSlot - 4);
    for(let i = gapSlot - 4; i > 0; i--){
        upPipe.push(new Sprite(this.pipeTextures[this.pipeTextures.length - 3]));
        upPipe[upPipe.length - 1].position.x = BackgroundManager.I.bgPosX + (BackgroundManager.I.bgWidth/2);
        upPipe[upPipe.length - 1].position.y = pipeTileHeight * (i - 1);
    }
   
    
    const downPipe: Sprite[] = [];
    downPipe.push(new Sprite(this.pipeTextures[0]));
    downPipe[downPipe.length - 1].position.x = BackgroundManager.I.bgPosX + (BackgroundManager.I.bgWidth/2);
    downPipe[downPipe.length - 1].position.y = pipeTileHeight * (gapSlot + 2);
    downPipe.push(new Sprite(this.pipeTextures[1]));
    downPipe[downPipe.length - 1].position.x = BackgroundManager.I.bgPosX + (BackgroundManager.I.bgWidth/2);
    downPipe[downPipe.length - 1].position.y = pipeTileHeight * (gapSlot + 3);
    for(let i = gapSlot + 3; i < maxPipeTiles - 1; i++){
        downPipe.push(new Sprite(this.pipeTextures[2]));
        downPipe[downPipe.length - 1].position.x = BackgroundManager.I.bgPosX + (BackgroundManager.I.bgWidth/2);
        downPipe[downPipe.length - 1].position.y = pipeTileHeight * (i + 1);
    }

    for(const sprite of upPipe){
        sprite.width = pipeTileWidth;
        sprite.height = pipeTileHeight;
        BackgroundManager.I.view.addChild(sprite);

        
    }
    for(const sprite of downPipe){
        sprite.width = pipeTileWidth;
        sprite.height = pipeTileHeight;
        BackgroundManager.I.view.addChild(sprite);
    }

    this.gamePipes.push({upPipe, downPipe, gap: gapSlot})
  }

  public randomInteger(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /** Rebuild background and ground when screen resizes */
  public rebuild(screenW: number, screenH: number): void {
    // Remove current elements
    this.container.removeChildren();
    

    // Recalculate sizes and recreate
    // 👈 Make sure they exist

    
  }
}
