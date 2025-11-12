import { Application, Container, Sprite, Texture, Rectangle, Assets } from "pixi.js";
import { BackgroundManager } from "./BackgroundManager";
import pipeUrl from "../assets/tiles/SimpleStyle1.png";
import { GameManager } from "./GameManager";
import { LAYERS } from "./SceneManager";

interface Obstacle {
  upPipe: Sprite[];
  downPipe: Sprite[];
  gap: number;
  scored: boolean;
  startX: number;
  endX: number
}

export class PipeManager {
  private app!: Application;
  private container = new Container();
  private pipeTextures: Texture[] = [];
  private gamePipes: Obstacle[] = [];

  // Config
  private pipeSpeed = 0.2; // proporció sobre amplada del fons
  private pipeInterval = 3000; // ms
  private pipeTimer = 0;
  private maxPipeTiles = 15;
  private bottomTopTilesGapMargin = 5;



  private move: boolean = false;

  // Singleton
  private static _i: PipeManager;
  public static get I() {
    return (this._i ??= new PipeManager());
  }

  private constructor() {
    this.init(GameManager.I.gameApp);
  }  

  /** 🔹 Retorna el container principal */
  public get containerObject(): Container {
    return this.container;
  }

  public get obstacles(): ReadonlyArray<Obstacle> {
    return this.gamePipes;
  }

  /** 🔁 Actualitza moviment, generació i neteja de tubs */
  public update(dt: number) {  
    if(!this.move){
      return;
    }

    const deltaSeconds = dt / 1000;
    this.pipeTimer += dt;

    // 🕒 Generar nous obstacles
    if (this.pipeTimer >= this.pipeInterval) {
      this.pipeTimer = 0;
      this.CreateObstacle();
    }

    // 🌀 Moure tubs
    for (const obstacle of this.gamePipes) {
      for (const sprite of [...obstacle.upPipe, ...obstacle.downPipe]) {
        sprite.x -= this.pipeSpeed * deltaSeconds * BackgroundManager.I.bgWidth;
      }
    }
    // 🧹 Eliminar tubs fora de pantalla
    const leftLimit = BackgroundManager.I.bgPosX - BackgroundManager.I.bgWidth / 2;

    this.gamePipes = this.gamePipes.filter((obstacle) => {
      // Si qualsevol sprite encara és visible, mantenim-lo
      const visible = [...obstacle.upPipe, ...obstacle.downPipe].some(
        (s) => s.x + s.width > leftLimit
      );

      if (!visible) {
        // Destrueix els sprites fora de pantalla
        for (const sprite of [...obstacle.upPipe, ...obstacle.downPipe]) {
          sprite.destroy({ children: true, texture: false });
        }
      }

      return visible;
    });
  }

   /** 🧽 Destrueix tot */
  public destroy(): void {
    for (const o of this.gamePipes) {
      for (const s of [...o.upPipe, ...o.downPipe]) s.destroy({ children: true, texture: false });
    }
    this.container.destroy({ children: true, texture: true, textureSource: true });
    this.gamePipes = [];
  }

  /** 🔄 Reajusta després d’un canvi de mida */
  public rebuild(): void {
    
    const pipeTileHeight = BackgroundManager.I.bgHeight / this.maxPipeTiles;
    const pipeTileWidth =  (this.pipeTextures[0].width / this.pipeTextures[0].height) * pipeTileHeight;

    const startX = BackgroundManager.I.bgPosX + BackgroundManager.I.bgWidth / 2;
    const endX = BackgroundManager.I.bgPosX - (BackgroundManager.I.bgWidth / 2) - (pipeTileWidth / 2)    

    for(const obstacle of this.obstacles){

      const normalizedMovementDone = (obstacle.upPipe[0].position.x - obstacle.endX) / (obstacle.startX - obstacle.endX);
      const proportionalCurrentPositionX =  startX - ((startX - endX) * normalizedMovementDone);

      const startIndex = obstacle.upPipe.length - 1;
      for (let i = 0; i < obstacle.upPipe.length; i++) {
        obstacle.upPipe[i].position.x = proportionalCurrentPositionX;
        obstacle.upPipe[i].position.y = pipeTileHeight * (startIndex - i);
      }

      for(let i = 0; i < obstacle.downPipe.length; i++){
        obstacle.downPipe[i].position.x = proportionalCurrentPositionX;
        obstacle.downPipe[i].position.y = pipeTileHeight * (i + obstacle.gap);
      }

      obstacle.startX = startX;
      obstacle.endX = endX;
    }
  }


  public start(): void{
    this.move = true;
  }

  public stop(): void{
    this.move = false;
  }


  /** 🔹 Inicialitza i carrega textures */
  private async init(app: Application) {
    this.app = app;
    this.container.sortableChildren = true;
    this.container.zIndex = LAYERS.PIPES;
    this.pipeTextures = [];

    const pipeTex = await Assets.load(pipeUrl);

    // 🧱 Crea les textures per cada tipus de tros de tub
    for (let i = 0; i < 5; i++) {
      this.pipeTextures.push(
        new Texture({ source: pipeTex.source, frame: new Rectangle(0, i * 16, 32, 16) })
      );
    }

    // Neteja inicial
    this.gamePipes = [];
    this.pipeTimer = 0;

    BackgroundManager.I.containerObject.addChild(this.container);
  }

  /** 🧱 Crea un nou obstacle (parella de tubs amb buit) */
  private CreateObstacle() {
    const pipeTileHeight = BackgroundManager.I.bgHeight / this.maxPipeTiles;
    const pipeTileWidth =  (this.pipeTextures[0].width / this.pipeTextures[0].height) * pipeTileHeight;

    const gapSlot = this.randomInteger(this.bottomTopTilesGapMargin + 1, this.maxPipeTiles - this.bottomTopTilesGapMargin + 1);
    const startX = BackgroundManager.I.bgPosX + BackgroundManager.I.bgWidth / 2;

    const upPipe: Sprite[] = [];
    const downPipe: Sprite[] = [];

    // 🔽 Tubs superiors
    upPipe.push(this.makePipe(this.pipeTextures[4], startX, pipeTileHeight * (gapSlot - 3), pipeTileWidth, pipeTileHeight));
    upPipe.push(this.makePipe(this.pipeTextures[3], startX, pipeTileHeight * (gapSlot - 4), pipeTileWidth, pipeTileHeight));
    for (let i = gapSlot - 4; i > 0; i--) {
      upPipe.push(this.makePipe(this.pipeTextures[2], startX, pipeTileHeight * (i - 1), pipeTileWidth, pipeTileHeight));
    }

    // 🔼 Tubs inferiors
    downPipe.push(this.makePipe(this.pipeTextures[0], startX, pipeTileHeight * (gapSlot + 2), pipeTileWidth, pipeTileHeight));
    downPipe.push(this.makePipe(this.pipeTextures[1], startX, pipeTileHeight * (gapSlot + 3), pipeTileWidth, pipeTileHeight));
    for (let i = gapSlot + 3; i < this.maxPipeTiles - 1; i++) {
      downPipe.push(this.makePipe(this.pipeTextures[2], startX, pipeTileHeight * (i + 1), pipeTileWidth, pipeTileHeight));
    }

    this.gamePipes.push({ upPipe, downPipe, gap: gapSlot , scored: false, startX: startX, endX: BackgroundManager.I.bgPosX - (BackgroundManager.I.bgWidth / 2) - (pipeTileWidth / 2)});
  }

  /** 🧩 Helper per crear i afegir un sprite de tub */
  private makePipe(tex: Texture, x: number, y: number, w: number, h: number): Sprite {
    const sprite = new Sprite(tex);
    sprite.width = w;
    sprite.height = h;
    sprite.position.set(x, y);
    this.container.addChild(sprite);
    return sprite;
  } 

  /** 🔢 Utilitat per nombres aleatoris */
  private randomInteger(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
}
