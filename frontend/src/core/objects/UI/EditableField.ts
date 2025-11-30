import { Container, Point, Graphics } from "pixi.js";
import { AssetsManager } from "../../managers/AssetsManager";

export class EditableField extends Container {
  private background: Graphics;
  private htmlInput!: HTMLInputElement;
  private isHovering: boolean = false;
  repositionEvent!: () => void;


  private onInputHandler!: () => void;
  private onFocusHandler!: () => void;
  private onBlurHandler!: () => void;

  constructor(htmlInput: HTMLInputElement, background: Graphics, maxTextSize: number, repositionEvent: () => void) {
    super();

    this.repositionEvent = repositionEvent;
    this.background = background;
    this.htmlInput = htmlInput;

    this.background.eventMode = "static";
    
    window.addEventListener("mousemove", this.onGlobalMouseMove);

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
    window.removeEventListener("mousemove", this.onGlobalMouseMove);

    this.htmlInput.removeEventListener("input", this.onInputHandler);
    this.htmlInput.removeEventListener("focus", this.onFocusHandler);
    this.htmlInput.removeEventListener("blur", this.onBlurHandler);

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

  private onGlobalMouseMove = (e: MouseEvent) => {
    const globalPoint = new Point(e.clientX, e.clientY);
    const local = this.background.toLocal(globalPoint);

    const bounds = this.background.getLocalBounds();

    const isInside =
      local.x >= bounds.x &&
      local.x <= bounds.x + bounds.width &&
      local.y >= bounds.y &&
      local.y <= bounds.y + (bounds.height * 0.75);

    if (isInside && !this.isHovering) {
      this.isHovering = true;
      this.onMouseEnter();
    }

    if (!isInside && this.isHovering) {
      this.isHovering = false;
      this.onMouseExit();
    }
  };

}
