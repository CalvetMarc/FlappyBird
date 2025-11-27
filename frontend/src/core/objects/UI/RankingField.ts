import { Sprite, Graphics, Container, ColorMatrixFilter, BitmapText } from "pixi.js";
import { AssetsManager } from "../../managers/AssetsManager";
import { Label } from "./Label";
import { SessionInfo } from "../../managers/GameManager";


export class RankingField extends Container {
  private rankingEntryTexts: BitmapText[] = [];

  constructor(bg: Sprite, yPosIdx: number, rankingPos: number, playerInfo: SessionInfo, posFontSize: number, sessionEntriesSize: number[] = [3, 3, 3], 
    posTintHex: number = 0x222222, sessionEntriesTintHex: number[] = [0x222222, 0x222222, 0x222222]) {

    super();        

    let bmt: BitmapText = AssetsManager.I.getText(`${rankingPos.toString()}`, "vcrHeavy", posFontSize);
    bmt.tint = posTintHex;
    bmt.anchor.set(0, 0.5);
    bg.addChild(bmt);
    const posY = rankingPos < 9 ? -20.5 + (yPosIdx * 8) : -12.2 + (yPosIdx * 8);
    bmt.position.set(-bg.width * 0.52, posY);
    this.rankingEntryTexts.push(bmt);
    bmt.scale.set(bmt.parent ? 2 - bmt.parent.scale.x : 1, bmt.parent ? 2 - bmt.parent.scale.y : 1);

    for(const [key, value] of Object.entries(playerInfo)){
        bmt = AssetsManager.I.getText(key != "lastGameTime" ? value.toString() : this.formatTime(value as number), "vcrBase", sessionEntriesSize[this.rankingEntryTexts.length - 1]);
        bmt.tint = sessionEntriesTintHex[this.rankingEntryTexts.length - 1];
        bg.addChild(bmt);

        let x = 0;

        if(key === "name"){
            bmt.anchor.set(0, 0.5);
            x = this.rankingEntryTexts[0].position.x + (bg.width * 0.15);
        }
        else if(key === "lastScore"){
            bmt.anchor.set(1, 0.5);
            x = bg.width * 0.5;
        }
        else{
            bmt.anchor.set(0.5, 0.5);            
            x = this.rankingEntryTexts[2].position.x - (bg.width * 0.37);
        }

        bmt.position.set(x ,this.rankingEntryTexts[0].position.y)
        bmt.scale.set(bmt.parent ? 2 - bmt.parent.scale.x : 1, bmt.parent ? 2 - bmt.parent.scale.y : 1);
        this.rankingEntryTexts.push(bmt);        
    }

  }
  public freeResources(): void{
    for(const entry of this.rankingEntryTexts){
        entry.removeFromParent();
        entry.removeChildren();
        AssetsManager.I.releaseText(entry);
    }
    this.rankingEntryTexts = [];
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