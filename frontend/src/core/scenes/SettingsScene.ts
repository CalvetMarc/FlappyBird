import { Container, Sprite, Texture, Assets, Rectangle, BitmapText, Size } from "pixi.js";
import { IScene } from "../abstractions/IScene";
import { SceneManager } from "../managers/SceneManager";
import { GameManager } from "../managers/GameManager";
import { TweenManager, Tween } from "../managers/TweenManager";
import { ms } from "../time/TimeUnits";
import { AssetsManager } from "../managers/AssetsManager";
import { Toggle } from "../objects/UI/Toggle"
import { LayoutManager } from "../managers/LayoutManager";


export class SettingsScene implements IScene {
  private titleText!: BitmapText;
  private bgSprite!: Sprite;
  
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
         //GameManager.I.app.stage.removeChild(this.container);
        resolve();
      });
    });
  }

  public async onDestroy(): Promise<void> {
    //TODO
  }

  /** 🧩 Carrega textures igual que al MainMenuScene */
  private async loadAssets() {
    this.createSettingsBg();
    //this.createToggles();
    //this.createButton();
  }


  private createSettingsBg() { 

    const textureSize: Size = AssetsManager.I.getTextureSize("panelOrange");
    const aspectRelation: number = textureSize.height / textureSize.width;
    this.bgSprite = AssetsManager.I.getSprite("panelOrange");

    this.bgSprite.width = LayoutManager.I.layoutSize.width / 4;
    this.bgSprite.height = this.bgSprite.width * aspectRelation;
    this.bgSprite.rotation = Math.PI/2;
    this.bgSprite.anchor.set(0.5);
    this.bgSprite.zIndex = 5;
    this.bgSprite.position.set(LayoutManager.I.layoutSize.width * 0.5, LayoutManager.I.layoutSize.height * 0.4);
    
    this.titleText = AssetsManager.I.getText("VCR OSD Mono", 48);

    this.titleText.anchor.set(0.5, 1);
    this.titleText.zIndex = 6;
    this.titleText.position.set(this.bgSprite.x, this.bgSprite.y - (this.bgSprite.height * 0.5 * 0.76));

    this.bgSprite.addChild(this.titleText)
    this.containerUi.addChild(this.bgSprite);
  }

  /* 🟩 Crea i afegeix els tres toggles dins del bgSprite */
  private createToggles() {
    if (!this.bgSprite || !this.toggleOnTex || !this.toggleOffTex) return;

    this.audioToggle = new ToggleSwitch("Audio", this.toggleOnTex, this.toggleOffTex, true, this.bgSprite, 0);
    this.dayCycleToggle = new ToggleSwitch("Day Cycle", this.toggleOnTex, this.toggleOffTex, true, this.bgSprite, 1);
    this.speedProgToggle = new ToggleSwitch("Speed Progression", this.toggleOnTex, this.toggleOffTex, false, this.bgSprite, 2);

    this.audioToggle.zIndex = 7;
    this.dayCycleToggle.zIndex = 7;
    this.speedProgToggle.zIndex = 7;

    this.container.addChild(this.audioToggle, this.dayCycleToggle, this.speedProgToggle);
  }

  private createButton() {
    if (!this.normalTex || !this.pressedTex) return;

    const screenW = GameManager.I.app.renderer.width;
    const screenH = GameManager.I.app.renderer.height;    
    
    const btn = AssetsManager.I.getSprite("ui", "button", 0);
    btn.anchor.set(0.5);
    btn.zIndex = 10;
   
    btn.scale.set((BackgroundManager.I.bgRect.width / 10) / btn.width);
    btn.position.set(screenW / 2, screenH / 1.3);
    btn.eventMode = "static";
    btn.cursor = "pointer";

    btn.on("pointerdown", () => {
      btn.scale.set((BackgroundManager.I.bgRect.width / 10) / 15 * 0.9);
      btn.texture = this.pressedTex!;
    });

    btn.on("pointerup", () => {
      btn.scale.set((BackgroundManager.I.bgRect.width / 10) / 15);
      btn.texture = this.normalTex!;
      setTimeout(() => SceneManager.I.fire("menu"), 80);
    });

    btn.on("pointerupoutside", () => {
      btn.scale.set((BackgroundManager.I.bgRect.width / 10) / 15);
      btn.texture = this.normalTex!;
    });

    this.baseY = btn.y;
    this.container.addChild(btn);
    this.button = btn;
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
