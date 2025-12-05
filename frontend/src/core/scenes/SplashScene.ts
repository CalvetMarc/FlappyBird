import { BitmapText, Container, Graphics, HTMLText, Sprite, Text, TextStyle } from "pixi.js";
import { IScene } from "../abstractions/IScene";
import { LayoutManager } from "../managers/LayoutManager";
import { AssetsManager } from "../managers/AssetsManager";
import { ms } from "../time/TimeUnits";
import { Tween, TweenManager } from "../managers/TweenManager";
import { UniqueId } from "../objects/IdProvider";
import { GameManager } from "../managers/GameManager";
import { SceneManager } from "../managers/SceneManager";
import { sound } from "@pixi/sound";

export class SplashScene implements IScene {
  
  public containerGame: Container;
  public containerUi: Container;

  private logo!: Sprite;
  private authorParent!: Container;
  private hint!: BitmapText;
  private iosPopup!: Container;

  private authorTweenID!: UniqueId; 
  private hintTweenID!: UniqueId; 
  private isIos!: boolean;

  private infoTextOptions!: any;
  private infoText!: Text;

  private warningTextOptions!: any;
  private warningLabel!: Text;
  
  constructor() {
    this.containerGame = new Container();
    this.containerUi = new Container();
    this.authorParent = new Container();

    this.isIos = GameManager.I.isIOS();
  }

  public async onInit(): Promise<void> {
    this.createLogo();
    this.createAuthor();
    this.createHint();    

    if (this.isIos) {
      this.createIosWarning();      
    }

    GameManager.I.gameApp.stage.eventMode = "static";
    GameManager.I.gameApp.stage.on("pointerdown", this.interactForContinue);
    window.addEventListener("keydown", this.interactForContinue);
  }

  public async onEnter(): Promise<void> {
    if(this.isIos){
      TweenManager.I.moveTo([this.iosPopup], (LayoutManager.I.layoutCurrentSize.width / LayoutManager.I.layoutScale.x) * 0.5,  (LayoutManager.I.layoutCurrentSize.height / LayoutManager.I.layoutScale.y) * 0.95, 
        (LayoutManager.I.layoutCurrentSize.width / LayoutManager.I.layoutScale.x) * 0.55);
      TweenManager.I.scaleTo([this.iosPopup], 1,  1, (LayoutManager.I.layoutCurrentSize.width / LayoutManager.I.layoutScale.x) * 0.55);
    }
  }
  public onUpdate(dt: number): void {}

  public async onExit(): Promise<void> {
    TweenManager.I.KillTween(this.authorTweenID);
    TweenManager.I.KillTween(this.hintTweenID);
    this.hint.alpha = 1;

    if(this.isIos){
      TweenManager.I.moveTo([this.iosPopup], (LayoutManager.I.layoutCurrentSize.width / LayoutManager.I.layoutScale.x) * 0.5,  (LayoutManager.I.layoutCurrentSize.height / LayoutManager.I.layoutScale.y) * 1.2, 
        (LayoutManager.I.layoutCurrentSize.width / LayoutManager.I.layoutScale.x) * 1.1, 0);
      TweenManager.I.scaleTo([this.iosPopup], 0.2,  0.2, (LayoutManager.I.layoutCurrentSize.width / LayoutManager.I.layoutScale.x) * 1.1, 0);
    }

    await new Promise(resolve => setTimeout(resolve, 300));

    if (GameManager.I.settings.audioEnabled) {
      sound.play("woosh1");
    }

    await TweenManager.I.moveTo([this.authorParent], (LayoutManager.I.layoutCurrentSize.width / LayoutManager.I.layoutScale.x) + (this.authorParent.getChildAt(0).width * 0.5), this.authorParent.position.y, 300).finished;

    if (GameManager.I.settings.audioEnabled){
      sound.play("woosh1");
    } 

    await TweenManager.I.moveTo([this.hint], -this.hint.width, this.hint.position.y, 600).finished;

    GameManager.I.backgroundController.setScrolling(true);

    this.logo.removeFromParent();
    GameManager.I.gameApp.stage.addChild(this.logo);
  }

  public async onDestroy(): Promise<void> {
    const authText: BitmapText = this.authorParent.getChildAt(0);
    authText.removeFromParent();    
    AssetsManager.I.releaseText(authText);

    this.hint.removeFromParent();
    AssetsManager.I.releaseText(this.hint);

    if(this.isIos){
      const infoText: BitmapText = this.iosPopup.getChildAt(2);
      const messageText: BitmapText = this.iosPopup.getChildAt(3);
      infoText.removeFromParent();
      messageText.removeFromParent();
      AssetsManager.I.releaseText(infoText);
      AssetsManager.I.releaseText(messageText);
    }
  }

  private createLogo() {
    this.logo = AssetsManager.I.getSprite("logo", 0);
    const baseW = this.logo.texture.width;

    const scale = ((LayoutManager.I.layoutCurrentSize.width / LayoutManager.I.layoutScale.x) / 2) / baseW;
    this.logo.scale.set(scale);

    this.logo.anchor.set(0.5);
    this.logo.position.set((LayoutManager.I.layoutCurrentSize.width / LayoutManager.I.layoutScale.x) * 0.5, (LayoutManager.I.layoutCurrentSize.height / LayoutManager.I.layoutScale.y) * 0.2);

    AssetsManager.I.saveResourceReference("logo", this.logo);
    this.containerUi.addChild(this.logo);
  }

  private createAuthor() {
    const author = AssetsManager.I.getText("by Marc Calvet!", "vcrHeavy", (LayoutManager.I.layoutCurrentSize.width / LayoutManager.I.layoutScale.x) * 0.04);

    author.anchor.set(0.5);
    author.rotation = -Math.PI * 0.15;
    author.style.fill = 0xD4D400;

    this.authorParent.addChild(author);
    this.authorParent.position.set((LayoutManager.I.layoutCurrentSize.width / LayoutManager.I.layoutScale.x) * 0.75, (LayoutManager.I.layoutCurrentSize.height / LayoutManager.I.layoutScale.y) * 0.3);

    this.containerGame.addChild(this.authorParent);

    const baseScale = author.scale;
    const amplitude = 0.003;
    const duration = ms(1400);

    this.authorTweenID = TweenManager.I.AddLoopTween(<Tween<Container>>{
      waitTime: ms(0),
      duration,
      context: author!,
      tweenFunction(elapsed) {
        const t = Number(elapsed) / Number(this.duration);
        const offset = Math.sin(t * Math.PI * 2) * amplitude; 
        this.context.scale.set(baseScale.x + offset, baseScale.y + offset);
      }
    }).id;
  }

  private createHint() {
    this.hint = AssetsManager.I.getText("press something to start", "vcrBase", (LayoutManager.I.layoutCurrentSize.width / LayoutManager.I.layoutScale.x) * 0.04);

    this.hint.anchor.set(0.5);
    this.hint.position.set((LayoutManager.I.layoutCurrentSize.width / LayoutManager.I.layoutScale.x) * 0.5, (LayoutManager.I.layoutCurrentSize.height / LayoutManager.I.layoutScale.y) * 0.53);

    this.hint.style.fill = 0x666666;
    this.containerGame.addChild(this.hint);

    const baseOpacity = 0.5;
    const amplitude = 0.5;
    const duration = ms(2800);

    this.hintTweenID = TweenManager.I.AddLoopTween(<Tween<Container>>{
      waitTime: ms(0),
      duration,
      context: this.hint!,
      tweenFunction(elapsed) {
        const t = Number(elapsed) / Number(this.duration);
        const offset = Math.sin(t * Math.PI * 2) * amplitude;
        this.context.alpha = baseOpacity + offset;
      }
    }).id;
  }

  private createIosWarning() {
    this.iosPopup = new Container();

    const width = (LayoutManager.I.layoutCurrentSize.width / LayoutManager.I.layoutScale.x) * 0.65;

    const popup = new Graphics().roundRect(-width * 0.5, -width * 0.5 * 0.08, width, width * 0.08, 15).fill(0x27323A);

    this.iosPopup.addChild(popup);

    this.iosPopup.position.set((LayoutManager.I.layoutCurrentSize.width / LayoutManager.I.layoutScale.x) * 0.5, (LayoutManager.I.layoutCurrentSize.height / LayoutManager.I.layoutScale.y) * 1.2);

    const infoCircle = new Graphics().circle(0, 0, (LayoutManager.I.layoutCurrentSize.width / LayoutManager.I.layoutScale.x) * 0.014).fill(0xDCD6BD);

    infoCircle.position.set(-width * 0.435, 0);
    this.iosPopup.addChild(infoCircle);

    const infoText: BitmapText = AssetsManager.I.getText("i", "Trebuchet MS", width * 0.045);
    infoText.anchor = 0.5;
    infoText.position = infoCircle.position;
    infoText.tint = 0x27323A;

    const infoMessage: BitmapText = AssetsManager.I.getText("Disable Silent Mode / Mute Switch to hear the game!", "Trebuchet MS", width * 0.035);
    infoMessage.anchor = 0.5;
    infoMessage.position.x = width * 0.035;
    infoMessage.tint = 0xDCD6BD;

    this.iosPopup.addChild(infoText);
    this.iosPopup.addChild(infoMessage);
    this.containerGame.addChild(this.iosPopup);

    this.iosPopup.scale.set(0.2);
  }  

  private interactForContinue = () => {
    if (GameManager.I.settings.audioEnabled){
      sound.play("enter");
    } 
      

    GameManager.I.gameApp.stage.eventMode = "auto";
    GameManager.I.gameApp.stage.removeListener("pointerdown", this.interactForContinue);
    window.removeEventListener("keydown", this.interactForContinue);

    SceneManager.I.fire("menu");
  };
}
