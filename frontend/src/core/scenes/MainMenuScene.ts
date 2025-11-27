import { Container, Sprite, Texture, Rectangle, BitmapText, Point } from "pixi.js";
import { IScene } from "../abstractions/IScene";
import { SceneManager } from "../managers/SceneManager";
import { GameManager } from "../managers/GameManager";
import { TweenManager, Tween, CreatedTween } from "../managers/TweenManager";
import { ms } from "../time/TimeUnits";
import { IdProvider, UniqueId } from "../objects/IdProvider";
import { Button } from "../objects/UI/Button";
import { AssetsManager } from "../managers/AssetsManager";
import { LayoutManager } from "../managers/LayoutManager";

export class MainMenuScene implements IScene {
  private playBtn!: Button;
  private settingsBtn!: Button;
  private rankingBtn!: Button;
  private nextBtn!: Button;
  private prevBtn!: Button;

  private logo!: Sprite;  
  private bird!: Sprite;

  private logoBaseW = 0;
  private baseY = 0;
  private elapsed = 0;

  private mousePosOnExit: Point;

  private birdFadeOf: boolean;

  private logoTweenID!: UniqueId; 

  public containerGame: Container;
  public containerUi: Container;

  constructor() {
    this.containerGame = new Container();
    this.containerUi = new Container();
    this.containerGame.sortableChildren = true;
    this.containerUi.sortableChildren = true;
    this.birdFadeOf = true;   
    this.mousePosOnExit = new Point(0, 0);
  }

  public async onInit(): Promise<void> {
   
    this.createLogo();
    this.createButtons();
    this.createBird();
    this.createSideButtons();
    this.startLogoFloat();

    this.containerUi.alpha = 0;
  }

  public onEnter(): void {
    this.containerUi.alpha = 0;
    this.birdFadeOf = true;    
    GameManager.I.forcePointerMove();
    this.fadeTo(1, 500, 100);
  }

  public onUpdate(dt: number): void { }


  public async onExit(): Promise<void> {
    this.playBtn.resetVisuals();
    this.settingsBtn.resetVisuals();
    this.rankingBtn.resetVisuals();

    await new Promise<void>((resolve) => {
      if (!this.birdFadeOf && this.bird) {
        this.containerUi.removeChild(this.bird);
        this.containerGame.addChild(this.bird);
      }
      
      this.fadeTo(0, 500, 0, () => {
        this.containerGame.removeChild(this.bird);
        this.containerUi.addChild(this.bird);
        resolve();
      });
    });
  }

  public async onDestroy(): Promise<void> {    
    TweenManager.I.KillTween(this.logoTweenID); 

    this.playBtn.freeResources();
    this.settingsBtn.freeResources();
    this.rankingBtn.freeResources();
    this.nextBtn.freeResources();
    this.prevBtn.freeResources();

    this.logo.removeFromParent();
    AssetsManager.I.releaseSprite(this.logo);
    this.bird.removeFromParent();
    AssetsManager.I.releaseSprite(this.bird);   
  }

  private createLogo() {
    this.logo = AssetsManager.I.getSprite("logo", 0);
    this.logoBaseW = this.logo.texture.width;

    const scale = ((LayoutManager.I.layoutCurrentSize.width / LayoutManager.I.layoutScale.x) / 3) / this.logoBaseW;
    this.logo.scale.set(scale);

    this.logo.anchor.set(0.5);
    this.logo.position.set((LayoutManager.I.layoutCurrentSize.width / LayoutManager.I.layoutScale.x) * 0.5, (LayoutManager.I.layoutCurrentSize.height / LayoutManager.I.layoutScale.y) * 0.125);
    this.baseY = this.logo.position.y;

    this.logo.zIndex = 10;
    this.containerUi.addChild(this.logo);
  }  

  private createButtons() {
    const buttonsYPos =(LayoutManager.I.layoutCurrentSize.height / LayoutManager.I.layoutScale.y) * 0.77;
    const buttonsXSpacing = (LayoutManager.I.layoutCurrentSize.width / LayoutManager.I.layoutScale.x) / 4;

    this.playBtn = new Button(2.5, "play", () => {this.birdFadeOf = false; SceneManager.I.fire("play");});
    this.playBtn.position = {x: (LayoutManager.I.layoutCurrentSize.width / LayoutManager.I.layoutScale.x) * 0.5, y: buttonsYPos};

    this.settingsBtn = new Button(2.5, "settings", () => SceneManager.I.fire("settings"), 0x0c0807);
    this.settingsBtn.position = {x: (LayoutManager.I.layoutCurrentSize.width / LayoutManager.I.layoutScale.x) * 0.5 - buttonsXSpacing, y: buttonsYPos};

    this.rankingBtn = new Button(2.5, "ranking", () => SceneManager.I.fire("ranking"), 0xff8800);
    this.rankingBtn.position = {x: (LayoutManager.I.layoutCurrentSize.width / LayoutManager.I.layoutScale.x) * 0.5 + buttonsXSpacing, y: buttonsYPos};
    
    this.containerUi.addChild(this.playBtn, this.settingsBtn, this.rankingBtn);
  };

  private createBird() {
    this.bird = AssetsManager.I.getSprite("bird" + (SceneManager.I.playerIndex + 1).toString(), 0);
    this.bird.anchor.set(0.5);
    this.bird.zIndex = 12;

    this.bird.position = {x: (LayoutManager.I.layoutCurrentSize.width / LayoutManager.I.layoutScale.x) * 0.5, y: (LayoutManager.I.layoutCurrentSize.height / LayoutManager.I.layoutScale.y) * 0.614};
    this.bird.scale.set((LayoutManager.I.layoutCurrentSize.width / LayoutManager.I.layoutScale.x) * 0.0044);

    this.containerUi.addChild(this.bird);    
  }

  private createSideButtons() {    
    const distFromCenter = (LayoutManager.I.layoutCurrentSize.width / LayoutManager.I.layoutScale.x) / 10;

    this.nextBtn = new Button(1.5, "smallArrow", () => {
      SceneManager.I.playerIndex = (SceneManager.I.playerIndex + 1) % 7;
      this.bird = AssetsManager.I.getSprite("bird" + (SceneManager.I.playerIndex + 1).toString(), 0, this.bird);
    }, 0xffffff, true, 0, 2);
    this.prevBtn = new Button(1.5, "smallArrow", () => {     
      SceneManager.I.playerIndex = (SceneManager.I.playerIndex - 1 + 7) % 7;
      this.bird = AssetsManager.I.getSprite("bird" + (SceneManager.I.playerIndex + 1).toString(), 0, this.bird);
    }, 0xffffff, true, Math.PI, 2);

    this.prevBtn.position = {x: this.bird.position.x - distFromCenter, y: this.bird.position.y * 1.008};
    this.nextBtn.position = {x: this.bird.position.x + distFromCenter, y: this.bird.position.y * 1.008};    

    this.containerUi.addChild(this.prevBtn);  
    this.containerUi.addChild(this.nextBtn);    
  }

  private startLogoFloat() {
    if (!this.logo) return;

    const baseY = this.logo.y;

    const amplitude = (LayoutManager.I.layoutCurrentSize.height / LayoutManager.I.layoutScale.y) * 0.015;
    const duration = ms(2000);

    this.logoTweenID = TweenManager.I.AddLoopTween(<Tween<Container>>{
      waitTime: ms(0),
      duration: duration,
      context: this.logo!,
      tweenFunction: function (elapsed) {
        const t = Number(elapsed) / Number(this.duration); // LINEAL ⇒ 0..1
        const offset = Math.sin(t * Math.PI * 2) * amplitude; 
        this.context.y = baseY + offset;
      }
    }).id;
  }


  private fadeTo(target: number, duration: number, waitTime: number, onComplete?: () => void) {
    const start = this.containerUi.alpha;

    TweenManager.I.AddTween(<Tween<Container>>{
      waitTime: ms(waitTime),
      duration: ms(duration),
      context: this.containerUi!,
      tweenFunction: function (elapsed) {
        const t = TweenManager.easeOutCubic(elapsed, this.duration);
        const v = start + (target - start) * t;
        this.context.alpha = v;
        if (elapsed >= ms(duration)) onComplete?.();
      },
    });
  }
}
