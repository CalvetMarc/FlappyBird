import { Pool } from "../abstractions/Pool"
import { BitmapText } from "pixi.js";

export class BitmapTextPool extends Pool<BitmapText> {
  constructor() {
    super(
      () =>
        new BitmapText({
          text: "",
          style: { fontFamily: "default", fontSize: 32 }
        }),
      bt => {
        bt.visible = true;
        bt.alpha = 1;
        bt.scale.set(1);
      },
      bt => {
        bt.text = "";
        bt.visible = false;
      }
    );
  }

  getForFont(text: string, font: string, size: number = 32): BitmapText {
    const bt = this.get();
    bt.style.fontFamily = font;
    bt.style.fontSize = size;
    bt.text = text;
    return bt;
  }
}
