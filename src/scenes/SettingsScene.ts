import { Container, Sprite, Texture, Assets, Rectangle, Text } from "pixi.js";
import { IScene } from "../managers/SceneManager";
import { SceneManager } from "../managers/SceneManager";
import { BackgroundManager } from "../managers/BackgroundManager";
import playUrl from "../assets/ui/UiCozyFree.png";

/* 🟩 Classe auxiliar per a un toggle simple */
/* 🟩 Classe auxiliar per a un toggle simple */
/* 🟩 Classe auxiliar per a un toggle simple — versió nítida */
/* 🟩 Classe auxiliar per a un toggle simple */
class ToggleSwitch extends Container {
  private onTex: Texture;
  private offTex: Texture;
  private state: boolean;
  private knob: Sprite;
  private labelText: Text;

  constructor(label: string, onTex: Texture, offTex: Texture, initial: boolean) {
    super();
    this.onTex = onTex;
    this.offTex = offTex;
    this.state = initial;

    // 🔤 Text gran i nítid
    this.labelText = new Text(label, {
      fontFamily: "Minecraft",
      fontSize: 34,
      fill: 0xffffff,
      stroke: { color: 0x4B1810, width: 5 },
      align: "left",
    });
    this.labelText.anchor.set(0, 0.5);

    // 🔘 Sprite del toggle (ON/OFF)
    this.knob = new Sprite(this.state ? this.onTex : this.offTex);
    this.knob.anchor.set(0.5);
    this.knob.width = 32;
    this.knob.height = 32;
    this.knob.eventMode = "static";
    this.knob.cursor = "pointer";
    this.knob.on("pointerdown", () => this.toggle());

    this.addChild(this.labelText, this.knob);
    this.layout();
  }

  private layout() {
    const spacing = 20;
    this.labelText.position.set(0, 0);

    // Centrat verticalment amb el text
    const knobX = this.labelText.width + spacing + this.knob.width / 2;
    this.knob.position.set(knobX, 0);
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
}



/* ─────────────────────────────────────────────────────────────────────── */

export class SettingsScene implements IScene {
  container = new Container();

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

  constructor() {
    this.container.sortableChildren = true;
    this.loadAssets();
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

    const app = SceneManager.I.app;
    const screenW = app.renderer.width;
    const screenH = app.renderer.height;

    const bgSprite = new Sprite(this.settingsBgTex);
    bgSprite.anchor.set(0.5);
    bgSprite.zIndex = 5;

    const bg = BackgroundManager.I.view.children.find(
      c => c instanceof Sprite
    ) as Sprite | undefined;

    const bgWidth = bg?.width ?? screenW;
    const targetWidth = bgWidth / 4;
    const scale = targetWidth / bgSprite.width;
    bgSprite.scale.set(scale * 2.4);
    bgSprite.position.set(screenW / 2, screenH / 2.5);

    this.bgSprite = bgSprite;
    this.container.addChild(bgSprite);

    const text = new Text({
      text: "Settings",
      style: {
        fontFamily: "Minecraft",
        fontSize: 40,
        fill: 0xffffff,
        stroke: { color: 0x4B1810, width: 5 },
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

    this.audioToggle = new ToggleSwitch("Audio", this.toggleOnTex, this.toggleOffTex, true);
    this.dayCycleToggle = new ToggleSwitch("Day Cycle", this.toggleOnTex, this.toggleOffTex, true);
    this.speedProgToggle = new ToggleSwitch("Speed Progression", this.toggleOnTex, this.toggleOffTex, false);

    this.audioToggle.zIndex = 7;
    this.dayCycleToggle.zIndex = 7;
    this.speedProgToggle.zIndex = 7;

    this.container.addChild(this.audioToggle, this.dayCycleToggle, this.speedProgToggle);
    this.layoutToggles();
  }

  /* 🟩 Posicionament dins del fons */
  private layoutToggles() {
    if (!this.bgSprite || !this.audioToggle || !this.dayCycleToggle || !this.speedProgToggle) return;

    const bg = this.bgSprite;
    const startY = bg.y - bg.height / 4; // una mica per sota del top
    const spacing = 80;
    const centerX = bg.x - bg.width / 2.65; // una mica cap a l'esquerra

    this.audioToggle.position.set(centerX, startY);
    this.dayCycleToggle.position.set(centerX, startY + spacing);
    this.speedProgToggle.position.set(centerX, startY + spacing * 2);
  }

  private createButton() {
    if (!this.normalTex || !this.pressedTex) return;

    const app = SceneManager.I.app;
    const screenW = app.renderer.width;
    const screenH = app.renderer.height;

    const bgSprite = BackgroundManager.I.view.children.find(
      c => c instanceof Sprite
    ) as Sprite | undefined;

    const bgWidth = bgSprite?.width ?? screenW;
    const targetWidth = bgWidth / 10;

    const btn = new Sprite(this.normalTex);
    btn.anchor.set(0.5);
    btn.zIndex = 10;
    const scale = targetWidth / btn.width;
    btn.scale.set(scale);
    btn.position.set(screenW / 2, screenH / 1.3);
    btn.eventMode = "static";
    btn.cursor = "pointer";

    btn.on("pointerdown", () => {
      btn.scale.set(scale * 0.9);
      btn.texture = this.pressedTex!;
    });

    btn.on("pointerup", () => {
      btn.scale.set(scale);
      btn.texture = this.normalTex!;
      setTimeout(() => SceneManager.I.fire("menu"), 80);
    });

    btn.on("pointerupoutside", () => {
      btn.scale.set(scale);
      btn.texture = this.normalTex!;
    });

    this.baseY = btn.y;
    this.container.addChild(btn);
    this.button = btn;
  }

  private fade(targetAlpha: number, duration: number, onComplete?: () => void) {
    const startAlpha = this.container.alpha;
    const startTime = performance.now();

    const animate = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      this.container.alpha = startAlpha + (targetAlpha - startAlpha) * t;
      if (t < 1) requestAnimationFrame(animate);
      else {
        this.container.alpha = targetAlpha;
        onComplete?.();
      }
    };
    requestAnimationFrame(animate);
  }

  onStart(): void {
    this.container.alpha = 0;
    setTimeout(() => this.fade(1, 500), 100);
  }

  async onEnd(): Promise<void> {
    await new Promise<void>((resolve) => {
      this.fade(0, 400, () => {
        SceneManager.I.app.stage.removeChild(this.container);
        resolve();
      });
    });
  }

  public onResize(width: number, height: number): void {
    const bg = BackgroundManager.I.view.children.find(
      c => c instanceof Sprite
    ) as Sprite | undefined;

    const bgWidth = bg?.width ?? width;

    if (this.button) {
      const targetWidth = bgWidth / 10;
      const scale = targetWidth / this.button.texture.width;
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
      this.titleText.position.set(
        this.bgSprite.x,
        this.bgSprite.y - (this.bgSprite.height * this.bgSprite.scale.y) / 2 - 10
      );
    }

    /* 🟩 Reposiciona els toggles al canviar mida */
    this.layoutToggles();
  }

  destroy(): void {
    this.container.destroy({
      children: true,
      texture: true,
      textureSource: true,
    });
  }

  update(dt: number): void {}
}
