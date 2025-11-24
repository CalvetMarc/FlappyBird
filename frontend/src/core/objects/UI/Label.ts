import { Sprite, Graphics, Container, ColorMatrixFilter, BitmapText } from "pixi.js";
import { AssetsManager } from "../../managers/AssetsManager";


export class Label extends Container {
  private labelBgSprite: Sprite;
  private labelText: BitmapText;

  constructor(label: string, fontSize: number, textTintHex: number = 0x222222) {
    super();    
    
    this.labelBgSprite = AssetsManager.I.getSprite("title2up", 0);
    this.labelBgSprite.anchor = 0.5;
    this.labelBgSprite.scale.y = 0.7;
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
} 