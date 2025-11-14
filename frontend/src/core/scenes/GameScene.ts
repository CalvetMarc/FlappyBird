import { Container, Rectangle, Text, TextStyle } from "pixi.js";
import { IScene } from "../abstractions/IScene";
import { BackgroundManager } from "../managers/BackgroundManager";
import { PipesController } from "../objects/PipesController";
import { CharacterController } from "../objects/CharacterController";
import { Tween, CreatedTween, TweenManager } from "../managers/TweenManager";
import { Milliseconds, ms, s } from "../time/TimeUnits";
import { GameManager } from "../managers/GameManager";
import { startSession } from "../../SessionManager";
import { SceneManager } from "../managers/SceneManager";

export class GameScene implements IScene {
  container = new Container();
  private scoreText?: Text; 
  private score: number = 0;     
  private pipesController!: PipesController;  
  private characterController!: CharacterController;

  public constructor() {
    this.container.sortableChildren = true;    
  }

  public async onInit(): Promise<void> {
    const ok = await startSession();
    if (!ok) {
      console.error("No s'ha pogut iniciar la sessió amb el backend");
      return;
    }

    this.pipesController = new PipesController();
    this.characterController = new CharacterController();
    await Promise.all([this.pipesController.onCreate(), this.characterController.onCreate(), this.createScoreText()]);

    BackgroundManager.I.container.addChild(this.pipesController.container);
    BackgroundManager.I.container.addChild(this.characterController.container);

    this.pipesController.setScroll(true);
  }

  public onEnter(): void {
    this.container.alpha = 0;
    const startTime = performance.now();
    const duration = 400;

    const fadeIn = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      this.container.alpha = t;
      if (t < 1) requestAnimationFrame(fadeIn);
    };
    requestAnimationFrame(fadeIn);
  }

  public onUpdate(dt: Milliseconds): void {
    this.pipesController.onUpdate(dt);
    this.characterController.onUpdate(dt);
    
    const birdBounds = this.characterController.birdBounds;
    if (!birdBounds) return;

    const groundBounds = BackgroundManager.I.groundBounds;
    if (groundBounds) {
      const isTouchingGround =
        birdBounds.y + birdBounds.height >= groundBounds.y &&
        birdBounds.x + birdBounds.width > groundBounds.x &&
        birdBounds.x < groundBounds.x + groundBounds.width;

      if (isTouchingGround) {
        this.characterController.groundTouched(groundBounds);
        this.pipesController.setScroll(false);
        BackgroundManager.I.setScrolling(false);
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
    // 🧹 No cal eliminar listeners: CharacterManager ja ho fa
  }

  public async onDestroy(): Promise<void> {
    this.pipesController?.onDestroy();
    this.characterController?.onDestroy();
    this.scoreText?.destroy();
  }

  public onResize(width: number, height: number): void {
    this.pipesController.onResize(width, height);
    this.characterController.onResize(width, height);
    if(this.scoreText){
      const screenW = GameManager.I.app.renderer.width;
      const screenY = GameManager.I.app.renderer.height;
      this.scoreText.position.set(screenW / 2, screenY * 0.08);
      this.scoreText.style.fontSize = BackgroundManager.I.bgRect.width / 10;
      this.scoreText.style.stroke = {color: 0x000000, width: BackgroundManager.I.bgRect.width / 90}
    }
  }  

  private async createScoreText() {
    const screenW = GameManager.I.app.renderer.width;
    const screenY = GameManager.I.app.renderer.height;

    await document.fonts.load('48px "Minecraft"');

    const style = new TextStyle({
      fontFamily: "Minecraft",
      fontSize: BackgroundManager.I.bgRect.width / 10,
      fill: 0xffffff,
      stroke: { color: 0x000000, width: BackgroundManager.I.bgRect.width / 90 },
      align: "center",
    });

    this.scoreText = new Text({ text: "0", style });
    this.scoreText.anchor.set(0.5);
    this.scoreText.position.set(screenW / 2, screenY * 0.08);
    this.scoreText.zIndex = 20;

    this.container.addChild(this.scoreText);
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

    TweenManager.I.AddTween(<Tween<Text>>{

      waitTime: ms(0),
      duration: ms(200),
      context: this.scoreText!,
      tweenFunction: function (e) {
        const ease = TweenManager.easeOutCubic(e, this.duration);
        const scale = 1 + 0.3 * ease;
        this.context.scale.set(scale);
      }

    }).chain(
      TweenManager.I.AddTween(<Tween<Text>>{

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
