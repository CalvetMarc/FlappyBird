import { Application, Container, Sprite, Texture, Rectangle, Assets, Bounds, ObservablePoint, Size } from "pixi.js";
import { LAYERS } from "../../abstractions/IScene";
import { SceneManager } from "../../managers/SceneManager";
import { GameManager } from "../../managers/GameManager";
import { IGameObject } from "../../abstractions/IGameObject";
import { Milliseconds } from "../../time/TimeUnits";
import { LayoutManager } from "../../managers/LayoutManager";
import { AssetsManager } from "../../managers/AssetsManager";

export class CharacterController implements IGameObject{
  private bird!: Sprite;
  private birdFrames: Texture[] = [];
  private currentFrame = 0;
  private frameTimer = 0;
  private frameInterval = 100;

  private velocityY = 0;
  private gravity = 2;
  private jumpForce = -0.65;

  private isDead = false;
  private deadGrounded = false;

  public container: Container;

  public constructor() {
    this.container = new Container();
    this.container.sortableChildren = true;
    this.container.zIndex = LAYERS.PLAYER;
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
      this.velocityY += this.gravity * delta * LayoutManager.I.layoutSize.height;
      this.bird.y += this.velocityY * delta;
    }

    const maxFall = Math.PI / 2;
    const minUp = -Math.PI / 6;

    if (!this.isDead) {
      this.bird.rotation = Math.max(minUp, Math.min(this.velocityY / 400, maxFall));
    } else if (!this.deadGrounded) {
      this.bird.rotation = Math.min(this.bird.rotation + 0.05, maxFall);
    }
  }

  public async onDestroy(): Promise<void> {
    window.removeEventListener("pointerdown", this.handleInput);
    window.removeEventListener("keydown", this.handleKey);

    this.bird?.destroy({ texture: true, textureSource: true });
    this.container.destroy({ children: true, texture: true, textureSource: true });
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
    GameManager.I.backgroundController.setScrolling(false);
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
    this.bird = AssetsManager.I.getSprite("bird" + (SceneManager.I.playerIndex + 1).toString(), 0);
    this.bird.anchor.set(0.5);
    this.bird.zIndex = 12;

    this.bird.position = {x: LayoutManager.I.layoutSize.width * 0.5, y: LayoutManager.I.layoutSize.height * 0.614};
    this.bird.scale.set(LayoutManager.I.layoutSize.width * 0.0044);

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

    this.velocityY = LayoutManager.I.layoutSize.height * this.jumpForce;
    this.bird.rotation = -Math.PI / 6;
  }
}
