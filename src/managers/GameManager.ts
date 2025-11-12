import { Application, TextureSource } from "pixi.js";
import { SceneManager } from "./SceneManager";
import { SingletonBase } from "../abstractions/SingletonBase";

export class GameManager extends SingletonBase<GameManager> {
  private app!: Application;

  private constructor() {
    super();
    this.start();
  }

  async start(): Promise<void> {
    this.app = new Application();

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    TextureSource.defaultOptions.scaleMode = "nearest";

    await this.app.init({
      width: screenWidth,
      height: screenHeight,
      backgroundColor: "#10161A",
      antialias: false,
    });

    document.body.appendChild(this.app.canvas);

    Object.assign(this.app.canvas.style, {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      display: "block",
    });

    SceneManager.I.start(this.app);

    this.app.ticker.add((frame) => {
      this.update(frame.deltaMS);
    });

    window.addEventListener("resize", () => this.onResize());
  }

  private update(dt: number): void {
    SceneManager.I.update(dt);
  }

  get gameApp(): Application {
    return this.app;
  }

  private onResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.app.renderer.resize(width, height);
    SceneManager.I.onResize?.(width, height);
  }
}
