import { Application, Container } from "pixi.js";
import { MainMenuScene } from "../scenes/MainMenuScene";
import { GameScene } from "../scenes/GameScene";
import { PauseScene } from "../scenes/PauseScene";
import { SettingsScene } from "../scenes/SettingsScene";
import { RankingScene } from "../scenes/RankingScene";
import { SingletonBase } from "../abstractions/SingletonBase";
import { LAYERS, IScene, SceneEvent } from "../abstractions/IScene";
import { Milliseconds } from "../time/TimeUnits";
import { GameManager } from "./GameManager";
import { GameOverScene } from "../scenes/GameOverScene";
import { LayoutManager } from "./LayoutManager";

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
        else if (this.current instanceof GameOverScene) {
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
    await new Promise((resolve) => setTimeout(resolve, 700));
    this.setScene(MainMenuScene, false);
  }

  public update(dt: Milliseconds): void {
    this.current?.onUpdate(dt);
  }

  public fire(event: SceneEvent): void {
    this.transitions[event]?.();
  }

  private async setScene<T extends IScene>(SceneType: SceneClass<T>, destroyCurrent: boolean): Promise<void> {
    if (this.current) {
      await this.current.onExit();
      LayoutManager.I.gameContainer.removeChild(this.current.containerGame);
      LayoutManager.I.uiContainer.removeChild(this.current.containerUi);
      if (destroyCurrent) {
        await this.current.onDestroy();
        this.current.containerGame.destroy({ children: true });
        this.current.containerUi.destroy({ children: true });

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
    LayoutManager.I.gameContainer.addChild(this.current.containerGame);
    LayoutManager.I.uiContainer.addChild(this.current.containerUi);
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

}
