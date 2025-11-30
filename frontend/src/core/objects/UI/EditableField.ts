import { Container, Point, Graphics } from "pixi.js";
import { AssetsManager } from "../../managers/AssetsManager";

export class EditableField extends Container {
  private background: Graphics;
  private htmlInput!: HTMLInputElement;
  repositionEvent!: () => void;

  // Handlers guardats per poder desregistrar correctament
  private onPointerOver!: () => void;
  private onPointerOut!: () => void;

  private onInputHandler!: () => void;
  private onFocusHandler!: () => void;
  private onBlurHandler!: () => void;

  constructor(htmlInput: HTMLInputElement, background: Graphics, maxTextSize: number, repositionEvent: () => void) {
    super();

    this.repositionEvent = repositionEvent;
    this.background = background;
    this.htmlInput = htmlInput;

    this.background.eventMode = "static";

    // ---------- HANDLERS PIXI ----------
    this.onPointerOver = () => this.onMouseEnter();
    this.onPointerOut = () => this.onMouseExit();

    this.background.on("pointerover", this.onPointerOver);
    this.background.on("pointerout", this.onPointerOut);

    // ---------- HANDLERS HTML ----------
    this.onInputHandler = () => {
      htmlInput.value = htmlInput.value.slice(0, maxTextSize);
      this.repositionEvent();
    };

    this.onFocusHandler = () => {};

    this.onBlurHandler = () => {
      if (htmlInput.value.length <= 0) {
        htmlInput.value = "Guest";
        this.repositionEvent();
      }
    };

    this.htmlInput.addEventListener("input", this.onInputHandler);
    this.htmlInput.addEventListener("focus", this.onFocusHandler);
    this.htmlInput.addEventListener("blur", this.onBlurHandler);
  }

  public refreshVisuals() {
    this.repositionEvent();
  }

  public freeResources(): void {
    // PIXI
    this.background.off("pointerover", this.onPointerOver);
    this.background.off("pointerout", this.onPointerOut);

    // HTML
    this.htmlInput.removeEventListener("input", this.onInputHandler);
    this.htmlInput.removeEventListener("focus", this.onFocusHandler);
    this.htmlInput.removeEventListener("blur", this.onBlurHandler);

    if (this.htmlInput.parentElement) {
      this.htmlInput.parentElement.removeChild(this.htmlInput);
    }

    this.background.removeChildren();
    AssetsManager.I.releaseSprite(this.background);

    // Reset referències
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
