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

  /** Initialize the main PIXI application and start the game */
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

    // Start the Scene system
    SceneManager.I.start(this.app);

    // Game loop
    this.app.ticker.add((frame) => {
      this.update(frame.deltaMS);
    });

    window.addEventListener("resize", () => this.onResize());
  }  

  /** Called every frame to update the active scene */
  update(dt: number): void {
    SceneManager.I.update(dt);
  }

  /** Handle window resize event */
  private onResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Resize the canvas
    this.app.renderer.resize(width, height);

    // 🔹 If you want the background and ground to adapt, you can do:
    SceneManager.I.onResize?.(width, height);
  }
}
