import { Sprite, Graphics, Container, ColorMatrixFilter, BitmapText } from "pixi.js";
import { AssetsManager } from "../../managers/AssetsManager";
import { Label } from "./Label";


export class DataField extends Container {
  private dataLabelText: BitmapText;
  private labelComponent: Label;

  constructor(label: string, dataLabel: string, fontSize: number, textTintHex: number = 0x222222, dataTextTintHex: number = 0x222222) {
    super();    
    
    this.labelComponent = new Label(label, fontSize, textTintHex);
    this.addChild(this.labelComponent);

    this.dataLabelText = AssetsManager.I.getText(dataLabel, "vcrBase", fontSize);
    this.dataLabelText.tint = dataTextTintHex;
    this.dataLabelText.anchor.set(1, 0.5);
    this.dataLabelText.position = { x: this.labelComponent.width * 0.45, y: -1.5 };
    this.dataLabelText.zIndex = 100;

    this.addChild(this.dataLabelText);
    this.addChild(this.labelComponent);

  }
  public freeResources(): void{
    this.removeChild(this.dataLabelText);
    AssetsManager.I.releaseText(this.dataLabelText);
    this.labelComponent.freeResources();
  }
} 