import { Container, Sprite, Texture, Assets, Rectangle, Text } from "pixi.js";
import { IScene } from "../abstractions/IScene";
import { SceneManager } from "../managers/SceneManager";
import { BackgroundManager } from "../managers/BackgroundManager";
import { GameManager } from "../managers/GameManager";
import { TweenManager, Tween } from "../managers/TweenManager";
import { ms } from "../time/TimeUnits";
import { AssetsManager } from "../managers/AssetsManager";
import playUrl from "../../../public/assets/ui/UiCozyFree.png";

/* 🟩 Classe auxiliar per a un toggle simple */
class ToggleSwitch extends Container {
  private onTex: Texture;
  private offTex: Texture;
  private state: boolean;
  private knob: Sprite;
  private labelText: Text;
  private index: number;

  constructor(label: string, onTex: Texture, offTex: Texture, initial: boolean, parent: Sprite, index: number) {
    super();
    this.onTex = onTex;
    this.offTex = offTex;
    this.state = initial;
    this.index = index;

    // 🔤 Text gran i nítid
    this.labelText = new Text(label, {
      fontFamily: "Minecraft",
      fontSize: parent.width / 17,
      fill: 0xffffff,
      stroke: { color: 0x4B1810, width: parent.width / 90 },
      align: "left",
    });
    this.labelText.anchor.set(0, 0.5);

    // 🔘 Sprite del toggle (ON/OFF)
    this.knob = new Sprite(this.state ? this.onTex : this.offTex);
    this.knob.anchor.set(0.5);
    this.knob.width = parent.width / 15;
    this.knob.height = parent.width / 15;
    this.knob.eventMode = "static";
    this.knob.cursor = "pointer";
    this.knob.on("pointerdown", () => this.toggle());

    this.addChild(this.labelText, this.knob);
    this.layout(parent);
  }

  private layout(parent: Sprite) {
    const spacing = parent.width / 10;
    this.labelText.position.set(parent.position.x - (parent.width / 2 * 0.75), parent.position.y - (parent.height / 2 * 0.5) + (parent.height / 8 * this.index));

    // Centrat verticalment amb el text
    this.knob.position.set(this.labelText.position.x + this.labelText.width + (parent.width / 12), this.labelText.position.y);
  }

  public toggle() {
    this.state = !this.state;
    this.knob.texture = this.state ? this.onTex : this.offTex;
  }

  public getState() {
    return this.state;
  }

  public setState(v: boolean) {
    this.state = v;
    this.knob.texture = this.state ? this.onTex : this.offTex;
  }

  public recalculateTransform(parent: Sprite){
    this.labelText.style.fontSize = parent.width / 17;
    this.labelText.style.stroke = { color: 0x4B1810, width: parent.width / 90 };
    this.knob.width = parent.width / 15;
    this.knob.height = parent.width / 15;

    this.layout(parent);
  }

  public onDestroy(){
    this.onTex?.destroy();
    this.offTex?.destroy();
    this.knob?.destroy();
    this.labelText?.destroy();
  }
}



/* ─────────────────────────────────────────────────────────────────────── */

export class SettingsScene implements IScene {
  private button?: Sprite;
  private bgSprite?: Sprite;
  private titleText?: Text;
  private normalTex?: Texture;
  private pressedTex?: Texture;
  private settingsBgTex?: Texture;

  /* 🟩 Textures per als toggles */
  private toggleOnTex?: Texture;
  private toggleOffTex?: Texture;

  /* 🟩 Toggles */
  private audioToggle?: ToggleSwitch;
  private dayCycleToggle?: ToggleSwitch;
  private speedProgToggle?: ToggleSwitch;

  private baseY = 0;

  public container = new Container();

  public constructor() {
    this.container.sortableChildren = true;
  }

  public async onInit(): Promise<void> {
    await this.loadAssets();
  }

  public onEnter(): void {
    this.container.alpha = 0;
    this.fadeTo(1, 500, 100);
  }

  public onUpdate(dt: number): void {}

  public async onExit(): Promise<void> {
    await new Promise<void>((resolve) => {
      this.fadeTo(0, 400, 0, () => {
         GameManager.I.app.stage.removeChild(this.container);
        resolve();
      });
    });
  }

  public async onDestroy(): Promise<void> {

    this.button?.destroy();
    this.bgSprite?.destroy();
    this.titleText?.destroy();
    this.normalTex?.destroy();
    this.pressedTex?.destroy();
    this.button?.destroy();
    this.settingsBgTex?.destroy();
    this.toggleOnTex?.destroy();
    this.toggleOffTex?.destroy();
    
    this.audioToggle?.onDestroy();
    this.dayCycleToggle?.onDestroy();
    this.speedProgToggle?.onDestroy();
  }

  public onResize(width: number, height: number): void {
    const bgWidth = BackgroundManager.I.bgRect.width;

    if (this.button) {
      const targetWidth = bgWidth / 10;
      const scale = (BackgroundManager.I.bgRect.width / 10) / 15;
      this.button.scale.set(scale);
      this.button.position.set(width / 2, height / 1.3);
    }

    if (this.bgSprite) {
      const targetWidth = bgWidth / 4;
      const scale = targetWidth / this.bgSprite.texture.width;
      this.bgSprite.scale.set(scale * 2.4);
      this.bgSprite.position.set(width / 2, height / 2.5);
    }

    if (this.titleText && this.bgSprite) {
      this.titleText.position.set(this.bgSprite.x, this.bgSprite.y - (this.bgSprite.height / 2 * 0.76));
      this.titleText.style.fontSize = this.bgSprite.width / 11;
      this.titleText.style.stroke = { color: 0x4B1810, width: this.bgSprite.width / 90  };
    }

    /* 🟩 Reposiciona els toggles al canviar mida */
    if(this.bgSprite && this.audioToggle && this.speedProgToggle && this.dayCycleToggle){
        this.audioToggle?.recalculateTransform(this.bgSprite);
        this.speedProgToggle?.recalculateTransform(this.bgSprite);
        this.dayCycleToggle?.recalculateTransform(this.bgSprite);
    }
  }

  /** 🧩 Carrega textures igual que al MainMenuScene */
  private async loadAssets() {
    const playTexture = await Assets.load(playUrl);
    await document.fonts.load('48px "Minecraft"');

    const cropSize = 15;
    const tile = 16;
    const offsetY = 80;
    const posY = offsetY + tile * 3;

    // 🔹 Botó normal i pressionat
    this.normalTex = new Texture({
        source: playTexture.source,
        frame: new Rectangle(0, posY, cropSize, cropSize),
    });

    this.pressedTex = new Texture({
        source: playTexture.source,
        frame: new Rectangle(16, posY, cropSize, cropSize),
    });

    // 🔹 Sprite decoratiu “settings bg”
    this.settingsBgTex = new Texture({
        source: playTexture.source,
        frame: new Rectangle(101, 166, 60, 85),
    });

    // 🟩 Aquí tries el tros de textura pel toggle ON i OFF
    this.toggleOnTex = new Texture({
        source: playTexture.source,
        frame: new Rectangle(tile * 2, offsetY + tile * 2, 16, 16), // 👉 Ajusta X,Y,W,H com vulguis
    });

    this.toggleOffTex = new Texture({
        source: playTexture.source,
        frame: new Rectangle(0,  offsetY + tile * 3, 16, 16), // 👉 I aquí el frame OFF
    });

    this.createSettingsBg();
    this.createToggles();
    this.createButton();
  }


  private createSettingsBg() {
    if (!this.settingsBgTex) return;

    const screenW = GameManager.I.app.renderer.width;
    const screenH = GameManager.I.app.renderer.height;

    const bgSprite = AssetsManager.I.getSprite("ui", "panelOrange") as Sprite;// new Sprite(this.settingsBgTex);
    bgSprite.rotation = Math.PI/2;
    bgSprite.anchor.set(0.5);
    bgSprite.zIndex = 5;

    const bgWidth = BackgroundManager.I.bgRect.width;

    const targetWidth = bgWidth / 4;
    const scale = targetWidth / bgSprite.width;
    bgSprite.scale.set(scale * 2.4 * 1.4);
    bgSprite.position.set(screenW / 2, screenH / 2.5);

    this.bgSprite = bgSprite;
    this.container.addChild(bgSprite);

    const text = new Text({
      text: "Settings",
      style: {
        fontFamily: "Minecraft",
        fontSize: bgSprite.width / 11,
        fill: 0xffffff,
        stroke: { color: 0x4B1810, width: this.bgSprite.width / 90  },
        align: "center",
        dropShadow: {
          color: 0x4B1810,
          blur: 3,
          distance: 2,
          alpha: 0.5,
          angle: Math.PI / 4,
        },
      },
    });
    text.anchor.set(0.5, 1);
    text.zIndex = 6;
    text.position.set(bgSprite.x, bgSprite.y - (bgSprite.height / 2 * 0.76));

    this.titleText = text;
    this.container.addChild(text);
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

    const start = this.container.alpha;

    TweenManager.I.AddTween(<Tween<Container>>{
    
      waitTime: ms(waitTime),
      duration: ms(duration),
      context: this.container!,
      tweenFunction: function (elapsed) {
        const t = TweenManager.easeOutCubic(elapsed, this.duration);
        const v = start + (target - start) * t;
        this.context.alpha = v;

        if (elapsed >= ms(duration)) onComplete?.();
      }    
    });
  }

}
