import { Pool } from "../abstractions/Pool"
import { Sprite, Texture } from "pixi.js";

export class SpritePool extends Pool<Sprite> {
  constructor() {
    super(
      () => new Sprite(),
      (sprite) => {
        sprite.visible = true;
        sprite.alpha = 1;
        sprite.rotation = 0;
        sprite.scale.set(1);
        sprite.position.set(0, 0);
        sprite.anchor?.set?.(0);
        sprite.tint = 0xFFFFFF;
        sprite.zIndex = 0; 
        sprite.eventMode = "auto";
        sprite.cursor = "auto";
        if (sprite.filters) {
          for (const f of sprite.filters) {
            if (f.destroy) {
              f.destroy();   
            }
          }
        }
        sprite.filters = null;
      },
      (sprite) => {
        sprite.visible = false;
      }
    );
  }

  getForTexture(texture: Texture): Sprite {
    const sprite = this.get();
    sprite.texture = texture;
    return sprite;
  }
}
