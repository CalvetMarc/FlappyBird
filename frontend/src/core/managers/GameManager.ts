import { Application, TextureSource } from "pixi.js";
import { SceneManager } from "./SceneManager";
import { SingletonBase } from "../abstractions/SingletonBase";
import { Milliseconds, ms } from "../time/TimeUnits";
import { AssetsManager } from "./AssetsManager";
import { LayoutManager } from "./LayoutManager";


export class GameManager extends SingletonBase<GameManager> { 

  private app!: Application;

  public lastScore: number;

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

    await SceneManager.I.start();

    this.app.ticker.add((frame) => {
      this.update(ms(frame.deltaMS));
    });

    //window.addEventListener("resize", () => this.onResize());
  }

  private update(dt: Milliseconds): void {
    SceneManager.I.update(dt);
  }

  public get gameApp(): Application {
    return this.app;
  }



  private onResize(): void {
    
    //SceneManager.I.onResize?.(0, 0);
  }
    
}
