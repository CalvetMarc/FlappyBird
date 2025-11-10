// Pixi v8
import { Application, Container } from "pixi.js";
import { MainMenuScene } from "../scenes/MainMenuScene";
import { GameScene } from "../scenes/GameScene";
import { PauseScene } from "../scenes/PauseScene";
import { SettingsScene } from "../scenes/SettingsScene";
import { RankingScene } from "../scenes/RankingScene";
import { BackgroundManager } from "./BackgroundManager";

/** Contract that every scene must implement */
export interface IScene {
  container: Container;
  onStart(): void;
  update(dt: number): void;   // called every frame
  onEnd(): Promise<void>;             // clean up textures/listeners
  destroy(): void;
  onResize(width: number, height: number): void
}

/** Scene event types */
const sceneEvents = ["play", "pause", "settings", "menu", "ranking"] as const;
export type SceneEvent = (typeof sceneEvents)[number];

/** Type representing any class that can create an IScene */
type SceneClass<T extends IScene = IScene> = new () => T;

export class SceneManager {
  public app!: Application;
  private current?: IScene;
  private scenePool: Set<IScene> = new Set();
  private backgroundManager?: BackgroundManager; // ✅ Added here

  /** Transition table */
  private transitions: Record<SceneEvent, () => void> = {
    play: () => {
      if (this.current instanceof MainMenuScene) {
        this.setScene(GameScene, true);
      } else if (this.current instanceof PauseScene) {
        this.setScene(GameScene, false);
      }
    },
    pause: () => {
      if (this.current instanceof GameScene || this.current instanceof SettingsScene) {
        this.setScene(PauseScene, false);
      }
    },
    settings: () => {
      if (this.current instanceof MainMenuScene || this.current instanceof PauseScene) {
        this.setScene(SettingsScene, false);
      }
    },
    menu: () => {
      if (this.current instanceof PauseScene) {
        this.destroyFromPool(GameScene);
        this.setScene(MainMenuScene, false);
      } else if (this.current instanceof SettingsScene) {
        this.setScene(MainMenuScene, false);
      } else if (this.current instanceof RankingScene) {
        this.destroyFromPool(GameScene);
        this.setScene(MainMenuScene, true);
      }
    },
    ranking: () => {
      if (this.current instanceof GameScene || this.current instanceof MainMenuScene) {
        this.setScene(RankingScene, false);
      }
    },
  };

  // Singleton
  private static _i: SceneManager;
  static get I() {
    return (this._i ??= new SceneManager());
  }

  /** Initialize the SceneManager and load the first scene */
  async start(app: Application) {
    this.app = app;

    // ✅ Initialize background once
    await this.initBackground();

    // Start with the Main Menu
    this.setScene(MainMenuScene, false);
  }

  /** Load and display the background behind all scenes */
  private async initBackground() {
    this.backgroundManager = BackgroundManager.I;
    await this.backgroundManager.init(this.app);

    // Add background behind everything
    this.app.stage.addChild(this.backgroundManager.view);
    BackgroundManager.I.start();
  }

  /** Called every frame from GameManager */
  update(dt: number): void {
    this.current?.update(dt);
    BackgroundManager.I.update(dt);
  }

  /** Trigger a scene change based on a given event */
  fire(event: SceneEvent): void {
    this.transitions[event]?.();
  }

  /** Change the current scene, optionally destroying the old one */
  private async setScene<T extends IScene>(SceneType: SceneClass<T>, destroyCurrent: boolean): Promise<void> {
    if (this.current) {
      await this.current.onEnd();
      this.app.stage.removeChild(this.current.container);      
      if (destroyCurrent) {
        this.current.destroy();
      } else {
        this.scenePool.add(this.current);
      }
    }

    let next = this.takeSceneFromPool(SceneType);
    if (!next) next = new SceneType();

    this.current = next;

    // ✅ Add the scene *above* the background
    this.app.stage.addChild(this.current.container);
    this.current.onStart();
  }

  /** Retrieve a scene from the pool if it exists */
  private takeSceneFromPool<T extends IScene>(SceneType: SceneClass<T>): T | undefined {
    for (const scene of this.scenePool) {
      if (scene instanceof SceneType) {
        this.scenePool.delete(scene);
        return scene as T;
      }
    }
    return undefined;
  }

  /** Permanently destroy a scene from the pool */
  private destroyFromPool<T extends IScene>(SceneType: SceneClass<T>): boolean {
    const scene = this.takeSceneFromPool(SceneType);
    if (scene) {
      scene.destroy();
      return true;
    }
    return false;
  }

  /** Handle window resizing */
  public onResize(width: number, height: number): void {
    if (this.app) {
        this.app.renderer.resize(width, height);
    }

    if (this.backgroundManager) {
        this.backgroundManager.rebuild(width, height);
    }

    // 👇 Notifica també a l’escena actual
    this.current?.onResize(width, height);
  }

}
