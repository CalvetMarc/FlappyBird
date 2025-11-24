import { Application, Container, Sprite, Texture, Rectangle, Assets, Bounds, ObservablePoint, Size } from "pixi.js";
import { LAYERS } from "../../abstractions/IScene";
import { SceneManager } from "../../managers/SceneManager";
import { GameManager } from "../../managers/GameManager";
import { IGameObject } from "../../abstractions/IGameObject";
import { Milliseconds } from "../../time/TimeUnits";
import { LayoutManager } from "../../managers/LayoutManager";
import { AssetsManager } from "../../managers/AssetsManager";

const sensitivity = 1.7;  

export class CharacterController implements IGameObject{
  private bird!: Sprite;  
  private currentFrame = 0;
  private frameTimer = 0;
  private frameInterval = 100;

  private velocityY = 0;
  private gravity = 2.4;
  private jumpForce = -0.75;

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
    console.log(this.isDead);
    const delta = dt / 1000;

    this.frameTimer += dt;
    if (!this.isDead && this.frameTimer >= this.frameInterval) {
      this.frameTimer = 0;
      this.currentFrame = (this.currentFrame + 1) % AssetsManager.I.getFrameCount("bird" + (SceneManager.I.playerIndex + 1).toString());
      this.bird = AssetsManager.I.getSprite("bird" + (SceneManager.I.playerIndex + 1).toString(), this.currentFrame, this.bird);
    }

    if (!this.isDead || (this.isDead && !this.deadGrounded)) {
      this.velocityY += this.gravity * delta * (LayoutManager.I.layoutCurrentSize.width / LayoutManager.I.layoutScale.x);
      this.bird.y += this.velocityY * delta;
    }

    const maxFall = Math.PI / 2;
    const minUp = -Math.PI / 6;


    if (!this.isDead) {
        const rot = (this.velocityY / (LayoutManager.I.layoutCurrentSize.width / LayoutManager.I.layoutScale.x)) * sensitivity;
        this.bird.rotation = Math.max(minUp, Math.min(rot, maxFall));
    }

    else if (!this.deadGrounded) {
        const fallRotateSpeed = 0.02; 
        this.bird.rotation = Math.min(this.bird.rotation + fallRotateSpeed, maxFall);
    }
  }

  public async onDestroy(): Promise<void> {
    window.removeEventListener("pointerdown", this.handleInput);
    window.removeEventListener("keydown", this.handleKey);

    this.bird?.destroy({ texture: true, textureSource: true });
    this.container.destroy({ children: true, texture: true, textureSource: true });
  }

  public get birdBounds(): Bounds {
    const bounds: Bounds = new Bounds(this.bird.x - (this.bird.width * 0.5), this.bird.y - (this.bird.height * 0.5), this.bird.x + (this.bird.width * 0.5), this.bird.y + (this.bird.height * 0.5));
    return bounds;
  }

  public kill() {
    if (this.isDead) return;
    this.isDead = true;
    GameManager.I.backgroundController.setScrolling(false);
  }

  public groundTouched(rect: Bounds) {
    if (!this.bird) return;

    this.velocityY = 0;
    this.gravity = 0;

    const b = this.birdBounds;
    if (b) {
      const offset = b.maxY - rect.minY;
      if (offset > 0) this.bird.y -= offset;
    }

    if (!this.isDead) this.kill();
    this.deadGrounded = true;
  } 

  private async loadBird() {
    this.bird = AssetsManager.I.getSprite("bird" + (SceneManager.I.playerIndex + 1).toString(), 0);
    this.bird.anchor.set(0.5);
    this.bird.zIndex = 12;

    this.bird.position = {x: LayoutManager.I.layoutVirtualSize.width * 0.5, y: LayoutManager.I.layoutVirtualSize.height * 0.614};
    this.bird.scale.set(LayoutManager.I.layoutVirtualSize.width * 0.0044);

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

    this.velocityY = this.jumpForce * (LayoutManager.I.layoutCurrentSize.width / LayoutManager.I.layoutScale.x);
    this.bird.rotation = -Math.PI / 6;
  }
}
