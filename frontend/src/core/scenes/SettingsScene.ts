import { Container, Sprite, Texture, Assets, Rectangle, BitmapText, Size } from "pixi.js";
import { IScene } from "../abstractions/IScene";
import { SceneManager } from "../managers/SceneManager";
import { GameManager } from "../managers/GameManager";
import { TweenManager, Tween } from "../managers/TweenManager";
import { ms } from "../time/TimeUnits";
import { AssetsManager } from "../managers/AssetsManager";
import { Toggle } from "../objects/UI/Toggle"
import { Button } from "../objects/UI/Button";
import { LayoutManager } from "../managers/LayoutManager";
import { sound } from "@pixi/sound";


export class SettingsScene implements IScene {
  private titleText!: BitmapText;
  private bgSprite!: Sprite;
  private titleBgSprite!: Sprite;
  private closeBtn!: Button;
  
  private audioToggle!: Toggle;
  private dayCycleToggle!: Toggle;
  private speedProgToggle!: Toggle;

  private baseY = 0;

  public containerGame: Container;
  public containerUi: Container;

  public constructor() {
    this.containerGame = new Container();
    this.containerUi = new Container();
    this.containerGame.sortableChildren = true;
    this.containerUi.sortableChildren = true;
  }

  public async onInit(): Promise<void> {
    this.createSettingsBg();
    this.createToggles();
    this.createButton();
  }

  public async onEnter(): Promise<void> {
    if(GameManager.I.settings.audioEnabled){
      setTimeout(() => {
        sound.play("sttgs");
      }, 150);
    }
    this.containerGame.alpha = 0;
    this.containerUi.alpha = 0;

    this.closeBtn.onStart();

    await TweenManager.I.fadeTo([this.containerUi], 1, 500, 100).finished;
  }

  public onUpdate(dt: number): void {}

  public async onExit(): Promise<void> {   
    this.closeBtn.resetVisuals();

    await TweenManager.I.fadeTo([this.containerUi], 0, 400).finished;
  }

  public async onDestroy(): Promise<void> {
    this.audioToggle.removeFromParent();
    this.containerUi.addChild(this.audioToggle);
    this.audioToggle.freeResources();

    this.dayCycleToggle.removeFromParent();
    this.containerUi.addChild(this.dayCycleToggle);
    this.dayCycleToggle.freeResources();

    this.speedProgToggle.removeFromParent();
    this.containerUi.addChild(this.speedProgToggle);
    this.speedProgToggle.freeResources();

    this.closeBtn.removeFromParent();
    this.containerUi.addChild(this.closeBtn);
    this.closeBtn.freeResources();

    this.titleBgSprite.removeChild();
    AssetsManager.I.releaseText(this.titleText);
    AssetsManager.I.releaseSprite(this.titleBgSprite);
    
    this.bgSprite.removeChildren();
    this.bgSprite.removeFromParent();
    AssetsManager.I.releaseSprite(this.bgSprite);
  }

  private createSettingsBg() { 
    const textureBgSize: Size = AssetsManager.I.getTextureSize("bigPanelGrey");
    const aspectRelationBg: number = textureBgSize.width / textureBgSize.height;
    this.bgSprite = AssetsManager.I.getSprite("bigPanelGrey");

    this.bgSprite.height = LayoutManager.I.layoutVirtualSize.height * 0.5;
    this.bgSprite.width = this.bgSprite.height * aspectRelationBg;
    this.bgSprite.rotation = Math.PI * 0.5;
    this.bgSprite.anchor.set(0.5);
    this.bgSprite.zIndex = 5;
    this.bgSprite.position.set((LayoutManager.I.layoutCurrentSize.width / LayoutManager.I.layoutScale.x) * 0.5, (LayoutManager.I.layoutCurrentSize.height / LayoutManager.I.layoutScale.y) * 0.43);

    const textureTitleBgSize: Size = AssetsManager.I.getTextureSize("title1up");
    const aspectRelationTitleBg: number = textureTitleBgSize.height / textureTitleBgSize.width;
    this.titleBgSprite = AssetsManager.I.getSprite("title1up");

    const width = this.titleBgSprite.width * 1.1;
    const height = width * aspectRelationTitleBg;
    this.titleBgSprite.width = width;
    this.titleBgSprite.height = height;
    this.titleBgSprite.rotation = -Math.PI * 0.5;
    this.titleBgSprite.anchor.set(0.5);
    this.titleBgSprite.zIndex = 5;
    this.titleBgSprite.position.set(-39, 0);
    
    this.titleText = AssetsManager.I.getText("Settings", "vcrHeavy", 9.5);
    this.titleText.anchor.set(0.5);
    this.titleText.zIndex = 6;
    this.titleText.position.set(0.5, -3);
    this.titleText.tint = 0xC0C0C0;
    
    this.titleBgSprite.addChild(this.titleText);
    this.bgSprite.addChild(this.titleBgSprite);    
    this.containerUi.addChild(this.bgSprite);
  }

  private createToggles() {
    this.audioToggle = new Toggle("Audio", "bigTick", "bigCross", 1, 7, () => { GameManager.I.settings.audioEnabled = !GameManager.I.settings.audioEnabled }, GameManager.I.settings.audioEnabled);
    this.bgSprite.addChild(this.audioToggle);
    this.audioToggle.rotation = -Math.PI * 0.5;
    this.audioToggle.position.set(-15, 0);
    this.audioToggle.scale.set(0.95);

    this.dayCycleToggle = new Toggle("Day Cycle", "bigTick", "bigCross", 1, 7, () => { GameManager.I.settings.dayCycleEnabled != GameManager.I.settings.dayCycleEnabled }, GameManager.I.settings.dayCycleEnabled);
    this.bgSprite.addChild(this.dayCycleToggle);
    this.dayCycleToggle.rotation = -Math.PI * 0.5;
    this.dayCycleToggle.position.set(3, 0);
    this.dayCycleToggle.scale.set(0.95);


    this.speedProgToggle = new Toggle("Speed Ramp", "bigTick", "bigCross", 1, 7, () => { GameManager.I.settings.speedRampEnabled != GameManager.I.settings.speedRampEnabled }, GameManager.I.settings.speedRampEnabled);
    this.bgSprite.addChild(this.speedProgToggle);
    this.speedProgToggle.rotation = -Math.PI * 0.5;
    this.speedProgToggle.position.set(21, 0);
    this.speedProgToggle.scale.set(0.95);    
  }

  private createButton() {

    this.closeBtn = new Button(0.25, "cross", () => SceneManager.I.fire("menu"), "exit1", 0x0c0807);
    this.closeBtn.position.x = 40;
    this.closeBtn.rotation = -Math.PI * 0.5;

    this.bgSprite.addChild(this.closeBtn);
  }

}
