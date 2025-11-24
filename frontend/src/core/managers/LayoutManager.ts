import { Bounds, Container, Graphics, Rectangle, Size, Point } from "pixi.js";
import { SingletonBase } from "../abstractions/SingletonBase";
import { GameManager } from "./GameManager";

const GAME_ASPECT = 0.85;

export class LayoutManager extends SingletonBase<LayoutManager> { 

  private _gameContainer: Container;
  private _uiContainer: Container;

  private _gameWidth = 0;
  private _gameHeight = 0;
  private _gameLeft = 0;
  private _gameRight = 0;
  private _gameTop = 0;
  private _gameBottom = 0;

  private _initialGameSize = {width: 0, height: 0};

  private _gameMask!: Graphics;

  private constructor() {
    super();
    this._gameContainer = new Container();
    this._uiContainer = new Container();

    this._gameContainer.pivot.set(0, 0);
    this._uiContainer.pivot.set(0, 0);
  } 

  private onResize(): void {
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    GameManager.I.gameApp.renderer.resize(screenW, screenH);

    const hA = screenH;
    const wA = hA * GAME_ASPECT;

    const wB = screenW;
    const hB = wB / GAME_ASPECT;

    if (wA <= screenW) {
      this._gameWidth = wA;
      this._gameHeight = hA;
    } else {
      this._gameWidth = wB;
      this._gameHeight = hB;
    }    

    this._gameLeft = (screenW - this._gameWidth) * 0.5;
    this._gameTop  = (screenH - this._gameHeight) * 0.5;

    this._gameRight = this._gameLeft + this._gameWidth;
    this._gameBottom = this._gameTop + this._gameHeight;

    this.redrawMask();

    this._gameContainer.position.set(this._gameLeft, this._gameTop);
    this._uiContainer.position.set(this._gameLeft, this._gameTop);

    if(this._initialGameSize.width === 0 || this._initialGameSize.height === 0){
        this._initialGameSize = { width: this._gameWidth, height: this._gameHeight };
    }
    else{
        this._gameContainer.scale.set(this._gameWidth / this._initialGameSize.width, this._gameHeight / this._initialGameSize.height);
        this._uiContainer.scale.set(this._gameWidth / this._initialGameSize.width, this._gameHeight / this._initialGameSize.height);
    }

  }

  private redrawMask(): void {
    this._gameMask.clear();
    this._gameMask.rect(
      this._gameLeft,
      this._gameTop,
      this._gameWidth,
      this._gameHeight
    ).fill(0xffffff);
  }
  
  public async start(): Promise<void> {
    const stage = GameManager.I.gameApp.stage;

    this._gameMask = new Graphics();
    stage.addChild(this._gameMask);

    stage.addChild(this._gameContainer);
    stage.addChild(this._uiContainer);

    window.addEventListener("resize", () => this.onResize());

    this.onResize();

    this._gameContainer.mask = this._gameMask;

    this._gameContainer.zIndex = 0;
    this._uiContainer.zIndex = 1000;
    stage.sortChildren();
  }

  public get gameContainer(): Container { return this._gameContainer; }
  public get uiContainer(): Container { return this._uiContainer; }
  
  public get layoutBounds(): Bounds{ return new Bounds(this._gameLeft, this._gameTop, this._gameRight, this._gameBottom);}
  public get layoutVirtualSize(): Size { return { width: this._initialGameSize.width, height: this._initialGameSize.height }; }
  public get layoutCurrentSize(): Size { return { width: this._gameWidth, height: this._gameHeight }; }

  public get layoutScale(): Point { return new Point(this._gameWidth / this._initialGameSize.width, this._gameHeight / this._initialGameSize.height)} 
}
