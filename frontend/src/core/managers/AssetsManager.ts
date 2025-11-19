import { SingletonBase } from "../abstractions/SingletonBase";
import { Sprite, Texture, Assets, Rectangle, Size, BitmapText } from "pixi.js";

import { manifest } from "../../assets";
import { SpritePool } from "../objects/SpritePool";
import { BitmapTextPool } from "../objects/BitmapTextPool";

export class AssetsManager extends SingletonBase<AssetsManager> {
  private textures: Map<string, Texture[]> = new Map();
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
      await Assets.loadBundle(bundle.name);
    }

    const texturesBundle = manifest.bundles.find(b => b.name === "textures");
    if (!texturesBundle) {
      throw new Error('Bundle "textures" not found in manifest.');
    }

    const loadedTextures = await Assets.loadBundle("textures");
    const assetsDef = texturesBundle.assets as Record<string, any>;

    for (const assetName in loadedTextures) {
      const entry = loadedTextures[assetName];
      const def = assetsDef[assetName];
      const key = assetName;

      if (typeof entry === "string") continue;
      if (!(entry instanceof Texture)) continue;

      let frames: Texture[] = [];

      if (def?.frames) {
        frames = def.frames.map((f: any) =>
          new Texture({
            source: entry.source,
            frame: new Rectangle(f.x, f.y, f.w, f.h),
          })
        );
      } else {
        frames = [entry];
      }

      this.textures.set(key, frames);
    }
  }

  // ---------- SPRITE ----------
  public getSprite(asset: string, frame: number = 0, sprite: Sprite | null = null): Sprite {
    const frames = this.textures.get(asset);
    if (!frames) throw new Error(`Frames not found for asset: textures/${asset}`);

    if (!sprite) return this.spritePool.getForTexture(frames[frame]);

    sprite.texture = frames[frame];
    return sprite;
  }

  public getFrameCount(asset: string): number {
    const frames = this.textures.get(asset);
    if (!frames) throw new Error(`Frames not found for asset: textures/${asset}`);
    return frames.length;
  }

  public getTextureSize(asset: string, frame: number = 0): Size {
    const frames = this.textures.get(asset);
    if (!frames) throw new Error(`Frames not found for asset: textures/${asset}`);

    const tex = frames[frame];
    return { width: tex.width, height: tex.height };
  }

  public releaseSprite(sprite: Sprite) {
    this.spritePool.release(sprite);
  }

  // ---------- BITMAP TEXT ----------
  public getText(text: string, font: string, size: number = 32): BitmapText {
    return this.textPool.getForFont(text, font, size);
  }

  public releaseText(bt: BitmapText) {
    this.textPool.release(bt);
  }
}
