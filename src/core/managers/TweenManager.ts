import { Ticker } from "pixi.js";
import { GameManager } from "./GameManager";
import { IdProvider, UniqueId } from "../objects/IdProvider";
import { SingletonBase } from "../abstractions/SingletonBase";
import { Milliseconds, ms, addTime } from "../time/TimeUnits";

export type Tween<TContext = unknown> = {
  waitTime: Milliseconds;
  duration: Milliseconds;
  context: TContext;
  tweenFunction(this: Tween<TContext>, elapsed: Milliseconds): void;
};

const TweenState = ["ACTIVE", "PAUSED", "FINISHED"] as const;
type TWEEN_STATE = (typeof TweenState)[number];

export class CreatedTween {
  public readonly id: UniqueId;
  public nextChained?: UniqueId;
  public preChainedId?: UniqueId;

  private tween: Tween;
  private elapsedTime: Milliseconds = ms(0);
  private state: TWEEN_STATE = "ACTIVE";

  constructor(id: UniqueId, tween: Tween) {
    this.id = id;
    this.tween = tween;
  }

  public updateTween(dt: Milliseconds): void {
    if (this.state !== "ACTIVE") return;

    this.elapsedTime = addTime(ms, this.elapsedTime, dt);

    // execució del tween
    this.tween.tweenFunction(this.elapsedTime);

    // finalització
    if (this.elapsedTime >= this.tween.duration) {
      this.state = "FINISHED";
    }
  }

  public changeCurrentState(newState: TWEEN_STATE): void {
    this.state = newState;
  }

  public getState(): TWEEN_STATE {
    return this.state;
  }

  public chain(next: CreatedTween): CreatedTween {
    this.nextChained = next.id;
    next.preChainedId = this.id;
    return next;
  }
}

export class TweenManager extends SingletonBase<TweenManager> {
  private activeTweens = new Map<UniqueId, CreatedTween>();
  private idProvider = new IdProvider();

  private constructor() {
    super();

    GameManager.I.gameApp.ticker.add((ticker: Ticker) => {
      this.update(ms(ticker.deltaMS));
    });
  }

  private update(delta: Milliseconds): void {
    for (const [id, tween] of this.activeTweens) {
      // si està encadenat a un tween anterior actiu → espera
      if (tween.preChainedId !== undefined && this.activeTweens.has(tween.preChainedId)) {
        continue;
      }

      // eliminació
      if (tween.getState() === "FINISHED") {
        this.idProvider.release(tween.id);
        this.activeTweens.delete(id);
        continue;
      }

      tween.updateTween(delta);
    }
  }

  public AddTween(tween: Tween): CreatedTween {
    const id = this.idProvider.acquire();
    const newTween = new CreatedTween(id, tween);
    this.activeTweens.set(id, newTween);
    return newTween;
  }

  public AddLoopTween(tween: Tween): CreatedTween {
    const id = this.idProvider.acquire();
    const created = new CreatedTween(id, tween);

    const originalUpdate = created.updateTween.bind(created);

    created.updateTween = (dt: Milliseconds) => {
      if (created.getState() !== "ACTIVE") return;

      originalUpdate(dt);

      if (Number(created["elapsedTime"]) >= Number(tween.duration)) {
        created["elapsedTime"] = ms(0);
        created.changeCurrentState("ACTIVE"); 
      }
    };

    this.activeTweens.set(id, created);
    return created;
  }


  public KillTween(id: UniqueId): void {
    this.activeTweens.get(id)?.changeCurrentState("FINISHED");
  }

  public PauseTween(id: UniqueId): void {
    this.activeTweens.get(id)?.changeCurrentState("PAUSED");
  }

  public ResumeTween(id: UniqueId): void {
    this.activeTweens.get(id)?.changeCurrentState("ACTIVE");
  }

  // EASINGS
  private static normalize(elapsed: Milliseconds, duration: Milliseconds): number {
    return Math.min(Number(elapsed) / Number(duration), 1);
  }

  public static easeOutCubic(elapsed: Milliseconds, duration: Milliseconds): number {
    return 1 - Math.pow(1 - this.normalize(elapsed, duration), 3);
  }

  public static easeInCubic(elapsed: Milliseconds, duration: Milliseconds): number {
    const t = this.normalize(elapsed, duration);
    return t * t * t;
  }

  public static easeInOutCubic(elapsed: Milliseconds, duration: Milliseconds): number {
    const t = this.normalize(elapsed, duration);
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  public static easeOutElastic(elapsed: Milliseconds, duration: Milliseconds): number {
    const t = this.normalize(elapsed, duration);
    const c4 = (2 * Math.PI) / 3;
    return t === 0
      ? 0
      : t === 1
      ? 1
      : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  }

  public static easeOutBounce(elapsed: Milliseconds, duration: Milliseconds): number {
    let t = this.normalize(elapsed, duration);
    const n1 = 7.5625, d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    else if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    else if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    else return n1 * (t -= 2.625 / d1) * t + 0.984375;
  }
}
