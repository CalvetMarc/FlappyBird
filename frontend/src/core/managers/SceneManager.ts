import { Application, Container } from "pixi.js";
import { MainMenuScene } from "../scenes/MainMenuScene";
import { GameScene } from "../scenes/GameScene";
import { PauseScene } from "../scenes/PauseScene";
import { SettingsScene } from "../scenes/SettingsScene";
import { RankingScene } from "../scenes/RankingScene";
import { BackgroundManager } from "./BackgroundManager";
import { SingletonBase } from "../abstractions/SingletonBase";
import { LAYERS, IScene, SceneEvent } from "../abstractions/IScene";
import { Milliseconds } from "../time/TimeUnits";
import { GameManager } from "./GameManager";
import { GameOverScene } from "../scenes/GameOverScene";

type SceneClass<T extends IScene = IScene> = new () => T;

export class SceneManager extends SingletonBase<SceneManager> {
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
      gameover: () => {
        if (this.current instanceof GameScene) {
          this.setScene(GameOverScene, false);
        }
      },
    };
  }

  public async start(): Promise<void> {
    this.playerIndex = 0;

    await this.initBackground();
    await new Promise((resolve) => setTimeout(resolve, 700));
    this.setScene(MainMenuScene, false);
  }

  private async initBackground(): Promise<void> {
    await BackgroundManager.I.onCreate();
    GameManager.I.app.stage.addChild(BackgroundManager.I.container);
  }

  public update(dt: Milliseconds): void {
    this.current?.onUpdate(dt);
    BackgroundManager.I.onUpdate(dt);
  }

  public fire(event: SceneEvent): void {
    this.transitions[event]?.();
  }

  private async setScene<T extends IScene>(SceneType: SceneClass<T>, destroyCurrent: boolean): Promise<void> {
    if (this.current) {
      await this.current.onExit();
      GameManager.I.app.stage.removeChild(this.current.container);
      if (destroyCurrent) {
        await this.current.onDestroy();
        this.current.container.destroy({ children: true, texture: true, textureSource: true });

      } else {
        this.scenePool.add(this.current);
      }
    }

    let next = this.takeSceneFromPool(SceneType);
    if (!next){
      next = new SceneType();
      await next.onInit();
    } 

    this.current = next;
    GameManager.I.app.stage.addChild(this.current.container);
    this.current.onEnter();
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
      scene.onDestroy();
      return true;
    }
    return false;
  }

  public onResize(width: number, height: number): void {
    BackgroundManager.I.onResize(width, height);
    this.current?.onResize(width, height);
    this.scenePool.forEach(s => s.onResize(width, height));
  }
}
