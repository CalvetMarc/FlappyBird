import { Application, TextureSource, Point } from "pixi.js";
import { SceneManager } from "./SceneManager";
import { SingletonBase } from "../abstractions/SingletonBase";
import { Milliseconds, ms } from "../time/TimeUnits";
import { AssetsManager } from "./AssetsManager";
import { LayoutManager } from "./LayoutManager";
import { BackgroundController } from "../objects/Game/BackgroundController";

export type SessionInfo = {
  name: string;
  lastScore: number;
  lastGameTime: number;
}

export type GameSettings = {
  audioEnabled: boolean;
  dayCycleEnabled: boolean;
  speedRampEnabled: boolean;
}

export class GameManager extends SingletonBase<GameManager> { 
  public mousePos: Point;
  public sessionData: SessionInfo;
  public settings: GameSettings;
  private appBackground!: BackgroundController 
  private app!: Application;

  private constructor() {
    super();
    this.mousePos = new Point(0,0);
    this.sessionData = { lastScore: 0, lastGameTime: 0, name: "Nando" };
    this.settings = { audioEnabled: true, dayCycleEnabled: true, speedRampEnabled: false };
  }

  public async start(): Promise<void> {
    this.app = new Application();    
    TextureSource.defaultOptions.scaleMode = "nearest";

    await this.app.init({backgroundColor: "#10161A", antialias: false });

    document.body.appendChild(this.app.canvas);

    Object.assign(this.app.canvas.style, { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", display: "block" });

    this.initMouseTracking();

    await LayoutManager.I.start();
    
    await AssetsManager.I.start();
    
    this.appBackground = new BackgroundController();

    await SceneManager.I.start();

    this.app.ticker.add((frame) => {
      this.update(ms(frame.deltaMS));
    });
  }

  private update(dt: Milliseconds): void {
    this.appBackground.onUpdate(dt);
    SceneManager.I.update(dt);
  }

  private initMouseTracking(){
    this.app.canvas.addEventListener("pointermove", e => {
        const rect = this.app.canvas.getBoundingClientRect();
        this.mousePos.x = e.clientX - rect.left;
        this.mousePos.y = e.clientY - rect.top;
    });
  }

  public forcePointerMove() {
    const canvas = this.app.canvas;
    const rect = canvas.getBoundingClientRect();

    const clientX = rect.left + this.mousePos.x;
    const clientY = rect.top + this.mousePos.y;

    const ev = new PointerEvent("pointermove", {
      clientX,
      clientY,
      bubbles: true,
      cancelable: true,
      pointerId: 1,
      pointerType: "mouse"
    });

    canvas.dispatchEvent(ev);
  }

  public get gameApp(): Application {
    return this.app;
  }

  public get backgroundController(): BackgroundController{
    return this.appBackground;
  }  

}
