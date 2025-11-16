import { Application, Container, Sprite, Texture, Rectangle, Assets, Bounds, ObservablePoint, Size } from "pixi.js";
import { LAYERS } from "../../abstractions/IScene";
import { BackgroundManager } from "../../managers/BackgroundManager";
import { SceneManager } from "../../managers/SceneManager";
import { GameManager } from "../../managers/GameManager";
import { IGameObject } from "../../abstractions/IGameObject";
import { Milliseconds } from "../../time/TimeUnits";
import birdUrl from "../../../../public/assets/birds/AllBird1.png"

export class CharacterController implements IGameObject{
  private bird?: Sprite;
  private birdFrames: Texture[] = [];
  private currentFrame = 0;
  private frameTimer = 0;
  private frameInterval = 100;

  private velocityY = 0;
  private gravity = 2;
  private jumpForce = -0.65;

  private isDead = false;
  private deadGrounded = false;

  private lastBgSize: Size;

  public container: Container;

  public constructor() {
    this.container = new Container();
    this.container.sortableChildren = true;
    this.container.zIndex = LAYERS.PLAYER;
    this.lastBgSize = { width: BackgroundManager.I.bgRect.width, height: BackgroundManager.I.bgRect.height};
  }

  public async onCreate() {
    await this.loadBird();
    window.addEventListener("pointerdown", this.handleInput);
    window.addEventListener("keydown", this.handleKey);
  }

  public onUpdate(dt: Milliseconds) {
    if (!this.bird) return;

    const delta = dt / 1000;

    this.frameTimer += dt;
    if (!this.isDead && this.frameTimer >= this.frameInterval) {
      this.frameTimer = 0;
      this.currentFrame = (this.currentFrame + 1) % this.birdFrames.length;
      this.bird.texture = this.birdFrames[this.currentFrame];
    }

    if (!this.isDead || (this.isDead && !this.deadGrounded)) {
      this.velocityY += this.gravity * delta * BackgroundManager.I.bgRect.height;
      this.bird.y += this.velocityY * delta;
    }

    const maxFall = Math.PI / 2;
    const minUp = -Math.PI / 6;

    if (!this.isDead) {
      this.bird.rotation = Math.max(minUp, Math.min(this.velocityY / 400, maxFall));
    } else if (!this.deadGrounded) {
      this.bird.rotation = Math.min(this.bird.rotation + 0.05, maxFall);
    }

    this.lastBgSize = { width: BackgroundManager.I.bgRect.width, height: BackgroundManager.I.bgRect.height};
  }

  public async onDestroy(): Promise<void> {
    window.removeEventListener("pointerdown", this.handleInput);
    window.removeEventListener("keydown", this.handleKey);

    this.bird?.destroy({ texture: true, textureSource: true });
    this.container.destroy({ children: true, texture: true, textureSource: true });
  }

  public onResize(w: number, h: number) {
    if (!this.bird) return;
    const frameW = 16;
    const targetWidth = BackgroundManager.I.bgRect.width / 10;
    const scale = targetWidth / frameW;

    const lastRelativePositionY: number =  this.bird.position.y - BackgroundManager.I.bgRect.y;
    const normalizedRelativePositionY: number = lastRelativePositionY / this.lastBgSize.height;

    const newPosition: ObservablePoint = { x: BackgroundManager.I.bgRect.x + BackgroundManager.I.bgRect.width / 2, y: BackgroundManager.I.bgRect.y + BackgroundManager.I.bgRect.height * normalizedRelativePositionY} as ObservablePoint;
    this.bird.position.set(newPosition.x, newPosition.y);

    this.bird.scale.set(scale * 0.7);

  }

  public get birdBounds(): Rectangle | undefined {
    if (!this.bird) 
      return;
    
    const bounds = this.bird.getBounds();
    const r = new Rectangle(bounds.x, bounds.y, bounds.width, bounds.height);

    const pad = 6;
    r.x += pad;
    r.y += pad;
    r.width -= pad * 2;
    r.height -= pad * 2;
    return r;
  }

  public kill() {
    if (this.isDead) return;
    this.isDead = true;
    BackgroundManager.I.setScrolling(false);
  }

  public groundTouched(rect: Rectangle) {
    if (!this.bird) return;

    this.velocityY = 0;
    this.gravity = 0;

    const b = this.birdBounds;
    if (b) {
      const offset = b.y + b.height - rect.y;
      if (offset > 0) this.bird.y -= offset;
    }

    if (!this.isDead) this.kill();
    this.deadGrounded = true;
  } 

  private async loadBird() {
    const birdTexture = await Assets.load(birdUrl);

    const frameW = 16;
    const frameH = 16;
    const total = 4;

    const idx = SceneManager.I.playerIndex ?? 0;
    const yOffset = idx * frameH;

    for (let i = 0; i < total; i++) {
      const tex = new Texture({
        source: birdTexture.source,
        frame: new Rectangle(i * frameW, yOffset, frameW, frameH),
      });
      this.birdFrames.push(tex);
    }

    this.bird = new Sprite(this.birdFrames[0]);
    this.bird.anchor.set(0.5);
    this.bird.zIndex = 100;

    const screenW = GameManager.I.app.renderer.width;
    const screenH = GameManager.I.app.renderer.height;

    const targetWidth = BackgroundManager.I.bgRect.width / 10;
    const scale = targetWidth / frameW;

    this.bird.scale.set(scale * 0.7);
    this.bird.position.set(screenW / 2, screenH / 1.7);

    this.container.addChild(this.bird);
  }

  private handleInput = () => {
    if (!this.isDead) this.flap();
  };

  private handleKey = (e: KeyboardEvent) => {
    if (e.code === "Space" && !this.isDead) {
      e.preventDefault();
      this.flap();
    }
  };

  private flap() {
    if (!this.bird) return;
    this.velocityY = BackgroundManager.I.bgRect.height * this.jumpForce;
    this.bird.rotation = -Math.PI / 6;
  }
}
