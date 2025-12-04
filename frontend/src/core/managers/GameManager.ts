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
  public lastEnteredRanking: boolean;
  public lastLoadedRankingInfo: SessionInfo[] = [];
  public mousePos: Point;
  public sessionData: SessionInfo;
  public settings: GameSettings;
  private appBackground!: BackgroundController 
  private app!: Application;

  private constructor() {
    super();
    this.lastEnteredRanking = false;
    this.mousePos = new Point(NaN, NaN);
    this.sessionData = { lastScore: 0, lastGameTime: 0, name: "Guest" };
    this.settings = { audioEnabled: true, dayCycleEnabled: true, speedRampEnabled: false };
  }

  public async start(): Promise<void> {
    this.app = new Application();    
    TextureSource.defaultOptions.scaleMode = "nearest";

    await this.app.init({backgroundColor: "#10161A", antialias: false });

    document.body.appendChild(this.app.canvas);
    this.preventZoom();

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

  private preventZoom() {
    window.addEventListener("wheel", (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    }, { passive: false });

    window.addEventListener("keydown", (e) => {
      if (e.ctrlKey && (e.key === "+" || e.key === "-" || e.key === "=")) {
        e.preventDefault();
      }
    });

    document.addEventListener('touchstart', function(e) {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    }, { passive: false });

    let lastTouchEnd = 0;
    document.addEventListener('touchend', function (e) {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault(); 
      }
      lastTouchEnd = now;
    }, false);

    document.addEventListener("gesturestart", (e) => e.preventDefault());
    document.addEventListener("gesturechange", (e) => e.preventDefault());
    document.addEventListener("gestureend", (e) => e.preventDefault());
  }


  private initMouseTracking(){
    this.app.canvas.addEventListener("pointermove", e => {
        const rect = this.app.canvas.getBoundingClientRect();
        this.mousePos.x = e.clientX - rect.left;
        this.mousePos.y = e.clientY - rect.top;
    });
  }

  public get gameApp(): Application {
    return this.app;
  }

  public get backgroundController(): BackgroundController{
    return this.appBackground;
  }  

  public get mousePosition(): Point{
    return this.mousePos;
  }

}
