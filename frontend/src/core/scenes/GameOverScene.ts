import { Container, Sprite, BitmapText, Size } from "pixi.js";
import { IScene } from "../abstractions/IScene";
import { Button } from "../objects/UI/Button";
import { LayoutManager } from "../managers/LayoutManager";
import { AssetsManager } from "../managers/AssetsManager";
import { SceneManager } from "../managers/SceneManager";
import { DataField } from "../objects/UI/DataField";
import { sendScore } from "../../SessionManager";
import { GameManager } from "../managers/GameManager";
import { TweenManager } from "../managers/TweenManager";
import { UniqueId } from "../objects/IdProvider";
import { sound } from "@pixi/sound";

export class GameOverScene implements IScene {

  private titleText!: BitmapText;
  private bgSprite!: Sprite;
  private bird?: Sprite;
  private titleBgSprite!: Sprite;
  private restartBtn!: Button;
  private exitBtn!: Button;

  private scoreLabelComponent!: DataField;
  private timeLabelComponent!: DataField;
  private rankingReachedLabelComponent!: DataField;

  private birdPreview: boolean;
  private enterRanking: boolean;

  public containerGame: Container;
  public containerUi: Container;

  public constructor() {
    this.containerGame = new Container();
    this.containerUi = new Container();
    this.birdPreview = false;    
    this.enterRanking = false;
  }

  public async onInit(): Promise<void> {
    this.createPanelBg();
    this.createLabels();
    this.createButtons();  

    this.containerGame.alpha = 0;
    this.containerUi.alpha = 0;
  }

  public async onEnter(): Promise<void> {
    if(GameManager.I.settings.audioEnabled){
      setTimeout(() => {
        sound.play("finish");
      }, 200);
    }

    this.exitBtn.onStart();
    this.restartBtn.onStart();

    this.birdPreview = false;    
    await TweenManager.I.fadeTo([this.containerGame, this.containerUi], 1, 350).finished;   

    this.exitBtn.enableInput();
    this.restartBtn.enableInput();
  }

  public onUpdate(dt: number): void {}

  public async onExit(): Promise<void> {    
    GameManager.I.backgroundController.setScrolling(true);
    this.restartBtn.resetVisuals();
    this.exitBtn.resetVisuals();

    if(this.birdPreview){
      this.bird = AssetsManager.I.getSprite("bird" + (SceneManager.I.playerIndex + 1).toString(), 0);
      this.bird!.anchor.set(0.5);
      this.bird!.zIndex = 12;
      this.bird!.position = {x: LayoutManager.I.layoutCurrentSize.width * 0.5, y: LayoutManager.I.layoutCurrentSize.height * 0.614};
      this.bird!.scale.set(LayoutManager.I.layoutVirtualSize.width * 0.0044);
      this.containerGame.addChild(this.bird!);    
    }

    await TweenManager.I.fadeTo([this.containerUi], 0, 800).finished;   
  }

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

    if(this.bird){
      this.bird.removeFromParent();
      AssetsManager.I.releaseSprite(this.bird);
    }    

    this.titleBgSprite.removeChild();
    AssetsManager.I.releaseText(this.titleText);
    AssetsManager.I.releaseSprite(this.titleBgSprite);
    
    this.bgSprite.removeChildren();
    this.bgSprite.removeFromParent();
    AssetsManager.I.releaseSprite(this.bgSprite);
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
    this.bgSprite.position.set((LayoutManager.I.layoutCurrentSize.width / LayoutManager.I.layoutScale.x) * 0.5, (LayoutManager.I.layoutCurrentSize.height / LayoutManager.I.layoutScale.y) * 0.43);

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

    this.rankingReachedLabelComponent = new DataField("Ranking: ", GameManager.I.lastEnteredRanking ? "Yes" : "No", 7, 0x222222, 0x0000ff);
    this.bgSprite.addChild(this.rankingReachedLabelComponent);
    this.rankingReachedLabelComponent.rotation = -Math.PI * 0.5;
    this.rankingReachedLabelComponent.position.set(21, 0);
    this.rankingReachedLabelComponent.scale.set(0.95);
  }
  
  private createButtons() {  
    this.exitBtn = new Button(2.5 / this.bgSprite.scale.x, "exit", () => { this.birdPreview = false; SceneManager.I.fire("menu"); }, "exit1", 0xff0044);
    this.exitBtn.position.x = 40;
    this.exitBtn.position.y = 8;
    this.exitBtn.rotation = -Math.PI * 0.5;

    this.restartBtn = new Button(2.5 / this.bgSprite.scale.x, "restart", () => { this.birdPreview = true; SceneManager.I.fire("play") }, "click", 0x0c0807);
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
