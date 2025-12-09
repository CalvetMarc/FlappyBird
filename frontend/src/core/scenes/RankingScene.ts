import { Container, Sprite, BitmapText, Size, Graphics } from "pixi.js";
import { IScene } from "../abstractions/IScene";
import { SceneManager } from "../managers/SceneManager";
import { Button } from "../objects/UI/Button";
import { GameManager, SessionInfo } from "../managers/GameManager";
import { TweenManager } from "../managers/TweenManager";
import { AssetsManager } from "../managers/AssetsManager";
import { LayoutManager } from "../managers/LayoutManager";
import { RankingField } from "../objects/UI/RankingField";
import { sound } from "@pixi/sound";

export class RankingScene implements IScene {
  
  private titleText!: BitmapText;
  private resetsInText!: BitmapText;
  private bgSprite!: Sprite;
  private titleBgSprite!: Sprite;
  private closeBtn!: Button;  
  
  private boardBgs: Sprite[] = [];
  private ranking: RankingField[] = [];  
  
  public containerGame: Container;
  public containerUi: Container;

  private resetSecondsLeft: number = 0;
  private resetCounterTimer: number = 0;
  
  public constructor() {
    this.containerGame = new Container();
    this.containerUi = new Container();

    this.containerGame.sortableChildren = true;
    this.containerUi.sortableChildren = true;
  }

  public async onInit(): Promise<void> {  
    this.createPanelBg();
    this.createLabels();
    this.createButton();  
  }

  public async onEnter(): Promise<void> {
    const loader = AssetsManager.I.getResourceFromReference("loader");
    if (loader) this.containerGame.addChild(loader);

    if (GameManager.I.settings.audioEnabled) {
      setTimeout(() => sound.play("ranking"), 300);
    }

    this.containerUi.alpha = 0;
    this.closeBtn.onStart();

    this.resetSecondsLeft = this.parseTime(GameManager.I.nextResetIn);

    this.resetsInText.text = "Reset: " + this.formatTime(this.resetSecondsLeft);

    this.fillRankingEntries(this.normalizeRanking(GameManager.I.lastLoadedRankingInfo));
    
    TweenManager.I.fadeTo([this.containerUi], 1, 500);

    await new Promise(r => setTimeout(r, 150));

    if (loader) {
      loader.removeFromParent();
      loader.freeResources();
      AssetsManager.I.removeResourceReference("loader");
    }

    await new Promise(r => setTimeout(r, 300));
    this.closeBtn.enableInput();
  }

  public onUpdate(dt: number): void {

    this.resetCounterTimer += dt / 1000;

    if (this.resetCounterTimer >= 1) {
      this.resetCounterTimer = 0;

      if (this.resetSecondsLeft <= 0) {
        this.resetsInText.text = "Reset: 0 s";
        return;
      }

      this.resetSecondsLeft--;

      this.resetsInText.text = "Reset: " + this.formatTime(this.resetSecondsLeft);
    }
  }

  public async onExit(): Promise<void> {    
    await TweenManager.I.fadeTo([this.containerUi], 0, 500).finished; 
  }

  public async onDestroy(): Promise<void> {
    this.closeBtn.freeResources();
    this.closeBtn.removeFromParent();
    this.closeBtn.removeChildren();

    for (const field of this.ranking) field.freeResources();
    this.ranking = [];

    for (const bg of this.boardBgs) {
      bg.removeFromParent();
      bg.removeChildren();
      AssetsManager.I.releaseSprite(bg);
    }

    this.titleText.removeFromParent();
    this.titleText.removeChildren();
    AssetsManager.I.releaseText(this.titleText);

    this.bgSprite.removeFromParent();
    this.bgSprite.removeChildren();
    AssetsManager.I.releaseSprite(this.bgSprite);   

    this.titleBgSprite.removeFromParent();
    this.titleBgSprite.removeChildren();
    AssetsManager.I.releaseSprite(this.titleBgSprite);
    
    this.resetsInText.removeFromParent();
    this.resetsInText.removeChildren();
    AssetsManager.I.releaseText(this.resetsInText);
  }

  private createPanelBg(): void {
    const textureBgSize: Size = AssetsManager.I.getTextureSize("bigPanelOrange");
    const aspectRelationBg: number = textureBgSize.width / textureBgSize.height;
    this.bgSprite = AssetsManager.I.getSprite("bigPanelOrange");

    this.bgSprite.height = LayoutManager.I.layoutVirtualSize.height * 0.5;
    this.bgSprite.width = this.bgSprite.height * aspectRelationBg;
    this.bgSprite.rotation = Math.PI * 0.5;
    this.bgSprite.anchor.set(0.5);
    this.bgSprite.zIndex = 5;
    this.bgSprite.position.set(
      (LayoutManager.I.layoutCurrentSize.width / LayoutManager.I.layoutScale.x) * 0.5,
      (LayoutManager.I.layoutCurrentSize.height / LayoutManager.I.layoutScale.y) * 0.43
    );

    const textureTitleBgSize: Size = AssetsManager.I.getTextureSize("title1up");
    const aspectRelationTitleBg: number = textureTitleBgSize.height / textureTitleBgSize.width;
    this.titleBgSprite = AssetsManager.I.getSprite("title1up");

    const width = this.titleBgSprite.width * 1.1;
    const height = width * aspectRelationTitleBg;
    this.titleBgSprite.width = width;
    this.titleBgSprite.height = height;
    this.titleBgSprite.rotation = -Math.PI * 0.5;
    this.titleBgSprite.anchor.set(0.5);
    this.titleBgSprite.zIndex = 5;
    this.titleBgSprite.position.set(-39, 0);
    
    this.titleText = AssetsManager.I.getText("Ranking", "vcrHeavy", 9.5);
    this.titleText.anchor.set(0.5);
    this.titleText.zIndex = 6;
    this.titleText.position.set(0.5, -3);
    this.titleText.tint = 0xC00000;

    this.resetsInText = AssetsManager.I.getText("Reset: --", "vcrBase", 3);
    this.resetsInText.rotation = -Math.PI * 0.5;
    this.resetsInText.anchor.set(0.5);
    this.resetsInText.zIndex = 6;
    this.resetsInText.position.set(-30, 0);
    this.resetsInText.tint = 0xA95C68;    
    
    this.titleBgSprite.addChild(this.titleText);
    this.bgSprite.addChild(this.titleBgSprite);    
    this.bgSprite.addChild(this.resetsInText);
    this.containerUi.addChild(this.bgSprite);
  }

  private createLabels() {
    const textureSize: Size = AssetsManager.I.getTextureSize("textPage");    

    const betweenMask = new Graphics();
    betweenMask.rect(-textureSize.width * 0.5, -textureSize.height * 0.45, textureSize.width, textureSize.height * 0.52).fill(0xffffff);

    for (let i = 0; i < 5; i++) {
      const sprite = AssetsManager.I.getSprite("textPage");
      this.bgSprite.addChild(sprite);

      sprite.anchor = 0.5;
      sprite.rotation = -Math.PI * 0.5;

      let startY = i !== 4 ? -15 + i * 11 : -8 + i * 7.9;
      sprite.position.set(startY, 0); 

      sprite.scale.set(0.85, 0.7);

      let currentMask: Graphics;

      if (i === 0) {
        currentMask = new Graphics();
        currentMask.rect(-textureSize.width * 0.5, -textureSize.height * 0.5, textureSize.width, textureSize.height * 0.65).fill(0xffffff);
      } else if (i === 4) {
        currentMask = new Graphics();
        currentMask.rect(-textureSize.width * 0.5, -textureSize.height * 0.2, textureSize.width, textureSize.height * 0.7).fill(0xffffff);
      } else {
        currentMask = betweenMask.clone(false);
      }

      sprite.addChild(currentMask);
      sprite.mask = currentMask;

      this.boardBgs.push(sprite);

      for (let j = 0; j < 2; j++) {
        const rankingField = new RankingField();          
        this.ranking.push(rankingField);   
      }
    }

  }

  private fillRankingEntries(rakingInfo: SessionInfo[]) {
    for (let i = 0; i < 5; i++) {
      const sprite = this.boardBgs[i];
      for (let j = 0; j < 2; j++) {
        const pos = i * 2 + (j + 1);
        this.ranking[pos - 1].fillEntry(sprite, j + 1, pos, rakingInfo[pos - 1], 4, [3, 3, 3], 0xAAAA00, [0x707070, 0xFF0000, 0x0000FF]);
        this.ranking[pos - 1].zIndex = 100000;        
      }
    }
  }

  private normalizeRanking(list: SessionInfo[]): SessionInfo[] {
    const result = [...list];
    while (result.length < 10) {
      result.push({ name: "-----", lastScore: -1, lastGameTime: -1 });
    }
    return result;
  }

  private createButton() {
    this.closeBtn = new Button(2 / this.bgSprite.scale.x, "cross", () => SceneManager.I.fire("menu"), "exit1", true, 0x0c0807);
    this.closeBtn.position.x = 40;
    this.closeBtn.rotation = -Math.PI * 0.5;
    this.bgSprite.addChild(this.closeBtn);
  }  

  private parseTime(str: string): number {
    if (!str) return 0;

    let total = 0;

    const regex = /(\d+)\s*(mo|d|h|min|s)/g;
    let match;

    while ((match = regex.exec(str)) !== null) {
      const value = parseInt(match[1]);
      const unit = match[2];

      switch (unit) {
        case "mo": total += value * 30 * 24 * 3600; break;
        case "d": total += value * 24 * 3600; break;
        case "h": total += value * 3600; break;
        case "min": total += value * 60; break;
        case "s": total += value; break;
      }
    }

    return total;
  }

  private formatTime(seconds: number): string {
    let ms = seconds * 1000;

    const SEC = 1000;
    const MIN = SEC * 60;
    const HOUR = MIN * 60;
    const DAY = HOUR * 24;
    const MONTH = DAY * 30;

    const months = Math.floor(ms / MONTH); ms -= months * MONTH;
    const days = Math.floor(ms / DAY); ms -= days * DAY;
    const hours = Math.floor(ms / HOUR); ms -= hours * HOUR;
    const minutes = Math.floor(ms / MIN); ms -= minutes * MIN;
    const secs = Math.floor(ms / SEC);
    
    if (seconds > 24 * 3600) {

      const units = [
        { val: months, label: "mo" },
        { val: days, label: "d" },
        { val: hours, label: "h" }
      ];

      let firstIndex = units.findIndex(u => u.val > 0);
      if (firstIndex === -1) firstIndex = 2;

      const parts = units.slice(firstIndex).map(u => `${u.val} ${u.label}`);

      return parts.join(" ");
    }

    return `${hours} h ${minutes} min ${secs} s`;
  }


}
