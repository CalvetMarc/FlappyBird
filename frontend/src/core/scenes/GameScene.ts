import { Container, Rectangle, BitmapText, TextStyle, Bounds } from "pixi.js";
import { IScene } from "../abstractions/IScene";
import { PipesController } from "../objects/Game/PipesController";
import { CharacterController } from "../objects/Game/CharacterController";
import { Tween, CreatedTween, TweenManager } from "../managers/TweenManager";
import { Milliseconds, ms, s } from "../time/TimeUnits";
import { GameManager } from "../managers/GameManager";
import { SceneManager } from "../managers/SceneManager";
import { LayoutManager } from "../managers/LayoutManager";
import { AssetsManager } from "../managers/AssetsManager";
import { sendScore } from "../../SessionManager";
import { sound } from "@pixi/sound";
import { Loading } from "../objects/UI/Loading";
import { Event } from "../abstractions/events";

export class GameScene implements IScene {
  private scoreText!: BitmapText; 
  private score: number = 0;     
  private pipesController!: PipesController;   
  private characterController!: CharacterController;

  private elapsedTime: number;

  private difficultyTimer: number = 0;
  private readonly difficultyIntervalMS = 5000; 
  
  public containerGame: Container;
  public containerUi: Container;
  
  public constructor() {
    this.containerGame = new Container();
    this.containerUi = new Container();
    this.containerGame.sortableChildren = true;    
    this.containerUi.sortableChildren = true;
    this.elapsedTime = 0;
  }

  public async onInit(): Promise<void> {
   this.pipesController = new PipesController();
   this.characterController = new CharacterController();
   await Promise.all([this.pipesController.onCreate(), this.characterController.onCreate(), this.createScoreText()]);
   
   this.containerGame.addChild(this.pipesController.container);
   this.containerGame.addChild(this.characterController.container);
    this.pipesController.setScroll(true);
  }

  public async onEnter(): Promise<void> {  
    this.containerUi.alpha = 0;   
    await TweenManager.I.fadeTo([this.containerUi], 1, 400).finished;    

    if(GameManager.I.settings.audioEnabled){
      setTimeout(() => {
        sound.play("start");        
      }, 300);
    }

    await TweenManager.I.fadeTo([this.containerGame], 0.4, 80, 300).finished;
    await TweenManager.I.fadeTo([this.containerGame], 1.0, 80).finished;
    await TweenManager.I.fadeTo([this.containerGame], 0.4, 80, 100).finished;
    await TweenManager.I.fadeTo([this.containerGame], 1.0, 80).finished;

    this.characterController.detectInputs = true;
  }

  public onUpdate(dt: Milliseconds): void {
    if(this.characterController.isAlive){
      this.elapsedTime += dt / 1000;

      if(GameManager.I.settings.speedRampEnabled){
        this.difficultyTimer += dt;

        if(this.difficultyTimer >= this.difficultyIntervalMS){
          this.difficultyTimer = 0;
          window.dispatchEvent(new CustomEvent(Event.DIFFICULTY_INCREASE));
        }
      }      
    }

    this.characterController.onUpdate(dt);
    this.pipesController.onUpdate(dt);    

    const birdBounds = this.characterController.birdBounds;

    const groundBounds: Bounds = GameManager.I.backgroundController.groundBounds;
    const isTouchingGround = this.boundsIntersect(groundBounds, birdBounds);
    if (isTouchingGround) {
      this.characterController.groundTouched(groundBounds);
      this.pipesController.setScroll(false);
      GameManager.I.sessionData.lastScore = this.score;
      GameManager.I.sessionData.lastGameTime = this.elapsedTime;
      GameManager.I.backgroundController.setScrolling(false);
      SceneManager.I.fire("gameover");      
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
    const sendPromise =  sendScore(GameManager.I.sessionData);

    TweenManager.I.fadeTo([this.containerGame, this.containerUi], 0, 800, 500);

    await new Promise<void>(resolve => setTimeout(resolve, 950));

    const loader = new Loading(12, 6, 40);
    loader.position.set((LayoutManager.I.layoutCurrentSize.width / LayoutManager.I.layoutScale.x) * 0.5, (LayoutManager.I.layoutCurrentSize.height / LayoutManager.I.layoutScale.y) * 0.5);
    loader.scale.set((LayoutManager.I.layoutCurrentSize.width / LayoutManager.I.layoutScale.x) * 0.002);      
    AssetsManager.I.saveResourceReference("loader", loader);
    this.containerGame.parent!.addChild(loader);

    await new Promise<void>(resolve => setTimeout(resolve, 350));

    const didEnter = await sendPromise;
    GameManager.I.lastEnteredRanking = didEnter;
    this.characterController.detectInputs = false;
  }

  public async onDestroy(): Promise<void> {
    this.scoreText.removeFromParent();
    AssetsManager.I.releaseText(this.scoreText);
    this.pipesController.onDestroy();
    this.characterController.onDestroy();

    const loader = AssetsManager.I.getResourceFromReference("loader");
    if(loader){
      loader.removeFromParent();
    }
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
    
    if(GameManager.I.settings.audioEnabled){
      sound.play("point");
    }

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
