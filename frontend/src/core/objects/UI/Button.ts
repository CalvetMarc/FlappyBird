import { Sprite, Graphics, Container } from "pixi.js";
import { AssetsManager } from "../../managers/AssetsManager";

export class Button extends Container {
  private bgSprite: Sprite;
  private iconName: string;
  private iconSprite: Sprite;  
  private initScale: number;

  constructor(buttonScale: number, iconAssetName: string,callback: () => void, iconRotationRadians: number = 0, iconScale: number = 0.6) {
    super();

    this.bgSprite = AssetsManager.I.getSprite("ui", "button", 0);
    this.bgSprite.anchor = 0.5;
    this.bgSprite.eventMode = "static";
    this.bgSprite.cursor = "pointer";

    this.iconSprite = AssetsManager.I.getSprite("ui", iconAssetName, 0);
    this.iconSprite.anchor = 0.5;
    this.iconSprite.position = { x: 0, y: -3.5}
    this.iconSprite.scale.set(iconScale);
    
    const box = new Graphics().rect(-this.iconSprite.width * 0.5, -this.iconSprite.height * 0.5, this.iconSprite.width, this.iconSprite.height).stroke({ color: 0xff00ff, width: 2 });
    const box2 = new Graphics().rect(-this.bgSprite.width * 0.5, -this.bgSprite.height * 0.5, this.bgSprite.width, this.bgSprite.height).stroke({ color: 0xfffff, width: 2 });

    //this.iconSprite.addChild(box);
    //this.bgSprite.addChild(box2);
    this.iconSprite.rotation = iconRotationRadians;

    this.bgSprite.addChild(this.iconSprite);
    this.addChild(this.bgSprite);

    this.bgSprite.on("pointerdown", () => this.onPointerDown());
    this.bgSprite.on("pointerup", () => this.onPointerUp(callback));
    this.bgSprite.on("pointerupoutside", () => this.onPointerUpOutside());   

    this.initScale = buttonScale;
    this.scale.set(buttonScale);

    this.iconName = iconAssetName;
  }

  private onPointerDown(){
    this.scale.set(this.initScale * 0.9);
    this.iconSprite = AssetsManager.I.getSprite("ui", this.iconName, 1, this.iconSprite);
    this.iconSprite.position = { x: 0, y: -1.5}
    this.bgSprite = AssetsManager.I.getSprite("ui", "button", 2, this.bgSprite);
  }

  private onPointerUp(callback: () => void){
    this.scale.set(this.initScale);
    this.iconSprite = AssetsManager.I.getSprite("ui", this.iconName, 0, this.iconSprite);
    this.iconSprite.position = { x: 0, y: -3.5}
    this.bgSprite = AssetsManager.I.getSprite("ui", "button", 0, this.bgSprite);
    setTimeout(() => callback(), 40);
  }

  private onPointerUpOutside(){
    this.scale.set(this.initScale * 0.9);
    this.iconSprite = AssetsManager.I.getSprite("ui", this.iconName, 0, this.iconSprite);
    this.iconSprite.position = { x: 0, y: -3.5}
    this.bgSprite = AssetsManager.I.getSprite("ui", "button", 0, this.bgSprite);
  }
} 