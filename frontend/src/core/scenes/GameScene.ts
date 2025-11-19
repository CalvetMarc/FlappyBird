import { Container, Rectangle, BitmapText, TextStyle } from "pixi.js";
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
    
    const birdBounds = this.characterController.birdBounds;
    if (!birdBounds) return;
    this.pipesController.onUpdate(dt);
    
    return;

    const groundBounds = GameManager.I.backgroundController.groundBounds;
    if (groundBounds) {
      const isTouchingGround =
        birdBounds.y + birdBounds.height >= groundBounds.y &&
        birdBounds.x + birdBounds.width > groundBounds.x &&
        birdBounds.x < groundBounds.x + groundBounds.width;

      if (isTouchingGround) {
        this.characterController.groundTouched(groundBounds);
        this.pipesController.setScroll(false);
        GameManager.I.lastScore = this.score;
        GameManager.I.backgroundController.setScrolling(false);
        SceneManager.I.fire("gameover")
        return;
      }
    }

    for (const obs of this.pipesController.obstacles) {
      for (const s of [...obs.upPipe, ...obs.downPipe]) {
        const pipeBounds = s.getBounds() as unknown as Rectangle;
        if (this.rectsIntersect(birdBounds, pipeBounds)) {
          this.characterController.kill();
          this.pipesController.setScroll(false);
          return;
        }
      }

      const firstPipe = obs.upPipe[0];
      if (!obs.scored && birdBounds.x > firstPipe.x + firstPipe.width) {
        obs.scored = true; // marquem com ja comptat
        this.incrementScore();
      }
    }
    
  }

  public  async onExit(): Promise<void> {
    // Todo
  }

  public async onDestroy(): Promise<void> {
    this.pipesController?.onDestroy();
    this.characterController?.onDestroy();
  }

  private async createScoreText() {
    
    this.scoreText = AssetsManager.I.getText("0", "vcrHeavy", 32);
    this.scoreText!.anchor.set(0.5);
    this.scoreText.position.set(LayoutManager.I.layoutSize.width * 0.5, 0);

    this.containerUi.addChild(this.scoreText);
  }

  private rectsIntersect(a: Rectangle, b: Rectangle): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
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
