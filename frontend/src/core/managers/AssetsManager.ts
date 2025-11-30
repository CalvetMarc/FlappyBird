import { SingletonBase } from "../abstractions/SingletonBase";
import { Sprite, Texture, Assets, Rectangle, Size, BitmapText } from "pixi.js";
import { sound } from "@pixi/sound";

import { manifest } from "../../assets";
import { SpritePool } from "../objects/SpritePool";
import { BitmapTextPool } from "../objects/BitmapTextPool";

export class AssetsManager extends SingletonBase<AssetsManager> {
  private textures: Map<string, Texture[]> = new Map();
   spritePool: SpritePool;
  private textPool: BitmapTextPool;

  private constructor() {
    super();
    this.spritePool = new SpritePool();
    this.textPool = new BitmapTextPool();
  }

public async start(): Promise<void> {
  // 1) Inicialitzar manifest un cop
  await Assets.init({ manifest });

  // 2) Carregar bundles individualment (una sola vegada)
  const loadedTextures = await Assets.loadBundle("textures");
  const loadedFonts = await Assets.loadBundle("fonts");
  const loadedSfx = await Assets.loadBundle("sfx");

  // 3) Registrar SFX UNA SOLA VEGADA
  const sfxBundle = manifest.bundles.find(b => b.name === "sfx");
  if (sfxBundle) {
    const sfxDefs = sfxBundle.assets as Record<string, string>;

    for (const sfxName in sfxDefs) {
      const src = sfxDefs[sfxName];
      if (!sound.exists(sfxName)) {
        sound.add(sfxName, src);
      }
    }
  }

  // 4) Registrar TTF com CSS fonts (no afecta bitmap)
  const fontsBundle = manifest.bundles.find(b => b.name === "fonts");
  if (fontsBundle) {
    const fontAssets = fontsBundle.assets as Record<string, any>;

    for (const fontName in fontAssets) {
      const src: string = fontAssets[fontName].src;

      if (
        src.endsWith(".ttf") ||
        src.endsWith(".otf") ||
        src.endsWith(".woff") ||
        src.endsWith(".woff2")
      ) {
        const fontFace = new FontFace(fontName, `url("${src}")`);
        await fontFace.load();
        document.fonts.add(fontFace);
      }
    }
  }

  // 5) Processar TEXTURES una sola vegada
  const texturesBundle = manifest.bundles.find(b => b.name === "textures");
  if (!texturesBundle) {
    throw new Error('Bundle "textures" not found in manifest.');
  }

  const assetsDef = texturesBundle.assets as Record<string, any>;

  for (const assetName in loadedTextures) {
    const entry = loadedTextures[assetName];
    const def = assetsDef[assetName];

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

    this.textures.set(assetName, frames);
  }
}


  // ---------- SPRITE ----------
  public getSprite(asset: string, frame: number = 0, sprite: Sprite | null = null): Sprite {
    const frames = this.textures.get(asset);
    if (!frames) throw new Error(`Frames not found for asset: textures/${asset}`);

    if (!sprite) {
      sprite = this.spritePool.getForTexture(frames[frame]);
      sprite.scale.set(1);
    }
    else{
      sprite.texture = frames[frame];
    }

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
    if(sprite)
      this.spritePool.release(sprite);
  }

  // ---------- BITMAP TEXT ----------
  public getText(text: string, font: string, size: number = 32): BitmapText {
    return this.textPool.getForFont(text, font, size);
  }

  public releaseText(bt: BitmapText) {
    if(bt)
      this.textPool.release(bt);
  }
}
