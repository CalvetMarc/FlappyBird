import { Container, Graphics, Text } from "pixi.js";
import { IScene } from "../managers/SceneManager";
import { SceneManager } from "../managers/SceneManager";


export class PauseScene implements IScene {
  container = new Container();
  
  constructor() {
    
  }

  /** Called when the scene becomes active */
  onStart(): void {
    
  }

  /** Called every frame */
  update(dt: number): void {
    
  }

  /** Called before scene is removed or pooled */
  onEnd(): void {
   
  }

  public onResize(width: number, height: number): void {
    
  }

  /** Called if the SceneManager decides to fully destroy this scene */
  destroy(): void {
    this.container.destroy({
      children: true,
      texture: true,
      textureSource: true,
    });
  }
}
