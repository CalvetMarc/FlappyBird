import { Container, Graphics, Text } from "pixi.js";
import { IScene } from "../abstractions/IScene";
import { SceneManager } from "../managers/SceneManager";


export class PauseScene implements IScene {
  
  public containerGame: Container;
  public containerUi: Container;
  
  constructor() {
    
  }

  public async onInit(): Promise<void> {
    
  }

  /** Called when the scene becomes active */
  public onEnter(): void {
    
  }

  /** Called every frame */
  public onUpdate(dt: number): void {
    
  }

  /** Called before scene is removed or pooled */
  public async onExit(): Promise<void> {
    
  }

  public async onDestroy(): Promise<void> {
    
  }

  public onResize(width: number, height: number): void {
    
  }

  /** Called if the SceneManager decides to fully destroy this scene */
  
}
