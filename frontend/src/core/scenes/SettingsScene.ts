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
    await this.loadAssets();
  }

  public onEnter(): void {
    this.containerGame.alpha = 0;
    this.containerUi.alpha = 0;
    this.fadeTo(1, 500, 100);
  }

  public onUpdate(dt: number): void {}

  public async onExit(): Promise<void> {
    await new Promise<void>((resolve) => {
      this.fadeTo(0, 400, 0, () => {
        resolve();
      });
    });
  }

  public async onDestroy(): Promise<void> {
    //TODO
  }

  private async loadAssets() {
    this.createSettingsBg();
    this.createToggles();
    this.createButton();
  }


  private createSettingsBg() { 
    const textureBgSize: Size = AssetsManager.I.getTextureSize("bigPanelGrey");
    const aspectRelationBg: number = textureBgSize.width / textureBgSize.height;
    this.bgSprite = AssetsManager.I.getSprite("bigPanelGrey");

    this.bgSprite.height = LayoutManager.I.layoutSize.height * 0.5;
    this.bgSprite.width = this.bgSprite.height * aspectRelationBg;
    this.bgSprite.rotation = Math.PI * 0.5;
    this.bgSprite.anchor.set(0.5);
    this.bgSprite.zIndex = 5;
    this.bgSprite.position.set(LayoutManager.I.layoutSize.width * 0.5, LayoutManager.I.layoutSize.height * 0.43);

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
    this.audioToggle = new Toggle("Audio", "bigTick", "bigCross", 1, 7);
    this.bgSprite.addChild(this.audioToggle);
    this.audioToggle.rotation = -Math.PI * 0.5;
    this.audioToggle.position.set(-15, 0);
    this.audioToggle.scale.set(0.95);

    this.dayCycleToggle = new Toggle("Day Cycle", "bigTick", "bigCross", 1, 7);
    this.bgSprite.addChild(this.dayCycleToggle);
    this.dayCycleToggle.rotation = -Math.PI * 0.5;
    this.dayCycleToggle.position.set(3, 0);
    this.dayCycleToggle.scale.set(0.95);


    this.speedProgToggle = new Toggle("Speed Ramp", "bigTick", "bigCross", 1, 7, false);
    this.bgSprite.addChild(this.speedProgToggle);
    this.speedProgToggle.rotation = -Math.PI * 0.5;
    this.speedProgToggle.position.set(21, 0);
    this.speedProgToggle.scale.set(0.95);    
  }

  private createButton() {

    this.closeBtn = new Button(0.35, "cross", () => SceneManager.I.fire("menu"), 0x0c0807);
    this.closeBtn.position.x = 40;
    this.closeBtn.rotation = -Math.PI * 0.5;

    this.bgSprite.addChild(this.closeBtn);
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
      }    
    });
  }

}
