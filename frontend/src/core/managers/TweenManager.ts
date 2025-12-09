import { Ticker, ViewContainer } from "pixi.js";
import { GameManager } from "./GameManager";
import { IdProvider, UniqueId } from "../objects/IdProvider";
import { SingletonBase } from "../abstractions/SingletonBase";
import { Milliseconds, ms, addTime } from "../time/TimeUnits";

export type Tween<TContext = unknown> = {
  waitTime: Milliseconds;
  duration: Milliseconds;
  context: TContext;
  tweenFunction(this: Tween<TContext>, elapsed: Milliseconds): void;
  onComplete?: () => void;
};

const TweenState = ["WAIT", "ACTIVE", "PAUSED", "FINISHED"] as const;
type TWEEN_STATE = (typeof TweenState)[number];

export class CreatedTween {
  public readonly id: UniqueId;
  public nextChained?: UniqueId;
  public preChainedId?: UniqueId;

  private tween: Tween;
  private elapsedTime: Milliseconds = ms(0);
  private state: TWEEN_STATE;

  public readonly finished: Promise<void>;
  private _resolveFinish!: () => void;

  constructor(id: UniqueId, tween: Tween) {
    this.id = id;
    this.tween = tween;
    this.state = tween.waitTime > 0 ? "WAIT" : "ACTIVE";

    this.finished = new Promise<void>((resolve) => {
      this._resolveFinish = resolve;
    });
  }

  public updateTween(dt: Milliseconds): void {
    if (this.state !== "WAIT" && this.state !== "ACTIVE" ) return;

    this.elapsedTime = addTime(ms, this.elapsedTime, dt);

    if(this.state === "WAIT"){
      if(this.elapsedTime > this.tween.waitTime){
        this.elapsedTime =   ms(this.elapsedTime - this.tween.waitTime);
        this.state = "ACTIVE";
      }
      return;
    }    

    this.tween.tweenFunction(this.elapsedTime);

    if (this.elapsedTime >= this.tween.duration) {
      this.tween.onComplete?.();
      this._resolveFinish();
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
      if (tween.preChainedId !== undefined && this.activeTweens.has(tween.preChainedId)) {
        continue;
      }

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

  //PREMADE

  public fadeTo(targetObject: ViewContainer[], finalValue: number, duration: number, waitTime: number = 0, onComplete?: () => void): CreatedTween {
    const start = targetObject[0].alpha;

    return TweenManager.I.AddTween(<Tween<ViewContainer[]>>{
      waitTime: ms(waitTime),
      duration: ms(duration),
      context: targetObject!,
      tweenFunction: function (elapsed) {
        const t = TweenManager.easeOutCubic(elapsed, this.duration);
        const v = start + (finalValue - start) * t;
        this.context.forEach(vc => vc.alpha = v);
      },
      onComplete: onComplete
    });
  }

  public fadeHtmlTo(target: HTMLInputElement[], finalValue: number, duration: number, waitTime: number = 0, onComplete?: () => void): CreatedTween {
    const start = parseFloat(target[0].style.opacity || "1");

    return TweenManager.I.AddTween(<Tween<HTMLInputElement[]>>{
      waitTime: ms(waitTime),
      duration: ms(duration),
      context: target,
      tweenFunction: function (elapsed) {
        const t = TweenManager.easeOutCubic(elapsed, this.duration);
        const v = start + (finalValue - start) * t;
        this.context.forEach(input => input.style.opacity = v.toString());
      },
      onComplete
    });
  }

  public moveTo(targetObject: ViewContainer[], finalX: number, finalY: number, duration: number, waitTime: number = 0, onComplete?: () => void): CreatedTween {

    const startPositions = targetObject.map(obj => ({ x: obj.x, y: obj.y }));

    return TweenManager.I.AddTween(<Tween<ViewContainer[]>>{
      waitTime: ms(waitTime),
      duration: ms(duration),
      context: targetObject,
      tweenFunction: function (elapsed) {
        const t = TweenManager.easeOutCubic(elapsed, this.duration);
        
        this.context.forEach((obj, i) => {
          const start = startPositions[i];
          obj.x = start.x + (finalX - start.x) * t;
          obj.y = start.y + (finalY - start.y) * t;
        });
      },
      onComplete
    });

  }

  public scaleTo(targetObject: ViewContainer[], finalScaleX: number, finalScaleY: number, duration: number, waitTime: number = 0, onComplete?: () => void): CreatedTween {

    const startScales = targetObject.map(obj => ({ x: obj.scale.x, y: obj.scale.y }));

    return TweenManager.I.AddTween(<Tween<ViewContainer[]>>{
      waitTime: ms(waitTime),
      duration: ms(duration),
      context: targetObject,

      tweenFunction: function (elapsed) {
        const t = TweenManager.easeOutCubic(elapsed, this.duration);

        this.context.forEach((obj, i) => {
          const start = startScales[i];
          obj.scale.set(
            start.x + (finalScaleX - start.x) * t,
            start.y + (finalScaleY - start.y) * t
          );
        });
      },

      onComplete
    });
  }

  public colorTo(targetObjects: ViewContainer[], finalColor: number, duration: number, waitTime: number = 0, onComplete?: () => void): CreatedTween {

    const startColors = targetObjects.map(obj => obj.tint);

    const toRGB = (color: number) => ({
        r: (color >> 16) & 0xFF,
        g: (color >> 8) & 0xFF,
        b: color & 0xFF
    });

    const finalRGB = toRGB(finalColor);
    const startRGB = startColors.map(c => toRGB(c));

    return TweenManager.I.AddTween(<Tween<ViewContainer[]>>{
        waitTime: ms(waitTime),
        duration: ms(duration),
        context: targetObjects,

        tweenFunction: function (elapsed) {
            const t = TweenManager.easeInOutCubic(elapsed, this.duration);

            this.context.forEach((obj, i) => {
                const s = startRGB[i];

                const r = Math.round(s.r + (finalRGB.r - s.r) * t);
                const g = Math.round(s.g + (finalRGB.g - s.g) * t);
                const b = Math.round(s.b + (finalRGB.b - s.b) * t);

                obj.tint = (r << 16) | (g << 8) | b;
            });
        },

        onComplete
    });
  }


}
