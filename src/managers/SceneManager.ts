// Pixi v8
import { Application, Container } from "pixi.js";
import { MainMenuScene } from "../scenes/MainMenuScene";
import { GameScene } from "../scenes/GameScene";
import { PauseScene } from "../scenes/PauseScene";
import { SettingsScene } from "../scenes/SettingsScene";
import { RankingScene } from "../scenes/RankingScene";
import { BackgroundManager } from "./BackgroundManager";

/** Contract for any scene */
export interface IScene {
  container: Container;
  onStart(): void;
  update(dt: number): void;  // called every frame
  onEnd(): void;              // clean up textures/listeners
  destroy(): void;
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
  private backgroundManager?: BackgroundManager; // ✅ Afegit aquí

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

  start(app: Application) {
    this.app = app;

    // ✅ Initialize background once
    this.initBackground();

    // Start with Main Menu
    this.setScene(MainMenuScene, false);
  }

  private async initBackground() {
    this.backgroundManager = BackgroundManager.I;
    await this.backgroundManager.init(this.app);

    // Add background behind everything
    this.app.stage.addChild(this.backgroundManager.view);
  }

  update(dt: number): void {
    this.current?.update(dt);
  }

  fire(event: SceneEvent): void {
    this.transitions[event]?.();
  }

  private setScene<T extends IScene>(SceneType: SceneClass<T>, destroyCurrent: boolean): void {
    if (this.current) {
      this.current.onEnd();
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

    // ✅ Add scene *above* background
    this.app.stage.addChild(this.current.container);
    this.current.onStart();
  }

  private takeSceneFromPool<T extends IScene>(SceneType: SceneClass<T>): T | undefined {
    for (const scene of this.scenePool) {
      if (scene instanceof SceneType) {
        this.scenePool.delete(scene);
        return scene as T;
      }
    }
    return undefined;
  }

  private destroyFromPool<T extends IScene>(SceneType: SceneClass<T>): boolean {
    const scene = this.takeSceneFromPool(SceneType);
    if (scene) {
      scene.destroy();
      return true;
    }
    return false;
  }
}
