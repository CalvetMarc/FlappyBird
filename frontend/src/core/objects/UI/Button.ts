import { Sprite, Texture, Container } from "pixi.js";
import { AssetsManager } from "../../managers/AssetsManager";

export class Button extends Container {
  private bgSprite: Sprite;
  private iconSprite: Sprite;
  
  private baseScale = 1;
  private pressScale = 0.9;
  private callback: () => void;

  constructor(iconAssetName: string, callback: () => void) {
    super();

    this.callback = callback;
    this.bgSprite = AssetsManager.I.getSprite("ui", "button", 0);
    this.iconSprite = AssetsManager.I.getSprite("ui", iconAssetName, 0);


    this.addChild(this.bgSprite);
    this.bgSprite.addChild(this.iconSprite);

  }

}
