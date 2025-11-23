import { Container, Rectangle, BitmapText, TextStyle, Bounds } from "pixi.js";
import { IScene } from "../abstractions/IScene";
import { PipesController } from "../objects/Game/PipesController";
import { CharacterController } from "../objects/Game/CharacterController";
import { Tween, CreatedTween, TweenManager } from "../managers/TweenManager";
import { Milliseconds, ms, s } from "../time/TimeUnits";
import { GameManager } from "../managers/GameManager";
import { startSession } from "../../SessionManager";
import { SceneManager } from "../managers/SceneManager";
import { LayoutManager } from "../managers/LayoutManager";
import { AssetsManager } from "../managers/AssetsManager";

export class GameScene implements IScene {
  private scoreText!: BitmapText; 
  private score: number = 0;     
  private pipesController!: PipesController;   
  private characterController!: CharacterController;
  
  public containerGame: Container;
  public containerUi: Container;
  
  public constructor() {
    this.containerGame = new Container();
    this.containerUi = new Container();
    this.containerGame.sortableChildren = true;    
    this.containerUi.sortableChildren = true;
  }

  public async onInit(): Promise<void> {
    /*
    const ok = await startSession();
    if (!ok) {
      console.error("No s'ha pogut iniciar la sessió amb el backend");
      return;
    }*/
   this.pipesController = new PipesController();
   this.characterController = new CharacterController();
   await Promise.all([this.pipesController.onCreate(), this.characterController.onCreate(), this.createScoreText()]);
   
   this.containerGame.addChild(this.pipesController.container);
   this.containerGame.addChild(this.characterController.container);
    this.pipesController.setScroll(true);
  }

  public onEnter(): void {
    this.containerUi.alpha = 0;
    const startTime = performance.now();
    const duration = 400;

    const fadeIn = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      this.containerUi.alpha = t;
      if (t < 1) requestAnimationFrame(fadeIn);
    };
    requestAnimationFrame(fadeIn);
  }

  public onUpdate(dt: Milliseconds): void {
    this.characterController.onUpdate(dt);
    this.pipesController.onUpdate(dt);    
    
    const birdBounds = this.characterController.birdBounds;

    const groundBounds: Bounds = GameManager.I.backgroundController.groundBounds;
    const isTouchingGround = this.boundsIntersect(groundBounds, birdBounds);
    if (isTouchingGround) {
      this.characterController.groundTouched(groundBounds);
      this.pipesController.setScroll(false);
      GameManager.I.lastScore = this.score;
      GameManager.I.backgroundController.setScrolling(false);
      TweenManager.I.fadeTo([this.containerGame, this.containerUi], 0, 800, 500, () => SceneManager.I.fire("gameover"));
      return;
    }
    
    const nextObstacleBounds: Bounds[] = this.pipesController.nextObstacleBounds;
    if(nextObstacleBounds.length <= 0) return;

    const isTouchingPipes: boolean =  nextObstacleBounds.some(bound => this.boundsIntersect(bound, birdBounds));
    if(isTouchingPipes){
      this.characterController.kill();
      this.pipesController.setScroll(false);
      return;
    }

    if(nextObstacleBounds[0].maxX < birdBounds.minX){
      this.pipesController.scoreNext();
      this.incrementScore();
    }
    
  }

  public async onExit(): Promise<void> {
    // Todo
  }

  public async onDestroy(): Promise<void> {
    this.pipesController?.onDestroy();
    this.characterController?.onDestroy();
  }

  private async createScoreText() {
    
    this.scoreText = AssetsManager.I.getText("0", "vcrHeavy", LayoutManager.I.layoutVirtualSize.width * 0.1);
    this.scoreText!.anchor.set(0.5);
    this.scoreText.position.set(LayoutManager.I.layoutVirtualSize.width * 0.5, LayoutManager.I.layoutVirtualSize.height * 0.075);

    this.containerUi.addChild(this.scoreText);
  }

  private boundsIntersect(a: Bounds, b: Bounds): boolean {
    return (
      a.minX < b.maxX &&
      a.maxX > b.minX &&
      a.minY < b.maxY &&
      a.maxY > b.minY
    );
  }

  private incrementScore(): void {
    if(!this.scoreText) return;
    
    this.score += 1; 
    this.scoreText.text = this.score;       

    TweenManager.I.AddTween(<Tween<BitmapText>>{

      waitTime: ms(0),
      duration: ms(200),
      context: this.scoreText!,
      tweenFunction: function (e) {
        const ease = TweenManager.easeOutCubic(e, this.duration);
        const scale = 1 + 0.3 * ease;
        this.context.scale.set(scale);
      }

    }).chain(
      TweenManager.I.AddTween(<Tween<BitmapText>>{

        waitTime: ms(0),
        duration: ms(300),
        context: this.scoreText!,
        tweenFunction: function (e) {
          const ease = TweenManager.easeOutCubic(e, this.duration);
          const scale = 1.3 - 0.3 * ease;
          this.context.scale.set(scale);
        }

      })
    );
    
  }


 
}
