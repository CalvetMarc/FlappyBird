import { Sprite, Graphics, Container, ColorMatrixFilter, BitmapText } from "pixi.js";
import { AssetsManager } from "../../managers/AssetsManager";
import { Label } from "./Label";


export class DataField extends Container {
  private datalabelText: BitmapText;
  private labelComponent: Label;

  constructor(label: string, dataLabel: string, fontSize: number, textTintHex: number = 0x222222, dataTextTintHex: number = 0x222222) {
    super();    
    
    this.labelComponent = new Label(label, fontSize, textTintHex);
    this.addChild(this.labelComponent);

    this.datalabelText = AssetsManager.I.getText(dataLabel, "vcrBase", fontSize);
    this.datalabelText.tint = dataTextTintHex;
    this.datalabelText.anchor.set(1, 0.5);
    this.datalabelText.position = { x: this.labelComponent.width * 0.45, y: -1.5 };
    this.datalabelText.zIndex = 100;

    this.addChild(this.datalabelText);
    this.addChild(this.labelComponent);

  }
} 