import { Sprite, Graphics, Container, ColorMatrixFilter, BitmapText } from "pixi.js";
import { AssetsManager } from "../../managers/AssetsManager";


export class Label extends Container {
  private labelBgSprite: Sprite;
  private labelText: BitmapText;

  constructor(label: string, fontSize: number, textTintHex: number = 0x222222, scaleY: number = 0.7) {
    super();    
    
    this.labelBgSprite = AssetsManager.I.getSprite("title2up", 0);
    //console.log(this.labelBgSprite.scale);
    this.labelBgSprite.anchor = 0.5;
    this.labelBgSprite.scale.y = scaleY;
    this.labelBgSprite.zIndex = 1;

    this.labelText = AssetsManager.I.getText(label, "vcrBase", fontSize);
    this.labelText.anchor.set(0, 0.5);
    this.labelText.tint = textTintHex;    
    this.labelText.zIndex = 2;  
    this.labelText.scale.y = 2 - this.labelBgSprite.scale.y;
    this.labelText.position.set(this.labelBgSprite.width * -0.41, -2);

    this.labelBgSprite.addChild(this.labelText);
    this.addChild(this.labelBgSprite);
  }
  
  public freeResources(): void{
    this.labelBgSprite.removeChildren();
    AssetsManager.I.releaseText(this.labelText);
    this.removeChildren();
    AssetsManager.I.releaseSprite(this.labelBgSprite);
  }
} 