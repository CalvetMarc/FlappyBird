import { Application } from "pixi.js";
import { TextureSource } from "pixi.js";
import { SceneManager } from "./SceneManager";


export class GameManager {
  private app!: Application;

  private static _i: GameManager;
  static get I() {
    return (this._i ??= new GameManager());
  }

  private constructor() {
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

    // Append the canvas to the document
    document.body.appendChild(this.app.canvas);

    // ✅ Center the canvas on the page using CSS
    Object.assign(this.app.canvas.style, {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      display: "block",
    });

    // Start Scene system
    SceneManager.I.start(this.app);

    // Game loop
    this.app.ticker.add((frame) => {
      this.update(frame.deltaMS);
    });
  }

  update(dt: number): void {
    SceneManager.I.update(dt);
  }
}
