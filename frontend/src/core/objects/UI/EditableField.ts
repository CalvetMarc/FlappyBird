import { Container, BitmapText, Point, Graphics, Size } from "pixi.js";
import { AssetsManager } from "../../managers/AssetsManager";

export class EditableField extends Container {
  private background: Graphics;
  private htmlInput!: HTMLInputElement;
  repositionEvent!: () => void;

  constructor(htmlInput: HTMLInputElement, background: Graphics, maxTextSize: number, repositionEvent: () => void) {
    super();

    this.repositionEvent = repositionEvent;
    this.background = background;
    this.htmlInput = htmlInput;

    this.background.eventMode = "static";

    this.background.on("pointerover", () => this.onMouseEnter());
    this.background.on("pointerout", () => this.onMouseExit());

    this.htmlInput.addEventListener("input", () => {
      htmlInput.value = htmlInput.value.slice(0, maxTextSize);
      this.repositionEvent();
    });

    this.htmlInput.addEventListener("blur", () => {
        if(htmlInput.value.length <= 0){
          htmlInput.value = "Guest";
          this.repositionEvent();
        }
    });
    
    
  }

  public refreshVisuals(){
    this.repositionEvent();
  }

  public freeResources(): void {
    this.background.off("pointerover");
    this.background.off("pointerout");

    this.htmlInput.removeEventListener("input", this.repositionEvent);
    this.htmlInput.removeEventListener("focus", () => {});
    this.htmlInput.removeEventListener("blur", () => {});

    if (this.htmlInput.parentElement) {
      this.htmlInput.parentElement.removeChild(this.htmlInput);
    }

    this.background.removeChildren();
    AssetsManager.I.releaseSprite(this.background);

    this.htmlInput = null!;
    this.repositionEvent = () => {};
  }


  private onMouseEnter() {
    this.refreshVisuals();
    this.background.alpha = 0.8;
  }

  private onMouseExit() {
    this.background.alpha = 1;
  }

}
