import { Application, TextureSource } from "pixi.js";
import { SceneManager } from "./SceneManager";
import { SingletonBase } from "../abstractions/SingletonBase";
import { Milliseconds, ms } from "../time/TimeUnits";
import { AssetsManager } from "./AssetsManager";
import { LayoutManager } from "./LayoutManager";
import { BackgroundController } from "../objects/Game/BackgroundController";


export class GameManager extends SingletonBase<GameManager> { 

  public lastScore: number;
  private appBackground!: BackgroundController 
  private app!: Application;

  private constructor() {
    super();
    this.lastScore = 0;
  }

  public async start(): Promise<void> {
    this.app = new Application();    
    TextureSource.defaultOptions.scaleMode = "nearest";

    await this.app.init({backgroundColor: "#10161A", antialias: false });

    document.body.appendChild(this.app.canvas);

    Object.assign(this.app.canvas.style, { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", display: "block" });

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

  public get gameApp(): Application {
    return this.app;
  }
    
}
