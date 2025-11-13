import { Container, Rectangle, Text, TextStyle } from "pixi.js";
import { IScene } from "../abstractions/IScene";
import { BackgroundManager } from "../managers/BackgroundManager";
import { PipeManager } from "../managers/PipeManager";
import { CharacterManager } from "../managers/CharacterManager";
import { Tween, CreatedTween, TweenManager } from "../managers/TweenManager";
import { Milliseconds, ms, s } from "../time/TimeUnits";
import { GameManager } from "../managers/GameManager";

export class GameScene implements IScene {
  container = new Container();
  private scoreText?: Text; 
  private score: number = 0;     
  private pipeManager!: PipeManager;  
  private character!: CharacterManager;

  public constructor() {
    this.container.sortableChildren = true;    
  }

  public async onInit(): Promise<void> {
    this.pipeManager = new PipeManager();
    this.character = new CharacterManager();
    await Promise.all([this.pipeManager.onCreate(), this.character.onCreate(), this.createScoreText()]);

    BackgroundManager.I.container.addChild(this.pipeManager.container);
    BackgroundManager.I.container.addChild(this.character.container);

    this.pipeManager.setScroll(true);
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
    this.pipeManager.onUpdate(dt);
    this.character.onUpdate(dt);
    
    const birdBounds = this.character.birdBounds;
    if (!birdBounds) return;

    const groundBounds = BackgroundManager.I.groundBounds;
    if (groundBounds) {
      const isTouchingGround =
        birdBounds.y + birdBounds.height >= groundBounds.y &&
        birdBounds.x + birdBounds.width > groundBounds.x &&
        birdBounds.x < groundBounds.x + groundBounds.width;

      if (isTouchingGround) {
        this.character.groundTouched(groundBounds);
        this.pipeManager.setScroll(false);
        BackgroundManager.I.setScrolling(false);
        return;
      }
    }

    for (const obs of this.pipeManager.obstacles) {
      for (const s of [...obs.upPipe, ...obs.downPipe]) {
        const pipeBounds = s.getBounds() as unknown as Rectangle;
        if (this.rectsIntersect(birdBounds, pipeBounds)) {
          this.character.kill();
          this.pipeManager.setScroll(false);
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
    this.pipeManager?.onDestroy();
    this.character?.onDestroy();
    this.scoreText?.destroy();
  }

  public onResize(width: number, height: number): void {
    this.pipeManager.onResize(width, height);
    this.character.onResize(width, height);
  }  

  private async createScoreText() {
    const screenW = GameManager.I.app.renderer.width;

    await document.fonts.load('48px "Minecraft"');

    const style = new TextStyle({
      fontFamily: "Minecraft",
      fontSize: 38,
      fill: 0xffffff,
      stroke: { color: 0x000000, width: 6 },
      align: "center",
    });

    this.scoreText = new Text({ text: "0", style });
    this.scoreText.anchor.set(0.5);
    this.scoreText.position.set(screenW / 2, 60);
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
