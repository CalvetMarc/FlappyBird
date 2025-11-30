import { Sprite, Graphics, Container, ColorMatrixFilter, BitmapText } from "pixi.js";
import { AssetsManager } from "../../managers/AssetsManager";
import { Label } from "./Label";
import { sound } from "@pixi/sound";
import { GameManager } from "../../managers/GameManager";

const debug = false;

export class Toggle extends Container {
  private bgSprite: Sprite;

  private iconAssetNameOn: string;
  private iconAssetNameOff: string;
  private iconSprite: Sprite;  
  private currentValue: boolean;

  private onPress: () => void;

  private labelComponent: Label;

  constructor(labelText: string, iconAssetNameOn: string, iconAssetNameOff: string, toggleScale: number,  fontSize: number, onPress: () => void ,initValue: boolean = true, 
    textTintHex: number = 0x222222, boolean = false, iconRotationRadians: number = 0, iconScale: number = 2) {
    super();

    this.currentValue = initValue; 
    
    this.iconAssetNameOff = iconAssetNameOff;
    this.iconAssetNameOn = iconAssetNameOn;
    
    this.labelComponent = new Label(labelText, fontSize, textTintHex);

    this.bgSprite = AssetsManager.I.getSprite("smallPanelGrey2", 0);
    this.bgSprite.anchor = 0.5;
    this.bgSprite.scale.set(fontSize / 30);
    this.bgSprite.eventMode = "static";
    this.bgSprite.cursor = "pointer";
    this.bgSprite.position.set(this.labelComponent.width * 0.38, -1);    
    this.bgSprite.zIndex = 2;

    this.iconSprite = AssetsManager.I.getSprite(this.currentValue ? iconAssetNameOn : iconAssetNameOff, 0);
    this.iconSprite.anchor = 0.5;
    this.iconSprite.scale.set(iconScale);    
    this.iconSprite.zIndex = 3;

    const filter = new ColorMatrixFilter();
    this.iconSprite.filters = [filter];
    
    this.iconSprite.rotation = iconRotationRadians;

    this.bgSprite.addChild(this.iconSprite);
    this.addChild(this.bgSprite);
    this.addChild(this.labelComponent);

    this.bgSprite.on("pointerdown", () => this.onPointerDown());

    this.scale.set(toggleScale);

    this.onPress = onPress;

    if(debug){
      this.debugBounds();
    }
  }

  public freeResources(): void{
    this.labelComponent.freeResources();
    this.bgSprite.removeChild(this.iconSprite);
    AssetsManager.I.releaseSprite(this.iconSprite);
    this.removeChildren();
    this.bgSprite.removeAllListeners();
    AssetsManager.I.releaseSprite(this.bgSprite);
  }

  private onPointerDown(){   
    if(GameManager.I.settings.audioEnabled){ 
      sound.play("interact");
    }
    this.currentValue = !this.currentValue;
    this.iconSprite = AssetsManager.I.getSprite(this.currentValue ? this.iconAssetNameOn : this.iconAssetNameOff, 0, this.iconSprite);
    this.onPress();
  }

  private debugBounds(){
    const box = new Graphics().rect(-this.iconSprite.width * 0.5, -this.iconSprite.height * 0.5, this.iconSprite.width, this.iconSprite.height).stroke({ color: 0xff00ff, width: 2 });
    const box2 = new Graphics().rect(-this.bgSprite.width * 0.5, -this.bgSprite.height * 0.5, this.bgSprite.width, this.bgSprite.height).stroke({ color: 0xfffff, width: 2 });

    this.iconSprite.addChild(box);
    this.bgSprite.addChild(box2);
  }
} 