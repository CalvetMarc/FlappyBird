import { Container, Sprite, Assets, Texture, Rectangle } from "pixi.js";
import { IScene } from "../managers/SceneManager";
import { SceneManager } from "../managers/SceneManager";
import { BackgroundManager } from "../managers/BackgroundManager";
import logoUrl from "../assets/ui/logoFlappyBird.png";
import playUrl from "../assets/ui/UiCozyFree.png";

export class MainMenuScene implements IScene {
  container = new Container();
  private logo?: Sprite;
  private playButton?: Sprite;
  private settingsButton?: Sprite;
  private rankingButton?: Sprite;

  private playNormalTex?: Texture;
  private playPressedTex?: Texture;
  private rankingTex?: Texture;
  private settingsTex?: Texture;

  private logoBaseW = 0;
  private baseY = 0;
  private elapsed = 0;

  constructor() {
    this.container.sortableChildren = true;
    this.loadAssets();
  }

  private async loadAssets() {
    const [logoTexture, playTexture] = await Promise.all([
      Assets.load(logoUrl),
      Assets.load(playUrl),
    ]);

    this.createLogo(logoTexture);
    this.createButtons(playTexture);
  }

  /** Creates and positions the logo */
  private createLogo(logoTexture: Texture) {
    this.logo = new Sprite(logoTexture);
    this.logoBaseW = this.logo.texture.width;

    const app = SceneManager.I.app;
    const screenW = app.renderer.width;
    const screenH = app.renderer.height;

    const bgSprite = BackgroundManager.I.view.children.find(
      c => c instanceof Sprite
    ) as Sprite | undefined;

    const bgWidth = bgSprite?.width ?? screenW;
    const targetWidth = bgWidth / 3;
    const scale = targetWidth / this.logoBaseW;
    this.logo.scale.set(scale);

    this.logo.anchor.set(0.5);
    this.logo.position.set(screenW / 2, screenH / 5);
    this.baseY = this.logo.position.y;

    this.logo.zIndex = 10;
    this.container.addChild(this.logo);
  }

  /** Creates Play, Settings and Ranking buttons */
  private createButtons(originalTexture: Texture) {
    const cropSize = 15;
    const tile = 16;
    const offsetY = 80;

    // Base row for "Play"
    const playY = offsetY + tile; // original play
    const rankingY = playY + tile * 3;
    const settingsY = playY + tile * 3;
    const settingsX = tile * 2;

    // --- Play button textures ---
    this.playNormalTex = new Texture({
      source: originalTexture.source,
      frame: new Rectangle(0, playY, cropSize, cropSize),
    });

    this.playPressedTex = new Texture({
      source: originalTexture.source,
      frame: new Rectangle(16, playY, cropSize, cropSize),
    });

    // --- Ranking button texture (3 tiles below) ---
    this.rankingTex = new Texture({
      source: originalTexture.source,
      frame: new Rectangle(0, rankingY, cropSize, cropSize),
    });

    // --- Settings button texture (3 down, 2 right) ---
    this.settingsTex = new Texture({
      source: originalTexture.source,
      frame: new Rectangle(settingsX, settingsY, cropSize, cropSize),
    });

    const app = SceneManager.I.app;
    const screenW = app.renderer.width;
    const screenH = app.renderer.height;

    const bgSprite = BackgroundManager.I.view.children.find(
      c => c instanceof Sprite
    ) as Sprite | undefined;
    const bgWidth = bgSprite?.width ?? screenW;
    const targetWidth = bgWidth / 10;

    // Helper to create any button easily
    const makeButton = (
      x: number,
      label: "play" | "settings" | "ranking",
      tex: Texture
    ): Sprite => {
      const btn = new Sprite(tex);
      btn.anchor.set(0.5);
      btn.zIndex = 11;
      const scale = targetWidth / btn.width;
      btn.scale.set(scale);
      btn.position.set(x, screenH / 1.3);
      btn.eventMode = "static";
      btn.cursor = "pointer";

      // Interactions
      btn.on("pointerdown", () => {
        btn.scale.set(scale * 0.9);
        if (label === "play") btn.texture = this.playPressedTex!;
      });

      btn.on("pointerup", () => {
        btn.scale.set(scale);
        if (label === "play") btn.texture = this.playNormalTex!;
        setTimeout(() => SceneManager.I.fire(label), 40);
      });

      btn.on("pointerupoutside", () => {
        btn.scale.set(scale);
        if (label === "play") btn.texture = this.playNormalTex!;
      });

      this.container.addChild(btn);
      return btn;
    };

    // --- Create all buttons ---
    const spacing = targetWidth * 3;
    const centerX = screenW / 2;

    this.settingsButton = makeButton(centerX - spacing, "settings", this.settingsTex);
    this.playButton = makeButton(centerX, "play", this.playNormalTex);
    this.rankingButton = makeButton(centerX + spacing, "ranking", this.rankingTex);
  }

  /** Floating animation for the logo */
  private floatAnimation(dt: number) {
    if (!this.logo) return;

    this.elapsed += dt / 1000;
    const scaleFactor = window.devicePixelRatio || 1;
    const amplitude = 15 / scaleFactor;
    const speed = 1.2;

    const offset = Math.sin(this.elapsed * Math.PI * speed) * amplitude;
    this.logo.position.y = this.baseY + offset;
  }

  /** Handles window resize */
  public onResize(width: number, height: number): void {
    const bgSprite = BackgroundManager.I.view.children.find(
      c => c instanceof Sprite
    ) as Sprite | undefined;
    const bgWidth = bgSprite?.width ?? width;
    const targetWidth = bgWidth / 10;

    // Logo
    if (this.logo && this.logoBaseW > 0) {
      const scale = (bgWidth / 3) / this.logoBaseW;
      this.logo.scale.set(scale);
      this.logo.position.set(width / 2, height / 5);
      this.baseY = this.logo.position.y;
    }

    // Buttons
    const spacing = targetWidth * 3;
    const centerX = width / 2;
    const btnY = height / 1.3;

    const scaleBtns = (btn?: Sprite) => {
      if (!btn) return;
      const s = targetWidth / btn.texture.width;
      btn.scale.set(s);
    };

    scaleBtns(this.settingsButton);
    scaleBtns(this.playButton);
    scaleBtns(this.rankingButton);

    if (this.settingsButton) this.settingsButton.position.set(centerX - spacing, btnY);
    if (this.playButton) this.playButton.position.set(centerX, btnY);
    if (this.rankingButton) this.rankingButton.position.set(centerX + spacing, btnY);
  }

  onStart(): void {}
  update(dt: number): void {
    this.floatAnimation(dt);
  }
  onEnd(): void {}

  destroy(): void {
    this.container.destroy({
      children: true,
      texture: true,
      textureSource: true,
    });
  }
}
