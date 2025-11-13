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
  private settingsTex?: Texture;
  private leftTex?: Texture;
  private rightTex?: Texture;

  private birdFrames: Texture[] = [];
  private currentBirdIndex = 0;

  private logoBaseW = 0;
  private baseY = 0;
  private elapsed = 0;

  private birdFadeOf: boolean;

  public container;

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
      // 🟩 Si birdFadeOff és false, traiem l’ocell abans del fade
      let tempBird: Sprite | undefined;
      if (!this.birdFadeOf && this.bird) {
        tempBird = this.bird;
        this.container.removeChild(this.bird);
        GameManager.I.app.stage.addChild(tempBird); // mantenim-lo visible a l'escenari
      }

      this.fadeTo(0, 500, 0, () => {
        // 🔹 Si havíem separat l’ocell, el tornem a posar al container
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
    this.rightTex?.destroy();
    this.rankingTex?.destroy();
    this.settingsTex?.destroy();
    this.playNormalTex?.destroy();
    this.playPressedTex?.destroy();

    this.logo?.destroy();
    this.bird?.destroy();

    for(const texture of this.birdFrames){
      texture?.destroy();
    }
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

    const spacing = targetWidth * 3;
    const centerX = width / 2;
    const btnY = height / 1.3;

    const rescale = (mult: number, btn?: Sprite) => {
      if (!btn) return;
      const s = targetWidth / btn.texture.width;
      btn.scale.set(s * mult);
    };

    rescale(1, this.settingsButton);
    rescale(1, this.playButton);
    rescale(1, this.rankingButton);
    rescale(0.7, this.bird);
    rescale(0.5, this.leftButton);
    rescale(0.5, this.rightButton);

    if (this.settingsButton) this.settingsButton.position.set(centerX - spacing, btnY);
    if (this.playButton) this.playButton.position.set(centerX, btnY);
    if (this.rankingButton) this.rankingButton.position.set(centerX + spacing, btnY);

    if (this.bird && this.playButton)
      this.bird.position.set(BackgroundManager.I.bgRect.x + (BackgroundManager.I.bgRect.width / 2), BackgroundManager.I.bgRect.height / 1.4);

    if (this.leftButton && this.bird)
      this.leftButton.position.set(this.bird.x - this.bird.width * 1.5, this.bird.y);

    if (this.rightButton && this.bird)
      this.rightButton.position.set(this.bird.x + this.bird.width * 1.5, this.bird.y);
  }  

  private async loadAssets() {
    const [logoTexture, playTexture, birdTexture] = await Promise.all([Assets.load(logoUrl), Assets.load(playUrl), Assets.load(birdUrl)]);

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
    const targetWidth = bgWidth / 3;
    const scale = targetWidth / this.logoBaseW;
    this.logo.scale.set(scale);

    this.logo.anchor.set(0.5);
    this.logo.position.set(screenW / 2, screenH / 8);
    this.baseY = this.logo.position.y;

    this.logo.zIndex = 10;
    this.container.addChild(this.logo);
  }

  /** 🐦 Crea totes les variants de l’ocell i mostra la primera */
  private createBird(originalTexture: Texture) {
    const frameW = 16;
    const frameH = 16;
    const totalFrames = Math.floor(originalTexture.height / frameH);

    for (let i = 0; i < totalFrames; i++) {
      const tex = new Texture({
        source: originalTexture.source,
        frame: new Rectangle(0, i * frameH, frameW, frameH),
      });
      this.birdFrames.push(tex);
    }

    this.currentBirdIndex = 0;
    this.bird = new Sprite(this.birdFrames[this.currentBirdIndex]);
    this.bird.anchor.set(0.5);
    this.bird.zIndex = 12;

    const screenW = GameManager.I.app.renderer.width;
    const screenH =  GameManager.I.app.renderer.height;
    const bgWidth = BackgroundManager.I.bgRect.width;

    const targetWidth = bgWidth / 10;
    const scale = targetWidth / frameW;
    this.bird.scale.set(scale * 0.7);

    this.bird.position.set(BackgroundManager.I.bgRect.x + (BackgroundManager.I.bgRect.width / 2), BackgroundManager.I.bgRect.height / 1.4);
    this.container.addChild(this.bird);
  }

  /** 🎯 Botons del menú principal */
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

    this.settingsTex = new Texture({
      source: originalTexture.source,
      frame: new Rectangle(settingsX, settingsY, cropSize, cropSize),
    });

    const screenW = GameManager.I.app.renderer.width;
    const screenH = GameManager.I.app.renderer.height;

    const bgWidth = BackgroundManager.I.bgRect.width;
    const targetWidth = bgWidth / 10;

    const makeButton = (x: number, label: "play" | "settings" | "ranking", tex: Texture): Sprite => {
      const btn = new Sprite(tex);
      btn.anchor.set(0.5);
      btn.zIndex = 11;
      btn.scale.set((BackgroundManager.I.bgRect.width / 10) / 15);
      btn.position.set(x, screenH / 1.3);
      btn.eventMode = "static";
      btn.cursor = "pointer";

      btn.on("pointerdown", () => {
        btn.scale.set((BackgroundManager.I.bgRect.width / 10) / 15 * 0.9);
        if (label === "play") btn.texture = this.playPressedTex!;
      });
      btn.on("pointerup", () => {
        btn.scale.set((BackgroundManager.I.bgRect.width / 10) / 15);
        if (label === "play") btn.texture = this.playNormalTex!;
        this.birdFadeOf = label !== "play";
        setTimeout(() => SceneManager.I.fire(label), 40);
      });
      btn.on("pointerupoutside", () => {
        btn.scale.set((BackgroundManager.I.bgRect.width / 10) / 15);
        if (label === "play") btn.texture = this.playNormalTex!;
      });

      this.container.addChild(btn);
      return btn;
    };

    const spacing = targetWidth * 3;
    const centerX = screenW / 2;
    this.settingsButton = makeButton(centerX - spacing, "settings", this.settingsTex);
    this.playButton = makeButton(centerX, "play", this.playNormalTex);
    this.rankingButton = makeButton(centerX + spacing, "ranking", this.rankingTex);

    if (this.bird && this.playButton)
      this.bird.position.set(this.playButton.x, this.playButton.y - this.playButton.height * 1.7);
  }

  /** ⚙️ Botons per canviar l’ocell */
  private createSideButtons(originalTexture: Texture) {
    const cropSize = 15;
    const tile = 16;
    const offsetY = 80;

    const leftFrame = new Rectangle(tile * 2, offsetY + tile * 3, cropSize, cropSize);
    const rightFrame = new Rectangle(0, offsetY + tile * 2, cropSize, cropSize);

    this.leftTex = new Texture({ source: originalTexture.source, frame: leftFrame });
    this.rightTex = new Texture({ source: originalTexture.source, frame: rightFrame });
    
    const makeButton = (tex: Texture, onClick: () => void): Sprite => {
      const btn = new Sprite(tex);
      btn.anchor.set(0.5);
      btn.zIndex = 11;
      btn.scale.set((BackgroundManager.I.bgRect.width / 10) / 25);
      btn.eventMode = "static";
      btn.cursor = "pointer";

      btn.on("pointerdown", () => {
        btn.scale.set((BackgroundManager.I.bgRect.width / 10) / 30);
      });
      btn.on("pointerup", () => {btn.scale.set((BackgroundManager.I.bgRect.width / 10) / 25); onClick();});
      btn.on("pointerupoutside", () => btn.scale.set((BackgroundManager.I.bgRect.width / 10) / 25));

      this.container.addChild(btn);
      return btn;
    };    

    const prevBird = () => {
      if (!this.birdFrames.length || !this.bird) return;
      this.currentBirdIndex = (this.currentBirdIndex - 1 + this.birdFrames.length) % this.birdFrames.length;
      SceneManager.I.playerIndex = this.currentBirdIndex;
      this.bird.texture = this.birdFrames[this.currentBirdIndex];
    };

    const nextBird = () => {
      if (!this.birdFrames.length || !this.bird) return;
      this.currentBirdIndex = (this.currentBirdIndex + 1) % this.birdFrames.length;
      SceneManager.I.playerIndex = this.currentBirdIndex;
      this.bird.texture = this.birdFrames[this.currentBirdIndex];
    };

    this.leftButton = makeButton(this.leftTex, prevBird);
    this.rightButton = makeButton(this.rightTex, nextBird);

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
    const amplitude = bgHeight * 0.015; // 👈 3% de l'alçada del fons
    const speed = 1.2; // freqüència de l’oscil·lació

    // 🎢 Moviment sinusoidal suau
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
      }
    });
  }

}
