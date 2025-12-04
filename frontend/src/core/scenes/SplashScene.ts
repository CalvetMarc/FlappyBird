import { BitmapText, Container, Graphics, Sprite, Text } from "pixi.js";
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

  private authorTweenID!: UniqueId; 
  private hintTweenID!: UniqueId; 
  
  constructor() {
    this.containerGame = new Container();
    this.containerUi = new Container();
    this.authorParent = new Container();
  }

  public async onInit(): Promise<void> {
    this.createLogo();
    this.createAuthor();
    this.createHint();

    GameManager.I.gameApp.stage.eventMode = "static";
    GameManager.I.gameApp.stage.on("pointerdown", this.interactForContinue);
    window.addEventListener("keydown", this.interactForContinue);
  }

  /** Called when the scene becomes active */
  public async onEnter(): Promise<void> {
    
  }

  /** Called every frame */
  public onUpdate(dt: number): void {
    
  }

  /** Called before scene is removed or pooled */
  public async onExit(): Promise<void> {
    TweenManager.I.KillTween(this.authorTweenID);
    TweenManager.I.KillTween(this.hintTweenID);    
    this.hint.alpha = 1;

    await new Promise(resolve => setTimeout(resolve, 300));

    sound.play("woosh1");
    await TweenManager.I.moveTo([this.authorParent], (LayoutManager.I.layoutCurrentSize.width / LayoutManager.I.layoutScale.x) + (this.authorParent.getChildAt(0).width * 0.5), this.authorParent.position.y, 300).finished;
    sound.play("woosh1");
    await TweenManager.I.moveTo([this.hint], -this.hint.width, this.hint.position.y, 600).finished;
    GameManager.I.backgroundController.setScrolling(true);

    this.logo.removeFromParent();
    GameManager.I.gameApp.stage.addChild(this.logo);
  }

  public async onDestroy(): Promise<void> {

    
  }

  private createLogo() {
    this.logo = AssetsManager.I.getSprite("logo", 0);
    const logoBaseW = this.logo.texture.width;
    
    const scale = ((LayoutManager.I.layoutCurrentSize.width / LayoutManager.I.layoutScale.x) / 2) / logoBaseW;
    this.logo.scale.set(scale);

    this.logo.anchor.set(0.5);
    this.logo.position.set((LayoutManager.I.layoutCurrentSize.width / LayoutManager.I.layoutScale.x) * 0.5, (LayoutManager.I.layoutCurrentSize.height / LayoutManager.I.layoutScale.y) * 0.2);
    AssetsManager.I.saveSpriteReference("logo", this.logo);
    
    this.containerUi.addChild(this.logo);
  } 

  private createAuthor() {
    const author: BitmapText = AssetsManager.I.getText("by Marc Calvet!", "vcrHeavy", (LayoutManager.I.layoutCurrentSize.width / LayoutManager.I.layoutScale.x) * 0.04);
    author.anchor.set(0.5);
    author.rotation = -Math.PI * 0.15;
    author.style.fill = 0xD4D400;
    this.authorParent.addChild(author);
    this.authorParent.position.set((LayoutManager.I.layoutCurrentSize.width / LayoutManager.I.layoutScale.x) * 0.75, (LayoutManager.I.layoutCurrentSize.height / LayoutManager.I.layoutScale.y) * 0.3);
    this.containerGame.addChild(this.authorParent);

    const baseScale = author.scale;
    
    const amplitude = 0.002;
    const duration = ms(1400);

    this.authorTweenID = TweenManager.I.AddLoopTween(<Tween<Container>>{
      waitTime: ms(0),
      duration: duration,
      context: author!,
      tweenFunction: function (elapsed) {
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
    this.hint.style.fill = 0x888888;
    this.containerGame.addChild(this.hint);

    const baseOpacity = 0.5;
    
    const amplitude = 0.5;
    const duration = ms(2800);

    this.hintTweenID = TweenManager.I.AddLoopTween(<Tween<Container>>{
      waitTime: ms(0),
      duration: duration,
      context: this.hint!,
      tweenFunction: function (elapsed) {
        const t = Number(elapsed) / Number(this.duration); 
        const offset = Math.sin(t * Math.PI * 2) * amplitude; 
        this.context.alpha = baseOpacity + offset;
      }
    }).id;
  } 

  private interactForContinue = () =>{
    sound.play("enter");
    GameManager.I.gameApp.stage.eventMode = "auto";
    GameManager.I.gameApp.stage.removeListener("pointerdown", this.interactForContinue);
    window.removeEventListener("keydown", this.interactForContinue);

    SceneManager.I.fire("menu");
  }
}
