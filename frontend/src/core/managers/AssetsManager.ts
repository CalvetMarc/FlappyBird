import { SingletonBase } from "../abstractions/SingletonBase";
import { Sprite, Texture, Assets, Rectangle, Size, BitmapText, BitmapFont } from "pixi.js";

import { manifest } from "../../assets";
import { SpritePool } from "../objects/SpritePool";
import { BitmapTextPool } from "../objects/BitmapTextPool";

export class AssetsManager extends SingletonBase<AssetsManager> {
  private textures: Map<string, Texture[]> = new Map();
  private bitmapFonts: Map<string, string> = new Map();
  private spritePool: SpritePool;
  private textPool: BitmapTextPool;

  private constructor() {
    super();
    this.spritePool = new SpritePool();
    this.textPool = new BitmapTextPool();
  }

  public async start(): Promise<void> {
    await Assets.init({ manifest });

    for (const bundle of manifest.bundles) {
      const loaded = await Assets.loadBundle(bundle.name);
      const assetsDef = bundle.assets as Record<string, any>;

      for (const assetName in loaded) {
        const entry = loaded[assetName];
        const def = assetsDef[assetName];
        const key = `${bundle.name}/${assetName}`;

        // Carrega fonts bitmap (Pixi v8)
        if (entry instanceof BitmapFont) {
          this.bitmapFonts.set(key, entry.fontFamily);
          continue;
        }

        if (typeof entry === "string") continue;

        if (entry instanceof Texture) {
          let frames: Texture[] = [];

          if (def?.frames) {
            frames = def.frames.map((f: any) =>
              new Texture({
                source: entry.baseTexture,
                frame: new Rectangle(f.x, f.y, f.w, f.h)
              })
            );
          } else {
            frames = [entry];
          }

          this.textures.set(key, frames);
        }
      }
    }
    console.log(this.bitmapFonts);
  }

  public getSprite(bundle: string, asset: string, frame: number = 0, sprite: Sprite | null = null): Sprite {
    const key = `${bundle}/${asset}`;
    const frames = this.textures.get(key);
    if (!frames) throw new Error(`Frames not found for asset: ${key}`);

    if (!sprite) {
      return this.spritePool.getForTexture(frames[frame]);
    }

    sprite.texture = frames[frame];
    return sprite;
  }

  public getFrameCount(bundle: string, asset: string): number {
    const key = `${bundle}/${asset}`;
    const frames = this.textures.get(key);
    if (!frames) throw new Error(`Frames not found for asset: ${key}`);
    return frames.length;
  }

  public getTextureSize(bundle: string, asset: string, frame: number = 0): Size {
    const key = `${bundle}/${asset}`;
    const frames = this.textures.get(key);
    if (!frames) throw new Error(`Frames not found for asset: ${key}`);

    const tex = frames[frame];
    return { width: tex.width, height: tex.height };
  }

  public releaseSprite(sprite: Sprite) {
    this.spritePool.release(sprite);
  }

  public getText(text: string, font: string, size: number = 32): BitmapText {
    return this.textPool.getForFont(text, font, size);
  }

  public releaseText(bt: BitmapText) {
    this.textPool.release(bt);
  }
}
