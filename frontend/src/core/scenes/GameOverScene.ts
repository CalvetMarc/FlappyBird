import { Container, Sprite, BitmapText, Size } from "pixi.js";
import { IScene } from "../abstractions/IScene";
import { Button } from "../objects/UI/Button";
import { LayoutManager } from "../managers/LayoutManager";
import { AssetsManager } from "../managers/AssetsManager";
import { SceneManager } from "../managers/SceneManager";
import { DataField } from "../objects/UI/DataField";
import { sendScore } from "../../SessionManager";
import { GameManager } from "../managers/GameManager";

export class GameOverScene implements IScene {

  private titleText!: BitmapText;
  private bgSprite!: Sprite;
  private titleBgSprite!: Sprite;
  private restartBtn!: Button;
  private exitBtn!: Button;

  private scoreLabelComponent!: DataField;
  private timeLabelComponent!: DataField;
  private rankingReachedLabelComponent!: DataField;

  public containerGame: Container;
  public containerUi: Container;

  public constructor() {
    this.containerGame = new Container();
    this.containerUi = new Container();
  }

  public async onInit(): Promise<void> {
    await this.loadAssets();    
  }

  public async onEnter(): Promise<void> {

    
  }

  public onUpdate(dt: number): void {}
  public async onExit(): Promise<void> {}

  public async onDestroy(): Promise<void> {
    this.scoreLabelComponent.removeFromParent();
    this.containerUi.addChild(this.scoreLabelComponent);
    this.scoreLabelComponent.freeResources();

    this.timeLabelComponent.removeFromParent();
    this.containerUi.addChild(this.timeLabelComponent);
    this.timeLabelComponent.freeResources();

    this.rankingReachedLabelComponent.removeFromParent();
    this.containerUi.addChild(this.rankingReachedLabelComponent);
    this.rankingReachedLabelComponent.freeResources();

    this.restartBtn.removeFromParent();
    this.containerUi.addChild(this.restartBtn);
    this.restartBtn.freeResources();

    this.exitBtn.removeFromParent();
    this.containerUi.addChild(this.exitBtn);
    this.exitBtn.freeResources();

    this.titleBgSprite.removeChild();
    AssetsManager.I.releaseText(this.titleText);
    AssetsManager.I.releaseSprite(this.titleBgSprite);
    
    this.bgSprite.removeChildren();
    this.bgSprite.removeFromParent();
    AssetsManager.I.releaseSprite(this.bgSprite);
  }  

  private async loadAssets() {
    this.createPanelBg();
    this.createLabels();
    this.createButtons();
  }

  private createPanelBg() { 
    const textureBgSize: Size = AssetsManager.I.getTextureSize("bigPanelBlue");
    const aspectRelationBg: number = textureBgSize.width / textureBgSize.height;
    this.bgSprite = AssetsManager.I.getSprite("bigPanelBlue");

    this.bgSprite.height = LayoutManager.I.layoutVirtualSize.height * 0.5;
    this.bgSprite.width = this.bgSprite.height * aspectRelationBg;
    this.bgSprite.rotation = Math.PI * 0.5;
    this.bgSprite.anchor.set(0.5);
    this.bgSprite.zIndex = 5;
    this.bgSprite.position.set(LayoutManager.I.layoutCurrentSize.width * 0.5, LayoutManager.I.layoutCurrentSize.height * 0.43);

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
    
    this.titleText = AssetsManager.I.getText("Game Over", "vcrHeavy", 8.5);
    this.titleText.anchor.set(0.5);
    this.titleText.zIndex = 6;
    this.titleText.position.set(0.5, -3);
    this.titleText.tint = 0x0090f0;
    
    this.titleBgSprite.addChild(this.titleText);
    this.bgSprite.addChild(this.titleBgSprite);    
    this.containerUi.addChild(this.bgSprite);
  }

  private createLabels(){
    this.scoreLabelComponent = new DataField("Score: ", GameManager.I.sessionData.lastScore.toString(), 7, 0x222222, 0x0000ff);
    this.bgSprite.addChild(this.scoreLabelComponent);
    this.scoreLabelComponent.rotation = -Math.PI * 0.5;
    this.scoreLabelComponent.position.set(-15, 0);
    this.scoreLabelComponent.scale.set(0.95);

    this.timeLabelComponent = new DataField("Time: ", this.formatTime(GameManager.I.sessionData.lastGameTime), 7, 0x222222, 0x0000ff);
    this.bgSprite.addChild(this.timeLabelComponent);
    this.timeLabelComponent.rotation = -Math.PI * 0.5;
    this.timeLabelComponent.position.set(3, 0);
    this.timeLabelComponent.scale.set(0.95);

    this.rankingReachedLabelComponent = new DataField("Ranking: ", "No", 7, 0x222222, 0x0000ff);
    this.bgSprite.addChild(this.rankingReachedLabelComponent);
    this.rankingReachedLabelComponent.rotation = -Math.PI * 0.5;
    this.rankingReachedLabelComponent.position.set(21, 0);
    this.rankingReachedLabelComponent.scale.set(0.95);
  }
  
  private createButtons() {  
    this.exitBtn = new Button(0.35, "exit", () => SceneManager.I.fire("menu"), 0xff0044);
    this.exitBtn.position.x = 40;
    this.exitBtn.position.y = 8;
    this.exitBtn.rotation = -Math.PI * 0.5;

    this.restartBtn = new Button(0.35, "restart", () => SceneManager.I.fire("play"), 0x0c0807);
    this.restartBtn.position.x = 40;
    this.restartBtn.position.y = -8;
    this.restartBtn.rotation = -Math.PI * 0.5;

    this.bgSprite.addChild(this.exitBtn);
    this.bgSprite.addChild(this.restartBtn);
  }

  private formatTime(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    const parts: string[] = [];

    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || hours > 0) parts.push(`${minutes}min`);
    parts.push(`${seconds}s`);

    return parts.join(" ");
  }

}
