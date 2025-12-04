import { Container, Sprite, Texture, Rectangle, BitmapText, Point, Graphics, Triangle, Size } from "pixi.js";
import { IScene } from "../abstractions/IScene";
import { SceneManager } from "../managers/SceneManager";
import { GameManager } from "../managers/GameManager";
import { TweenManager, Tween, CreatedTween } from "../managers/TweenManager";
import { ms } from "../time/TimeUnits";
import { IdProvider, UniqueId } from "../objects/IdProvider";
import { Button } from "../objects/UI/Button";
import { AssetsManager } from "../managers/AssetsManager";
import { LayoutManager } from "../managers/LayoutManager";
import { getRanking } from "../../SessionManager";
import { EditableField } from "../objects/UI/EditableField";
import { sound } from "@pixi/sound";

export class MainMenuScene implements IScene {
  private playBtn!: Button;
  private settingsBtn!: Button;
  private rankingBtn!: Button;
  private nextBtn!: Button;
  private prevBtn!: Button;
  private pill!: Graphics;
  private pillSpike!: Graphics;
  private editableField!: EditableField;
  private htmlInput!: HTMLInputElement;

  private logo!: Sprite;  
  private bird!: Sprite;

  private bmName!: BitmapText

  private logoBaseW = 0;
  private baseY = 0;
  private elapsed = 0;

  private playEnter!: boolean;

  private birdFadeOf: boolean;
  private preloadRanking: boolean;

  private logoTweenID!: UniqueId; 

  public containerGame: Container;
  public containerUi: Container;  

  constructor() {
    this.containerGame = new Container();
    this.containerUi = new Container();
    this.containerGame.sortableChildren = true;
    this.containerUi.sortableChildren = true;
    this.birdFadeOf = true;   
    this.preloadRanking = false;
  }

  public async onInit(): Promise<void> {
   
    this.createLogo();
    this.createNamePill();
    this.createButtons();
    this.createBird();
    this.createSideButtons();
    this.startLogoFloat();   

    this.containerUi.alpha = 0;
    this.playEnter  = true;
  }

  public async onEnter(): Promise<void> {
    if(GameManager.I.settings.audioEnabled && this.playEnter){
      setTimeout(() => {
        sound.play("appear");
      }, 300);
    }
    this.containerUi.alpha = 0;
    this.htmlInput.style.opacity = "0";
    this.birdFadeOf = true;    
    this.preloadRanking = false;
    this.editableField.refreshVisuals();

    this.settingsBtn.onStart();
    this.playBtn.onStart();
    this.rankingBtn.onStart();
    this.nextBtn.onStart();
    this.prevBtn.onStart();
    
    await Promise.all([TweenManager.I.fadeTo([this.containerUi], 1, 500, 100), TweenManager.I.fadeHtmlTo([this.htmlInput], 1, 500, 100).finished]);    

    this.logo.removeFromParent();
    this.containerUi.addChild(this.logo);

    this.settingsBtn.enableInput();
    this.playBtn.enableInput();
    this.rankingBtn.enableInput();
    this.nextBtn.enableInput();
    this.prevBtn.enableInput();
  }

  public onUpdate(dt: number): void {}


  public async onExit(): Promise<void> {

    this.playEnter = false;
    if(GameManager.I.settings.audioEnabled && !this.birdFadeOf){
      setTimeout(() => {
        sound.play("disappear");
      }, 150);
    }
    
    this.playBtn.resetVisuals();
    this.settingsBtn.resetVisuals();
    this.rankingBtn.resetVisuals();

    if(this.bird && !this.birdFadeOf){
      this.containerUi.removeChild(this.bird);
      this.containerGame.addChild(this.bird);
    }

    if(this.preloadRanking){      
      const [_, rankingInfo] = await Promise.all([TweenManager.I.fadeTo([this.containerUi], 0, 500).finished, getRanking(), TweenManager.I.fadeHtmlTo([this.htmlInput], 0, 500, 0).finished]);
      GameManager.I.lastLoadedRankingInfo = rankingInfo;
    }
    else{
      await Promise.all([TweenManager.I.fadeTo([this.containerUi], 0, 500).finished, TweenManager.I.fadeHtmlTo([this.htmlInput], 0, 500, 0).finished]);
    }   

  }

  public async onDestroy(): Promise<void> {    
    TweenManager.I.KillTween(this.logoTweenID); 

    this.playBtn.freeResources();
    this.settingsBtn.freeResources();
    this.rankingBtn.freeResources();
    this.nextBtn.freeResources();
    this.prevBtn.freeResources();

    this.editableField.freeResources();

    this.logo.removeFromParent();
    AssetsManager.I.releaseSprite(this.logo);
    AssetsManager.I.removeSpriteReference("logo");

    this.bird.removeFromParent();
    GameManager.I.gameApp.stage.addChild(this.bird);
    AssetsManager.I.saveSpriteReference("player", this.bird);
  }

  private createLogo() {
    this.logo = AssetsManager.I.getSpriteFromReference("logo");

    if(this.logo){
      this.logo.removeFromParent();
    }
    else{    
      this.logo = AssetsManager.I.getSprite("logo", 0);
      const logoBaseW = this.logo.texture.width;
      
      const scale = ((LayoutManager.I.layoutCurrentSize.width / LayoutManager.I.layoutScale.x) / 2) / logoBaseW;
      this.logo.scale.set(scale);
      
      this.logo.anchor.set(0.5);
      this.logo.position.set((LayoutManager.I.layoutCurrentSize.width / LayoutManager.I.layoutScale.x) * 0.5, (LayoutManager.I.layoutCurrentSize.height / LayoutManager.I.layoutScale.y) * 0.2);
      this.baseY = this.logo.position.y;
      
    }

    this.logo.zIndex = 10;
    this.containerGame.addChild(this.logo);
    
  }  

  private createNamePill(){
    const pillWidth = (LayoutManager.I.layoutCurrentSize.width / LayoutManager.I.layoutScale.x) * 0.25;
    const pillHeight = (LayoutManager.I.layoutCurrentSize.height / LayoutManager.I.layoutScale.y) * 0.06;
    const pillX = ((LayoutManager.I.layoutCurrentSize.width / LayoutManager.I.layoutScale.x) * 0.5) - (pillWidth * 0.5);
    const pillY = ((LayoutManager.I.layoutCurrentSize.height / LayoutManager.I.layoutScale.y) * 0.52) - (pillHeight * 0.5);
    const radius = pillHeight * 0.5; 

    this.pill = new Graphics().roundRect(pillX, pillY, pillWidth, pillHeight, radius).fill(0xFF6F61);   

    const pillSpikeBase = pillWidth * 0.2;
    this.pillSpike = new Graphics();
    this.pillSpike.moveTo(pillSpikeBase * 0.5, pillSpikeBase).lineTo(pillSpikeBase, pillSpikeBase * 0.5).lineTo(0, pillSpikeBase * 0.5).closePath().fill(0xFF6F61);
    this.pillSpike.position = {x: (pillX + (pillWidth * 0.5)) - pillSpikeBase * 0.5 , y: pillY + pillHeight - (pillSpikeBase * 0.5)};

    this.pill.addChild(this.pillSpike);
    this.containerUi.addChild(this.pill);
   
    this.htmlInput = document.createElement("input");
    this.htmlInput.type = "text";
    this.htmlInput.value = GameManager.I.sessionData.name;
    this.htmlInput.style.letterSpacing = "0.5px";

    const fs = Math.round((LayoutManager.I.layoutCurrentSize.width) * 0.04);
    this.htmlInput.style.fontSize = `${fs}px`;
    this.htmlInput.style.lineHeight = `${fs}px`;


    Object.assign(this.htmlInput.style, {
      position: "absolute",
      background: "transparent",
      color: "#2F4858",

      appearance: "none",
      WebkitAppearance: "none",
      MozAppearance: "none",

      padding: "0",
      margin: "0",
      border: "none",
      outline: "none",

      lineHeight: "1",
      boxSizing: "content-box",
      borderRadius: "0",

      backgroundColor: "transparent",

      fontSmoothing: "none",
      WebkitFontSmoothing: "none",
      textRendering: "optimizeSpeed",

      transformOrigin: "0 0",

      pointerEvents: "auto",

      zIndex: "99999",
      fontFamily: "vcrTTF",
      textAlign: "center",
    });

    document.body.appendChild(this.htmlInput);

    const reposEvent: () => void = () => {

        const width = (LayoutManager.I.layoutCurrentSize.width) * 0.25;
        const posX = ((LayoutManager.I.layoutCurrentSize.width / LayoutManager.I.layoutScale.x) * 0.5) - ((width / LayoutManager.I.layoutScale.x) * 0.5);
        const height = (LayoutManager.I.layoutCurrentSize.height) * 0.06;
        const posY = ((LayoutManager.I.layoutCurrentSize.height / LayoutManager.I.layoutScale.y) * 0.52) - ((height / LayoutManager.I.layoutScale.y) * 0.48);        
        const localPos = new Point(posX, posY + ((height / LayoutManager.I.layoutScale.y) * 0.2));

        const globalPos = LayoutManager.I.uiContainer.toGlobal(localPos);
        this.htmlInput.style.width = `${width}px`;
        const fontSize = (LayoutManager.I.layoutCurrentSize.width) * 0.04;

        Object.assign(this.htmlInput.style, {
          left: `${globalPos.x}px`,
          top: `${globalPos.y}px`,
          fontSize: `${fontSize}px`,
        });
    }

    this.editableField = new EditableField(this.htmlInput, this.pill, 8, reposEvent);
    window.addEventListener("resize", reposEvent);
  }

  private createButtons() {
    const buttonsYPos =(LayoutManager.I.layoutCurrentSize.height / LayoutManager.I.layoutScale.y) * 0.77;
    const buttonsXSpacing = (LayoutManager.I.layoutCurrentSize.width / LayoutManager.I.layoutScale.x) / 4;

    this.playBtn = new Button(2.5, "play", () => { this.birdFadeOf = false; SceneManager.I.fire("play"); });
    this.playBtn.position = {x: (LayoutManager.I.layoutCurrentSize.width / LayoutManager.I.layoutScale.x) * 0.5, y: buttonsYPos};

    this.settingsBtn = new Button(2.5, "settings", () => SceneManager.I.fire("settings"), "click", 0x0c0807);
    this.settingsBtn.position = {x: (LayoutManager.I.layoutCurrentSize.width / LayoutManager.I.layoutScale.x) * 0.5 - buttonsXSpacing, y: buttonsYPos};

    this.rankingBtn = new Button(2.5, "ranking", () => {this.preloadRanking = true; SceneManager.I.fire("ranking");}, "click", 0xff8800);
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
    }, "click", 0xffffff, true, 0, 2);
    this.prevBtn = new Button(1.5, "smallArrow", () => {     
      SceneManager.I.playerIndex = (SceneManager.I.playerIndex - 1 + 7) % 7;
      this.bird = AssetsManager.I.getSprite("bird" + (SceneManager.I.playerIndex + 1).toString(), 0, this.bird);
    }, "click", 0xffffff, true, Math.PI, 2);

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
        const t = Number(elapsed) / Number(this.duration); 
        const offset = Math.sin(t * Math.PI * 2) * amplitude; 
        this.context.y = baseY + offset;
      }
    }).id;
  }

}
