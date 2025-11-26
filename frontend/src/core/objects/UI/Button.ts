import { Sprite, Graphics, Container, ColorMatrixFilter, FederatedPointerEvent } from "pixi.js";
import { AssetsManager } from "../../managers/AssetsManager";
import { LayoutManager } from "../../managers/LayoutManager";

const debug = false;

export class Button extends Container {
  private bgSprite: Sprite;
  private iconName: string;
  private iconSprite: Sprite;  
  private initScale: number;
  private iconIsOneFrame: boolean;

  constructor(buttonScale: number, iconAssetName: string, callback: () => void, iconTintHex: number = 0xffffff, iconIsOneFrame: boolean = false, iconRotationRadians: number = 0, iconScale: number = 0.6) {
    super();

    this.bgSprite = AssetsManager.I.getSprite("button", 0);
    this.bgSprite.anchor = 0.5;
    this.bgSprite.eventMode = "static";
    this.bgSprite.cursor = "pointer";
    this.bgSprite.setSize(LayoutManager.I.layoutCurrentSize.width / 25);

    this.iconSprite = AssetsManager.I.getSprite(iconAssetName, 0);
    this.iconSprite.anchor = 0.5;
    this.iconSprite.position = { x: 0, y: -3.5 };
    this.iconSprite.scale.set(iconScale);

    const hue = this.hexToHue(iconTintHex);
    const filter = new ColorMatrixFilter();
    filter.hue(hue, false);
    this.iconSprite.filters = [filter];

    this.iconSprite.rotation = iconRotationRadians;

    this.bgSprite.addChild(this.iconSprite);
    this.addChild(this.bgSprite);

    this.bgSprite.on("pointerdown", () => this.onPointerDown());
    this.bgSprite.on("pointerup", () => this.onPointerUp(callback));
    this.bgSprite.on("pointerupoutside", () => this.onPointerUpOutside());

    this.bgSprite.on("pointerover", () => this.onPointerOver());
    this.bgSprite.on("pointerout", () => this.onPointerOut());

    this.initScale = buttonScale;
    this.scale.set(buttonScale);

    this.iconName = iconAssetName;
    this.iconIsOneFrame = iconIsOneFrame;

    if (debug) {
      this.debugBounds();
    }
  }

  public freeResources(): void{
    this.bgSprite.removeChildren();
    AssetsManager.I.releaseSprite(this.iconSprite);
    this.removeChildren();
    this.bgSprite.removeAllListeners();
    AssetsManager.I.releaseSprite(this.bgSprite);
  }

  public resetVisuals(){
     this.bgSprite.tint = 0xFFFFFF;        
     this.iconSprite.tint = 0xFFFFFF;
  }

  private onPointerDown() {
    this.scale.set(this.initScale * 0.9);

    if (!this.iconIsOneFrame) {
      this.iconSprite = AssetsManager.I.getSprite(this.iconName, 1, this.iconSprite);
    }

    this.iconSprite.position = { x: 0, y: -1.5 };
    this.bgSprite = AssetsManager.I.getSprite("button", 2, this.bgSprite);
    
  }

  private onPointerUp(callback: () => void) {
    this.scale.set(this.initScale);

    if (!this.iconIsOneFrame) {
      this.iconSprite = AssetsManager.I.getSprite(this.iconName, 0, this.iconSprite);
    }

    this.iconSprite.position = { x: 0, y: -3.5 };
    this.bgSprite = AssetsManager.I.getSprite("button", 0, this.bgSprite);    

    setTimeout(() => callback(), 40);
  }

  private onPointerUpOutside() {
    this.scale.set(this.initScale);

    if (!this.iconIsOneFrame) {
      this.iconSprite = AssetsManager.I.getSprite(this.iconName, 0, this.iconSprite);
    }

    this.iconSprite.position = { x: 0, y: -3.5 };
    this.bgSprite = AssetsManager.I.getSprite("button", 0, this.bgSprite);
  }

  private onPointerOver() {
    this.bgSprite.tint = 0xB0B0B0;        
    this.iconSprite.tint = 0xB0B0B0;      
  }

  private onPointerOut() {
    this.bgSprite.tint = 0xFFFFFF;        
    this.iconSprite.tint = 0xFFFFFF;
  }

  private hexToHue(hex: number): number {
    const r = ((hex >> 16) & 0xff) / 255;
    const g = ((hex >> 8) & 0xff) / 255;
    const b = (hex & 0xff) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0;

    if (delta !== 0) {
      if (max === r) h = ((g - b) / delta) % 6;
      else if (max === g) h = (b - r) / delta + 2;
      else h = (r - g) / delta + 4;

      h *= 60;
    }

    if (h < 0) h += 360;

    return h;
  }

  private debugBounds() {
    const box = new Graphics()
      .rect(-this.iconSprite.width * 0.5, -this.iconSprite.height * 0.5, this.iconSprite.width, this.iconSprite.height)
      .stroke({ color: 0xff00ff, width: 2 });

    const box2 = new Graphics()
      .rect(-this.bgSprite.width * 0.5, -this.bgSprite.height * 0.5, this.bgSprite.width, this.bgSprite.height)
      .stroke({ color: 0xfffff, width: 2 });

    this.iconSprite.addChild(box);
    this.bgSprite.addChild(box2);
  }
}
