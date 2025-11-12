import { Ticker } from "pixi.js";
import { GameManager } from "./GameManager";
import { IdProvider, UniqueId } from "../objects/IdProvider";

export type Milliseconds = number & { readonly brand: unique symbol };
export const toMs = (n: number): Milliseconds => n as Milliseconds;
export const addMs = (a: Milliseconds, b: Milliseconds): Milliseconds =>  (a + b) as Milliseconds;

export type Tween<TContext = unknown> = {
    waitTime: Milliseconds;
    duration: Milliseconds;
    context: TContext;
    tweenFunction(this: Tween<TContext>, elapsed: Milliseconds): void;
}

const TweenState = ["ACTIVE", "PAUSED", "FINISHED"] as const;
type TWEEN_STATE = (typeof TweenState)[number];

export class CreatedTween{
    public readonly id: UniqueId;
    public nextChained: UniqueId | undefined;
    public preChainedId: UniqueId | undefined;

    private tween: Tween;
    private elapsedTime: Milliseconds;
    private state: TWEEN_STATE;

    constructor(id: UniqueId, tween: Tween){
        this.id = id;

        this.nextChained = undefined;
        this.tween = tween;
        this.elapsedTime = toMs(0);
        this.state = "ACTIVE";
    }

    public updateTween(dt: Milliseconds): void{
        if(this.state === "ACTIVE"){
            this.elapsedTime = addMs(this.elapsedTime, dt); 
            this.tween.tweenFunction(this.elapsedTime);
            if(this.elapsedTime > this.tween.duration){
                this.state = "FINISHED";
            }
        }
    }

    public changeCurrentState(newState: TWEEN_STATE): void{
        this.state = newState;
    }

    public getState(){
        return this.state;
    }

    public chain(next: CreatedTween): CreatedTween{
        this.nextChained = next.id;
        next.preChainedId = this.id;
        return next;
    }
}


export class TweenManager {
  private activeTweens: Map<UniqueId, CreatedTween>;
  private idProvider: IdProvider;
  
  // Singleton
  private static _i: TweenManager;
  public static get I() {
    return (this._i ??= new TweenManager());
  }

  private constructor() {
    this.idProvider = new IdProvider();
    this.activeTweens = new Map<UniqueId, CreatedTween>;
    GameManager.I.gameApp.ticker.add(ticker => this.update(toMs(ticker.deltaMS)));
  }

  private update(delta: Milliseconds): void {
    for(const [id, t] of this.activeTweens){
        if(t.preChainedId !== undefined && this.activeTweens.has(t.preChainedId)){
            continue;
        }

        if(t.getState() === "FINISHED"){
            this.idProvider.release(t.id);
            this.activeTweens.delete(id);            

            continue;
        }

        t.updateTween(delta);
    }
  }

  public AddTween(tween: Tween): CreatedTween{
    const id: UniqueId = this.idProvider.acquire();
    const newTween = new CreatedTween(id, tween);
    this.activeTweens.set(id, newTween);

    return newTween;
  }

  public KillTween(id: UniqueId): void{
   if(this.activeTweens.has(id)){
        this.activeTweens.get(id)!.changeCurrentState("FINISHED");
    }
  }

  public PauseTween(id: UniqueId): void{
    if(this.activeTweens.has(id)){
        this.activeTweens.get(id)!.changeCurrentState("PAUSED");
    }
  }

  public ResumeTween(id: UniqueId): void{
    if(this.activeTweens.has(id)){
        this.activeTweens.get(id)!.changeCurrentState("ACTIVE");
    }
  }
}
