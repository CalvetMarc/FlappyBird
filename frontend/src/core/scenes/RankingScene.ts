import { Container, Sprite, BitmapText, Size, Graphics } from "pixi.js";
import { IScene } from "../abstractions/IScene";
import { SceneManager } from "../managers/SceneManager";
import { Button } from "../objects/UI/Button";
import { DataField } from "../objects/UI/DataField";
import { GameManager, SessionInfo } from "../managers/GameManager";
import { TweenManager } from "../managers/TweenManager";
import { AssetsManager } from "../managers/AssetsManager";
import { LayoutManager } from "../managers/LayoutManager";
import { RankingField } from "../objects/UI/RankingField";
import { getRanking } from "../../SessionManager";

const isTest: boolean = true;

export class RankingScene implements IScene {
  
  private titleText!: BitmapText;
  private bgSprite!: Sprite;
  private titleBgSprite!: Sprite;
  private closeBtn!: Button;

  private boardBgs: Sprite[] = [];
  private ranking: RankingField[] = [];
  
  public containerGame: Container;
  public containerUi: Container;
  
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

  /** Called when the scene becomes active */
  public async onEnter(): Promise<void> {
    this.containerGame.alpha = 0;
    this.containerUi.alpha = 0;
    GameManager.I.forcePointerMove();

    const rankingInfo = await getRanking();
    this.fillRankingEntries(this.normalizeRanking(rankingInfo));

    await TweenManager.I.fadeTo([this.containerGame, this.containerUi], 1, 500).finished;  
  }

  /** Called every frame */
  public onUpdate(dt: number): void {
    
  }

  /** Called before scene is removed or pooled */
  public async onExit(): Promise<void> {
    await TweenManager.I.fadeTo([this.containerGame, this.containerUi], 0, 500).finished; 
  }

  public async onDestroy(): Promise<void> {
    this.closeBtn.freeResources();
    this.closeBtn.removeFromParent();
    this.closeBtn.removeChildren();

    for(const field of this.ranking){
      field.freeResources();
    }
    this.ranking = [];

    for(const bg of this.boardBgs){
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
  }

  private createPanelBg(): void{
    const textureBgSize: Size = AssetsManager.I.getTextureSize("bigPanelOrange");
    const aspectRelationBg: number = textureBgSize.width / textureBgSize.height;
    this.bgSprite = AssetsManager.I.getSprite("bigPanelOrange");

    this.bgSprite.height = LayoutManager.I.layoutVirtualSize.height * 0.5;
    this.bgSprite.width = this.bgSprite.height * aspectRelationBg;
    this.bgSprite.rotation = Math.PI * 0.5;
    this.bgSprite.anchor.set(0.5);
    this.bgSprite.zIndex = 5;
    this.bgSprite.position.set((LayoutManager.I.layoutCurrentSize.width / LayoutManager.I.layoutScale.x)* 0.5, (LayoutManager.I.layoutCurrentSize.height / LayoutManager.I.layoutScale.y) * 0.43);

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
    
    this.titleBgSprite.addChild(this.titleText);
    this.bgSprite.addChild(this.titleBgSprite);    
    this.containerUi.addChild(this.bgSprite);
  }

  private createLabels(){
    if(isTest){
      const textureSize: Size = AssetsManager.I.getTextureSize("textPage");    

      const betweenMask = new Graphics();
      betweenMask.rect(-textureSize.width * 0.5, -textureSize.height * 0.45, textureSize.width, textureSize.height * 0.52).fill(0xffffff);

      for(let i = 0; i < 5; i++){
        const sprite = AssetsManager.I.getSprite("textPage");
        this.bgSprite.addChild(sprite);

        sprite.anchor = 0.5;
        sprite.rotation = -Math.PI * 0.5;

        let startY = i !== 4 ? -15 + i * 11 : - 8 + i * 7.9;
        sprite.position.set(startY, 0); 

        sprite.scale.set(0.85, 0.7);

        let currentMask: Graphics;

        if(i === 0){
          currentMask = new Graphics();
          currentMask.rect(-textureSize.width * 0.5, -textureSize.height * 0.5, textureSize.width, textureSize.height * 0.65).fill(0xffffff);
        } 
        else if(i === 4){
          currentMask = new Graphics();
          currentMask.rect(-textureSize.width * 0.5, -textureSize.height * 0.2, textureSize.width, textureSize.height * 0.7).fill(0xffffff);
        }
        else{
          currentMask = betweenMask.clone(false);
        }

        sprite.addChild(currentMask);
        sprite.mask = currentMask;

        this.boardBgs.push(sprite)

        for(let j = 0; j < 2; j++){
          const rankingField = new RankingField();          
          this.ranking.push(rankingField);   
        }

      }

    }
    else{

    }

  }

  private fillRankingEntries(rakingInfo: SessionInfo[]){

    for(let i = 0; i < 5; i++){
      const sprite = this.boardBgs[i];
      for(let j = 0; j < 2; j++){
        const pos = i * 2 + (j + 1);
        this.ranking[pos - 1].fillEntry(sprite, j + 1, pos, rakingInfo[pos - 1], 4, [3,3,3], 0xAAAA00, [0x707070, 0xFF0000, 0x0000FF]);
        this.ranking[pos - 1].zIndex = 100000;        
      }

    }

  }

  private normalizeRanking(list: SessionInfo[]) : SessionInfo[]{
    const result = [...list];
    while (result.length < 10) {
      result.push({
        name: "-----",
        lastScore: -1,
        lastGameTime: -1
      });
    }

    return result;
  }



  private createButton() {
    this.closeBtn = new Button(0.25, "cross", () => SceneManager.I.fire("menu"), 0x0c0807);
    this.closeBtn.position.x = 40;
    this.closeBtn.rotation = -Math.PI * 0.5;

    this.bgSprite.addChild(this.closeBtn);
  }  
 
}
