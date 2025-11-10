import { Container, Sprite, Texture, Rectangle, Assets } from "pixi.js";
import pipeUrl from "../assets/tiles/SimpleStyle1.png";
import { BackgroundManager } from "../managers/BackgroundManager";

export class Pipe extends Container {
  private static topTex?: Texture;
  private static midTex?: Texture;
  private static bottomTex?: Texture;

  private segments: Sprite[] = [];

  // Mida base del spritesheet
  private readonly SPRITE_WIDTH = 32;
  private readonly SPRITE_HEIGHT = 16;

  constructor(height: number) {
    super();
    this.zIndex = 5;
    this.createPipe(height);
  }

  private async createPipe(height: number) {
    // Carrega la textura base només una vegada
    if (!Pipe.topTex) {
      const baseTex = await Assets.load(pipeUrl);

      // Cada part del tub segons el teu spritesheet:
      // 0–32 → part superior (2 trossos de 16px)
      // 32–48 → cos repetitiu (16px)
      // 48–80 → part inferior (2 trossos de 16px)
      Pipe.topTex = new Texture({
        source: baseTex.source,
        frame: new Rectangle(0, 0, this.SPRITE_WIDTH, 32),
      });
      Pipe.midTex = new Texture({
        source: baseTex.source,
        frame: new Rectangle(0, 32, this.SPRITE_WIDTH, 16),
      });
      Pipe.bottomTex = new Texture({
        source: baseTex.source,
        frame: new Rectangle(0, 48, this.SPRITE_WIDTH, 32),
      });
    }

    // 🧹 Neteja de segments anteriors
    this.removeChildren();
    this.segments = [];

    // 📏 Escalat segons el background
    const bgSprite = BackgroundManager.I.view.children.find(
      (c) => c instanceof Sprite
    ) as Sprite | undefined;

    const bgWidth = bgSprite?.width ?? 800;
    const targetWidth = bgWidth / 6; // 👈 amplada final del tub
    const scale = targetWidth / this.SPRITE_WIDTH;
    const tileHeight = this.SPRITE_HEIGHT * scale; // 👈 alçada de cada tile a pantalla

    // 🔹 Part superior
    const top = new Sprite(Pipe.topTex);
    top.scale.set(scale);
    top.anchor.set(0, 0);
    this.addChild(top);

    // 🔹 Cos central repetitiu
    const topHeight = 32 * scale;
    const bottomHeight = 32 * scale;
    const middleSpace = Math.max(0, height - (topHeight + bottomHeight));
    const middleCount = Math.ceil(middleSpace / tileHeight);

    for (let i = 0; i < middleCount; i++) {
      const mid = new Sprite(Pipe.midTex);
      mid.scale.set(scale);
      mid.y = topHeight + i * tileHeight;
      this.addChild(mid);
      this.segments.push(mid);
    }

    // 🔹 Part inferior
    const bottom = new Sprite(Pipe.bottomTex);
    bottom.scale.set(scale);
    bottom.y = topHeight + middleCount * tileHeight;
    this.addChild(bottom);
  }
}
