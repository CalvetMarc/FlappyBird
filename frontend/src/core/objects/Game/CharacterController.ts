import { Application, Container, Sprite, Texture, Rectangle, Assets, Bounds, ObservablePoint, Size } from "pixi.js";
import { LAYERS } from "../../abstractions/IScene";
import { SceneManager } from "../../managers/SceneManager";
import { GameManager } from "../../managers/GameManager";
import { IGameObject } from "../../abstractions/IGameObject";
import { Milliseconds } from "../../time/TimeUnits";
import { LayoutManager } from "../../managers/LayoutManager";
import { AssetsManager } from "../../managers/AssetsManager";
import { sound } from "@pixi/sound";

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

  private elapsed: number = 0;
  private lastInputTime: number = 0;
  private canSwoosh = true;

  public container: Container;
  public detectInputs: boolean = false;

  public constructor() {
    this.container = new Container();
    this.container.sortableChildren = true;
    this.container.zIndex = LAYERS.PLAYER;
  }

  public async onCreate() {
    this.loadBird();
    window.addEventListener("pointerdown", this.handleInput);
    window.addEventListener("keydown", this.handleKey);
    this.detectInputs = false;
  }

  public onUpdate(dt: Milliseconds) {
    const delta = dt / 1000;
    this.elapsed += delta;

    if (!this.bird) return;

    if(this.canSwoosh && this.elapsed - this.lastInputTime >= 0.9){
      sound.play("swoosh");
      this.canSwoosh = false;
    }

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
        const fallRotateSpeed = (LayoutManager.I.layoutCurrentSize.width / LayoutManager.I.layoutScale.x) * 0.00005; //0.02
        this.bird.rotation = Math.min(this.bird.rotation + fallRotateSpeed, maxFall);
    }
  }

  public async onDestroy(): Promise<void> {
    window.removeEventListener("pointerdown", this.handleInput);
    window.removeEventListener("keydown", this.handleKey);

    this.bird.removeFromParent();
    AssetsManager.I.releaseSprite(this.bird);
    AssetsManager.I.removeSpriteReference("player");
  }

  public get birdBounds(): Bounds {
    const bounds: Bounds = new Bounds(this.bird.x - (this.bird.width * 0.5), this.bird.y - (this.bird.height * 0.5), this.bird.x + (this.bird.width * 0.5), this.bird.y + (this.bird.height * 0.5));
    return bounds;
  }

  public kill() {
    if (this.isDead) return;

    if(GameManager.I.settings.audioEnabled){
      sound.play("hit");  
    }

    this.isDead = true;
    GameManager.I.backgroundController.setScrolling(false);
  }

  public groundTouched(rect: Bounds) {
    if (!this.bird) return;

    if(GameManager.I.settings.audioEnabled){
      sound.play("hit");  
      setTimeout(() => {
        sound.play("die"); 
      }, 500);
    }
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

  public get isAlive(): boolean{
    return !this.isDead;
  }

  private loadBird() {
    this.bird = AssetsManager.I.getSpriteFromReference("player");
    if(this.bird){
      this.bird.removeFromParent();
    }
    else{
      this.bird = AssetsManager.I.getSprite("bird" + (SceneManager.I.playerIndex + 1).toString(), 0);
      this.bird.anchor.set(0.5);
      this.bird.zIndex = 12;

      this.bird.position = {x: LayoutManager.I.layoutVirtualSize.width * 0.5, y: LayoutManager.I.layoutVirtualSize.height * 0.614};
      const scale = LayoutManager.I.layoutVirtualSize.width * 0.0044;
      this.bird.scale.set(scale);
    }
    this.container.addChild(this.bird);
  }

  private handleInput = () => {
    if (this.detectInputs && !this.isDead) this.flap();
  };

  private handleKey = (e: KeyboardEvent) => {
    if (this.detectInputs && e.code === "Space" && !this.isDead) {
      e.preventDefault();
      this.flap();
    }
  };

  private flap() {
    if (!this.bird) return;

    this.lastInputTime = this.elapsed;
    this.canSwoosh = true;

    if(GameManager.I.settings.audioEnabled){
      setTimeout(() => {
        sound.play("flap");
      }, 50);
    }
    this.velocityY = this.jumpForce * (LayoutManager.I.layoutCurrentSize.width / LayoutManager.I.layoutScale.x);
    this.bird.rotation = -Math.PI / 6;
  }
}
