import { Container, Sprite, Assets, Texture, Rectangle } from "pixi.js";
import { IScene } from "../abstractions/IScene";
import { SceneManager } from "../managers/SceneManager";
import { BackgroundManager } from "../managers/BackgroundManager";
import { GameManager } from "../managers/GameManager";
import { TweenManager, Tween } from "../managers/TweenManager";
import { ms } from "../time/TimeUnits";
import logoUrl from "../../assets/ui/logoFlappyBird.png";
import playUrl from "../../assets/ui/UiCozyFree.png";
import birdUrl from "../../assets/birds/AllBird1.png";

export class MainMenuScene implements IScene {
  private logo?: Sprite;
  private playButton?: Sprite;
  private settingsButton?: Sprite;
  private rankingButton?: Sprite;
  private bird?: Sprite;
  private leftButton?: Sprite;
  private rightButton?: Sprite;

  private playNormalTex?: Texture;
  private playPressedTex?: Texture;

  private rankingTex?: Texture;
  private rankingPressedTex?: Texture;

  private settingsTex?: Texture;
  private settingsPressedTex?: Texture;

  private leftTex?: Texture;
  private leftPressedTex?: Texture;

  private rightTex?: Texture;
  private rightPressedTex?: Texture;

  private birdFrames: Texture[] = [];
  private currentBirdIndex = 0;

  private logoBaseW = 0;
  private baseY = 0;
  private elapsed = 0;

  private birdFadeOf: boolean;

  public container: Container;

  constructor() {
    this.container = new Container();
    this.container.sortableChildren = true;
    this.birdFadeOf = true;
  }

  public async onInit(): Promise<void> {
    await this.loadAssets();
  }

  public onEnter(): void {
    this.container.alpha = 0;
    this.birdFadeOf = true;
    this.fadeTo(1, 500, 100);
  }

  public onUpdate(dt: number): void {
    this.floatAnimation(dt);
  }

  public async onExit(): Promise<void> {
    await new Promise<void>((resolve) => {
      let tempBird: Sprite | undefined;
      if (!this.birdFadeOf && this.bird) {
        tempBird = this.bird;
        this.container.removeChild(this.bird);
        GameManager.I.app.stage.addChild(tempBird);
      }

      this.fadeTo(0, 500, 0, () => {
        if (tempBird) {
          GameManager.I.app.stage.removeChild(tempBird);
          this.container.addChild(tempBird);
        }
        resolve();
      });
    });
  }

  public async onDestroy(): Promise<void> {
    this.logo?.destroy();
    this.leftButton?.destroy();
    this.playButton?.destroy();
    this.rightButton?.destroy();
    this.rankingButton?.destroy();
    this.settingsButton?.destroy();

    this.leftTex?.destroy();
    this.leftPressedTex?.destroy();
    this.rightTex?.destroy();
    this.rightPressedTex?.destroy();
    this.rankingTex?.destroy();
    this.rankingPressedTex?.destroy();
    this.settingsTex?.destroy();
    this.settingsPressedTex?.destroy();
    this.playNormalTex?.destroy();
    this.playPressedTex?.destroy();

    this.logo?.destroy();
    this.bird?.destroy();

    for (const t of this.birdFrames) t?.destroy();
  }

  public onResize(width: number, height: number): void {
    const bgWidth = BackgroundManager.I.bgRect.width;
    const targetWidth = bgWidth / 10;

    if (this.logo && this.logoBaseW > 0) {
      const scale = (bgWidth / 3) / this.logoBaseW;
      this.logo.scale.set(scale);
      this.logo.position.set(width / 2, height / 8);
      this.baseY = this.logo.position.y;
    }

    const centerX = width / 2;
    const spacing = targetWidth * 3;
    const btnY = height / 1.3;

    if (this.settingsButton) {
      this.settingsButton.scale.set((BackgroundManager.I.bgRect.width / 10) / 15);
      this.settingsButton.position.set(centerX - spacing, btnY);
    }

    if (this.playButton) {
      this.playButton.scale.set((BackgroundManager.I.bgRect.width / 10) / 15);
      this.playButton.position.set(centerX, btnY);
    }

    if (this.rankingButton) {
      this.rankingButton.scale.set((BackgroundManager.I.bgRect.width / 10) / 15);
      this.rankingButton.position.set(centerX + spacing, btnY);
    }

    if (this.bird) {
      const scale = (BackgroundManager.I.bgRect.width / 10) / 16;
      this.bird.scale.set(scale * 0.7);
      this.bird.position.set(
        BackgroundManager.I.bgRect.x + BackgroundManager.I.bgRect.width / 2,
        BackgroundManager.I.bgRect.height / 1.4
      );
    }

    if (this.leftButton && this.bird) {
      this.leftButton.scale.set((BackgroundManager.I.bgRect.width / 10) / 25);
      this.leftButton.position.set(this.bird.x - this.bird.width * 1.5, this.bird.y);
    }

    if (this.rightButton && this.bird) {
      this.rightButton.scale.set((BackgroundManager.I.bgRect.width / 10) / 25);
      this.rightButton.position.set(this.bird.x + this.bird.width * 1.5, this.bird.y);
    }
  }

  private async loadAssets() {
    const [logoTexture, playTexture, birdTexture] = await Promise.all([
      Assets.load(logoUrl),
      Assets.load(playUrl),
      Assets.load(birdUrl),
    ]);

    this.createLogo(logoTexture);
    this.createButtons(playTexture);
    this.createBird(birdTexture);
    this.createSideButtons(playTexture);

    this.container.alpha = 0;
  }

  private createLogo(logoTexture: Texture) {
    this.logo = new Sprite(logoTexture);
    this.logoBaseW = this.logo.texture.width;

    const screenW = GameManager.I.app.renderer.width;
    const screenH = GameManager.I.app.renderer.height;
    const bgWidth = BackgroundManager.I.bgRect.width;

    const scale = (bgWidth / 3) / this.logoBaseW;
    this.logo.scale.set(scale);

    this.logo.anchor.set(0.5);
    this.logo.position.set(screenW / 2, screenH / 8);
    this.baseY = this.logo.position.y;

    this.logo.zIndex = 10;
    this.container.addChild(this.logo);
  }

  private createBird(originalTexture: Texture) {
    const frameW = 16;
    const frameH = 16;
    const totalFrames = Math.floor(originalTexture.height / frameH);

    for (let i = 0; i < totalFrames; i++) {
      const t = new Texture({
        source: originalTexture.source,
        frame: new Rectangle(0, i * frameH, frameW, frameH),
      });
      this.birdFrames.push(t);
    }

    this.currentBirdIndex = 0;
    this.bird = new Sprite(this.birdFrames[this.currentBirdIndex]);
    this.bird.anchor.set(0.5);
    this.bird.zIndex = 12;

    const bgWidth = BackgroundManager.I.bgRect.width;
    const scale = (bgWidth / 10) / frameW;
    this.bird.scale.set(scale * 0.7);

    this.bird.position.set(
      BackgroundManager.I.bgRect.x + BackgroundManager.I.bgRect.width / 2,
      BackgroundManager.I.bgRect.height / 1.4
    );

    this.container.addChild(this.bird);
  }

  private createButtons(originalTexture: Texture) {
    const cropSize = 15;
    const tile = 16;
    const offsetY = 80;

    const playY = offsetY + tile;
    const rankingY = playY + tile * 3;
    const settingsY = playY + tile * 3;
    const settingsX = tile * 2;

    this.playNormalTex = new Texture({
      source: originalTexture.source,
      frame: new Rectangle(0, playY, cropSize, cropSize),
    });
    this.playPressedTex = new Texture({
      source: originalTexture.source,
      frame: new Rectangle(16, playY, cropSize, cropSize),
    });

    this.rankingTex = new Texture({
      source: originalTexture.source,
      frame: new Rectangle(0, rankingY, cropSize, cropSize),
    });
    this.rankingPressedTex = new Texture({
      source: originalTexture.source,
      frame: new Rectangle(16, rankingY, cropSize, cropSize),
    });

    this.settingsTex = new Texture({
      source: originalTexture.source,
      frame: new Rectangle(settingsX, settingsY, cropSize, cropSize),
    });
    this.settingsPressedTex = new Texture({
      source: originalTexture.source,
      frame: new Rectangle(settingsX + 16, settingsY, cropSize, cropSize),
    });

    const screenW = GameManager.I.app.renderer.width;
    const screenH = GameManager.I.app.renderer.height;

    const makeButton = (
      x: number,
      label: "play" | "settings" | "ranking",
      normal: Texture,
      pressed: Texture
    ): Sprite => {
      const btn = new Sprite(normal);
      btn.anchor.set(0.5);
      btn.zIndex = 11;
      btn.scale.set((BackgroundManager.I.bgRect.width / 10) / 15);
      btn.position.set(x, screenH / 1.3);
      btn.eventMode = "static";
      btn.cursor = "pointer";

      btn.on("pointerdown", () => {
        btn.scale.set((BackgroundManager.I.bgRect.width / 10) / 15 * 0.9);
        btn.texture = pressed;
      });

      btn.on("pointerup", () => {
        btn.scale.set((BackgroundManager.I.bgRect.width / 10) / 15);
        btn.texture = normal;
        this.birdFadeOf = label !== "play";
        setTimeout(() => SceneManager.I.fire(label), 40);
      });

      btn.on("pointerupoutside", () => {
        btn.scale.set((BackgroundManager.I.bgRect.width / 10) / 15);
        btn.texture = normal;
      });

      this.container.addChild(btn);
      return btn;
    };

    const bgWidth = BackgroundManager.I.bgRect.width;
    const targetWidth = bgWidth / 10;
    const spacing = targetWidth * 3;
    const centerX = screenW / 2;

    this.settingsButton = makeButton(centerX - spacing, "settings", this.settingsTex, this.settingsPressedTex);
    this.playButton = makeButton(centerX, "play", this.playNormalTex, this.playPressedTex);
    this.rankingButton = makeButton(centerX + spacing, "ranking", this.rankingTex, this.rankingPressedTex);

    if (this.bird && this.playButton)
      this.bird.position.set(this.playButton.x, this.playButton.y - this.playButton.height * 1.7);
  }

  private createSideButtons(originalTexture: Texture) {
    const cropSize = 15;
    const tile = 16;
    const offsetY = 80;

    const leftFrame = new Rectangle(tile * 2, offsetY + tile * 3, cropSize, cropSize);
    const rightFrame = new Rectangle(0, offsetY + tile * 2, cropSize, cropSize);

    this.leftTex = new Texture({ source: originalTexture.source, frame: leftFrame });
    this.leftPressedTex = new Texture({
      source: originalTexture.source,
      frame: new Rectangle(leftFrame.x + 16, leftFrame.y, cropSize, cropSize),
    });

    this.rightTex = new Texture({ source: originalTexture.source, frame: rightFrame });
    this.rightPressedTex = new Texture({
      source: originalTexture.source,
      frame: new Rectangle(rightFrame.x + 16, rightFrame.y, cropSize, cropSize),
    });

    const makeButton = (
      normal: Texture,
      pressed: Texture,
      onClick: () => void
    ): Sprite => {
      const btn = new Sprite(normal);
      btn.anchor.set(0.5);
      btn.zIndex = 11;
      btn.scale.set((BackgroundManager.I.bgRect.width / 10) / 25);
      btn.eventMode = "static";
      btn.cursor = "pointer";

      btn.on("pointerdown", () => {
        btn.scale.set((BackgroundManager.I.bgRect.width / 10) / 30);
        btn.texture = pressed;
      });

      btn.on("pointerup", () => {
        btn.scale.set((BackgroundManager.I.bgRect.width / 10) / 25);
        btn.texture = normal;
        onClick();
      });

      btn.on("pointerupoutside", () => {
        btn.scale.set((BackgroundManager.I.bgRect.width / 10) / 25);
        btn.texture = normal;
      });

      this.container.addChild(btn);
      return btn;
    };

    const prevBird = () => {
      if (!this.birdFrames.length || !this.bird) return;
      this.currentBirdIndex =
        (this.currentBirdIndex - 1 + this.birdFrames.length) %
        this.birdFrames.length;
      SceneManager.I.playerIndex = this.currentBirdIndex;
      this.bird.texture = this.birdFrames[this.currentBirdIndex];
    };

    const nextBird = () => {
      if (!this.birdFrames.length || !this.bird) return;
      this.currentBirdIndex = (this.currentBirdIndex + 1) % this.birdFrames.length;
      SceneManager.I.playerIndex = this.currentBirdIndex;
      this.bird.texture = this.birdFrames[this.currentBirdIndex];
    };

    this.leftButton = makeButton(this.leftTex, this.leftPressedTex, prevBird);
    this.rightButton = makeButton(this.rightTex, this.rightPressedTex, nextBird);

    if (this.bird) {
      const y = this.bird.y;
      const dist = this.bird.width * 1.5;
      this.leftButton.position.set(this.bird.x - dist, y);
      this.rightButton.position.set(this.bird.x + dist, y);
    }
  }

  private floatAnimation(dt: number) {
    if (!this.logo) return;
    this.elapsed += dt / 1000;

    const bgHeight = BackgroundManager.I.bgRect.height;
    const amplitude = bgHeight * 0.015;
    const speed = 1.2;

    const offset = Math.sin(this.elapsed * Math.PI * speed) * amplitude;
    this.logo.position.y = this.baseY + offset;
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
      },
    });
  }
}
