import { Container, Sprite, Texture, Rectangle, BitmapText } from "pixi.js";
import { IScene } from "../abstractions/IScene";
import { SceneManager } from "../managers/SceneManager";
import { GameManager } from "../managers/GameManager";
import { TweenManager, Tween, CreatedTween } from "../managers/TweenManager";
import { ms } from "../time/TimeUnits";
import { UniqueId } from "../objects/IdProvider";
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
  }

  public async onInit(): Promise<void> {

    const loadedFontText = new BitmapText({
      text: 'Hello Pixi!',
      style: {
        fontFamily: 'VCR OSD Mono', // Name from .fnt file
        fontSize: 48,
        fill: 0xff1010,
        align: 'center',
      }
    });
    this.containerUi.addChild(loadedFontText);
    this.createLogo();
    this.createButtons();
    this.createBird();
    this.createSideButtons();

    this.containerUi.alpha = 0;
  }

  public onEnter(): void {
    this.containerUi.alpha = 0;
    this.birdFadeOf = true;
    this.fadeTo(1, 500, 100);

    this.startLogoFloat();
  }

  public onUpdate(dt: number): void {  }

  public async onExit(): Promise<void> {
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
  }

  private createLogo() {
    this.logo = AssetsManager.I.getSprite("ui", "logo", 0);
    this.logoBaseW = this.logo.texture.width;

    const scale = (LayoutManager.I.layoutSize.width / 3) / this.logoBaseW;
    this.logo.scale.set(scale);

    this.logo.anchor.set(0.5);
    this.logo.position.set(LayoutManager.I.layoutSize.width * 0.5, LayoutManager.I.layoutSize.height * 0.125);
    this.baseY = this.logo.position.y;

    this.logo.zIndex = 10;
    this.containerUi.addChild(this.logo);
  }  

  private createButtons() {
    const buttonsYPos = LayoutManager.I.layoutSize.height * 0.77;
    const buttonsXSpacing = LayoutManager.I.layoutSize.width / 4;

    this.playBtn = new Button(2.5, "play", () => SceneManager.I.fire("play"));
    this.playBtn.position = {x: LayoutManager.I.layoutSize.width * 0.5, y: buttonsYPos};

    this.settingsBtn = new Button(2.5, "settings", () => SceneManager.I.fire("settings"), 0x0c0807);
    this.settingsBtn.position = {x: LayoutManager.I.layoutSize.width * 0.5 - buttonsXSpacing, y: buttonsYPos};

    this.rankingBtn = new Button(2.5, "ranking", () => SceneManager.I.fire("ranking"), 0xff8800);
    this.rankingBtn.position = {x: LayoutManager.I.layoutSize.width * 0.5 + buttonsXSpacing, y: buttonsYPos};
    
    this.containerUi.addChild(this.playBtn, this.settingsBtn, this.rankingBtn);
  };

  private createBird() {
    this.bird = AssetsManager.I.getSprite("characters", "bird" + (SceneManager.I.playerIndex + 1).toString(), 0);
    this.bird.anchor.set(0.5);
    this.bird.zIndex = 12;

    this.bird.position = {x: LayoutManager.I.layoutSize.width * 0.5, y: LayoutManager.I.layoutSize.height * 0.614};
    this.bird.scale.set(LayoutManager.I.layoutSize.width * 0.0044);

    this.containerUi.addChild(this.bird);    
  }

  private createSideButtons() {    
    const distFromCenter = LayoutManager.I.layoutSize.width / 10;

    this.nextBtn = new Button(1.5, "smallArrow", () => {
      SceneManager.I.playerIndex = (SceneManager.I.playerIndex + 1) % 7;
      this.bird = AssetsManager.I.getSprite("characters", "bird" + (SceneManager.I.playerIndex + 1).toString(), 0, this.bird);
    }, 0x4b5320, true, 0, 2);
    this.prevBtn = new Button(1.5, "smallArrow", () => {     
      SceneManager.I.playerIndex = (SceneManager.I.playerIndex - 1 + 7) % 7;
      this.bird = AssetsManager.I.getSprite("characters", "bird" + (SceneManager.I.playerIndex + 1).toString(), 0, this.bird);
    }, 0x4b5320, true, Math.PI, 2);

    this.prevBtn.position = {x: this.bird.position.x - distFromCenter, y: this.bird.position.y * 1.008};
    this.nextBtn.position = {x: this.bird.position.x + distFromCenter, y: this.bird.position.y * 1.008};    

    this.containerUi.addChild(this.prevBtn);  
    this.containerUi.addChild(this.nextBtn);    
  }

  private startLogoFloat() {
    if (!this.logo) return;

    const baseY = this.logo.y;

    const amplitude = LayoutManager.I.layoutSize.height * 0.015;
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
