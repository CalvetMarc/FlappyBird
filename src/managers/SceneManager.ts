import { Application, Container } from "pixi.js";
import { MainMenuScene } from "../scenes/MainMenuScene";
import { GameScene } from "../scenes/GameScene";
import { PauseScene } from "../scenes/PauseScene";
import { SettingsScene } from "../scenes/SettingsScene";
import { RankingScene } from "../scenes/RankingScene";
import { BackgroundManager } from "./BackgroundManager";
import { SingletonBase } from "../abstractions/SingletonBase";

export const LAYERS = {
  BACKGROUND: 0,
  GROUND: 10,
  PIPES: 30,
  PLAYER: 50,
  UI: 100,
} as const;

export interface IScene {
  container: Container;
  onStart(): void;
  update(dt: number): void;
  onEnd(): Promise<void>;
  destroy(): void;
  onResize(width: number, height: number): void;
}

const sceneEvents = ["play", "pause", "settings", "menu", "ranking"] as const;
export type SceneEvent = (typeof sceneEvents)[number];

type SceneClass<T extends IScene = IScene> = new () => T;

export class SceneManager extends SingletonBase<SceneManager> {
  public app!: Application;
  private current?: IScene;
  private scenePool: Set<IScene> = new Set();
  public playerIndex = 0;

  private transitions: Record<SceneEvent, () => void>;

  private constructor() {
    super();

    this.transitions = {
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
  }

  public async start(app: Application): Promise<void> {
    this.app = app;
    this.playerIndex = 0;

    await this.initBackground();
    await new Promise((resolve) => setTimeout(resolve, 700));
    this.setScene(MainMenuScene, false);
  }

  private async initBackground(): Promise<void> {
    await BackgroundManager.I.init(this.app);
    this.app.stage.addChild(BackgroundManager.I.containerObject);
    BackgroundManager.I.start();
  }

  public update(dt: number): void {
    this.current?.update(dt);
    BackgroundManager.I.update(dt);
  }

  public fire(event: SceneEvent): void {
    this.transitions[event]?.();
  }

  private async setScene<T extends IScene>(
    SceneType: SceneClass<T>,
    destroyCurrent: boolean
  ): Promise<void> {
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

  public onResize(width: number, height: number): void {
    if (this.app) {
      this.app.renderer.resize(width, height);
    }

    BackgroundManager.I.rebuild(width, height);
    this.current?.onResize(width, height);
  }
}
