import { Pool } from "../abstractions/Pool"
import { Sprite, Texture } from "pixi.js";

export class SpritePool extends Pool<Sprite> {
  constructor() {
    super(
      () => new Sprite(),
      (sprite) => {
        sprite.removeFromParent();
        sprite.removeChildren();
        sprite.removeAllListeners();

        sprite.visible = false;
        sprite.alpha = 1;
        sprite.position.set(0, 0);
        sprite.rotation = 0;
        sprite.scale.set(1);
        sprite.skew.set(0, 0);
        sprite.anchor.set(0);
        sprite.tint = 0xFFFFFF;
        sprite.zIndex = 0;

        sprite.eventMode = "auto";
        sprite.cursor = "auto";
        sprite.interactive = false; 
        sprite.hitArea = null;

        sprite.texture = Texture.EMPTY;
        sprite.width = 0;
        sprite.height = 0;

        if (sprite.filters) {
          for (const f of sprite.filters) {
            f.destroy?.();
          }
        }
        sprite.filters = null;
        sprite.mask = null;
      },
      (sprite) => {
        sprite.visible = true;
      }
    );
  }

  getForTexture(texture: Texture): Sprite {
    const sprite = this.get();
    sprite.texture = texture;
    return sprite;
  }
}
