import { Container } from "pixi.js";
import { IScene } from "../managers/SceneManager";

export class MainMenuScene implements IScene {
  container = new Container();

  constructor() {
    // Ja no carrega cap fons — el SceneManager ja el mostra
  }

  onStart(): void {}
  update(_dt: number): void {}
  onEnd(): void {}
  destroy(): void {
    this.container.destroy({
      children: true,
      texture: true,
      textureSource: true,
    });
  }
}
