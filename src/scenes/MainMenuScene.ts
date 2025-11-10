import { Container, Sprite, Assets } from "pixi.js";
import { IScene } from "../managers/SceneManager";
import { SceneManager } from "../managers/SceneManager";
import { BackgroundManager } from "../managers/BackgroundManager";
import logoUrl from "../assets/ui/logoFlappyBird.png";

export class MainMenuScene implements IScene {
  container = new Container();
  private logo?: Sprite;
  private logoBaseW = 0; // Original logo texture width (unscaled)
  private baseY = 0;     // Base Y position for floating animation
  private elapsed = 0;   // Accumulated time for smooth animation

  constructor() {
    this.container.sortableChildren = true;
    this.loadLogo();
  }

  /** Loads the logo and positions it on screen */
  private async loadLogo() {
    // Load texture
    const logoTexture = await Assets.load(logoUrl);
    this.logo = new Sprite(logoTexture);

    // Store original width (for proper scaling on resize)
    this.logoBaseW = this.logo.texture.width;

    const app = SceneManager.I.app;
    const screenW = app.renderer.width;
    const screenH = app.renderer.height;

    // Try to match the logo scale to the background width
    const bgSprite = BackgroundManager.I.view.children.find(
      c => c instanceof Sprite
    ) as Sprite | undefined;

    const bgWidth = bgSprite?.width ?? screenW;

    // Scale the logo to 1/3 of the background width
    const targetWidth = bgWidth / 3;
    const scale = targetWidth / this.logoBaseW;
    this.logo.scale.set(scale);

    // Center the logo horizontally and place it slightly above the middle
    this.logo.anchor.set(0.5);
    this.logo.position.set(screenW / 2, screenH / 5);

    // Save the base Y position for the float animation
    this.baseY = this.logo.position.y;

    // Ensure the logo is drawn above the background
    this.logo.zIndex = 10;

    // Add to the scene container
    this.container.addChild(this.logo);
  }

  /** Floating animation with a smooth ease-in-out sine motion */
  private floatAnimation(dt: number) {
    if (!this.logo) return;

    // Accumulate time (convert dt from ms to seconds)
    this.elapsed += dt / 1000;

    // Adjust animation amplitude for device pixel ratio (keeps motion consistent across displays)
    const scaleFactor = window.devicePixelRatio || 1;
    const amplitude = 15 / scaleFactor; // How far it moves up/down (in px)
    const speed = 1.2; // How many full cycles per second

    // Smooth up-down movement using a sine wave (ease-in-out style)
    const offset = Math.sin(this.elapsed * Math.PI * speed) * amplitude;

    // Apply the offset to the base Y position
    this.logo.position.y = this.baseY + offset;
  }

  /** Handles window resize: rescales and repositions the logo */
  public onResize(width: number, height: number): void {
    if (!this.logo || !this.logo.texture || this.logoBaseW === 0) return;

    const bgSprite = BackgroundManager.I.view.children.find(
      c => c instanceof Sprite
    ) as Sprite | undefined;

    const bgWidth = bgSprite?.width ?? width;

    // Recalculate scale based on background width
    const targetWidth = bgWidth / 3;
    const scale = targetWidth / this.logoBaseW;
    this.logo.scale.set(scale);

    // Keep it horizontally centered and vertically at 1/5 of the screen height
    this.logo.position.set(width / 2, height / 5);

    // Update base position for the floating animation
    this.baseY = this.logo.position.y;
  }

  /** Called once when the scene starts */
  onStart(): void {}

  /** Called every frame; drives the animation */
  update(dt: number): void {
    this.floatAnimation(dt);
  }

  /** Called when the scene ends */
  onEnd(): void {}

  /** Cleanly destroys the scene and its resources */
  destroy(): void {
    this.container.destroy({
      children: true,
      texture: true,
      textureSource: true,
    });
  }
}
