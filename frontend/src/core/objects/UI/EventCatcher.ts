import { Graphics, FederatedPointerEvent, Application } from "pixi.js";
import { LayoutManager } from "../../managers/LayoutManager";

export class EventCatcher extends Graphics {
  private onDownCallback: (e: FederatedPointerEvent) => void;

  constructor(onDown: (e: FederatedPointerEvent) => void) {
    super();
    this.onDownCallback = onDown;

    // quadre transparent que cobreix tot
    this.rect(0, 0, (LayoutManager.I.layoutCurrentSize.width / LayoutManager.I.layoutScale.x), (LayoutManager.I.layoutCurrentSize.height / LayoutManager.I.layoutScale.y)).fill(0x000000);
    this.alpha = 0;

    this.eventMode = "static";

    this.on("pointerdown", (e) => {
      this.onDownCallback(e);
    });
  }
}
