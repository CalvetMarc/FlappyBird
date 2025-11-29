import { Sprite, Application, Container, ColorMatrixFilter, BitmapText, FederatedPointerEvent, Point, Graphics } from "pixi.js";
import { AssetsManager } from "../../managers/AssetsManager";
import { GameManager } from "../../managers/GameManager";
import { EventCatcher } from "./EventCatcher";
import { LayoutManager } from "../../managers/LayoutManager";

export class EditableField extends Container {
  private background: Graphics;
  private maxTextSize: number;
  private bmText: BitmapText;
  private catcher!: EventCatcher;
  private htmlInput!: HTMLInputElement;
  private caret!: Graphics;
  private isFocused = false;

  constructor(bmText: BitmapText, background: Graphics, maxTextSize: number) {
    super();    
    this.maxTextSize = maxTextSize;
    this.background = background;
    this.bmText = bmText;

    this.enableCatcher();

    this.background.eventMode = "static";
    this.background.cursor = "text";

    this.background.on("pointerover", () => {
        this.onMouseEnter();
    });

    this.background.on("pointerout", () => {
        this.onMouseExit();
    });

    this.background.on("click", () => { this.onPointInside(); });

    this.createHTMLInput();
    this.createCaret();
  }
  
  public freeResources(): void{
    this.catcher.destroy();
    this.background.removeChildren();
    AssetsManager.I.releaseText(this.bmText);
    this.removeChildren();
    AssetsManager.I.releaseSprite(this.background);
  }

  public refreshVisuals(){
    if(this.bmText.text.length <= 0){
        this.bmText.text = "Guest";
        this.htmlInput.value = this.bmText.text;
        this.updateTextCenter();
        this.updateCaretPosition();
    }
  }
  
  private enableCatcher() {
    this.catcher = new EventCatcher((e) => { if(!this.containsPoint(e.global)) this.onPointOutside(); });
    LayoutManager.I.uiContainer.addChild(this.catcher);
  }

  private onPointInside() {
    this.isFocused = true;

    this.htmlInput.focus();
    this.htmlInput.setSelectionRange(this.htmlInput.value.length, this.htmlInput.value.length);

    this.updateCaretPosition();

    console.log("DINS");
  }

  private onPointOutside() {
     if (!this.isFocused) return;

    this.isFocused = false;
    this.htmlInput.blur();
    this.caret.alpha = 0;

    if(this.bmText.text.length <= 0){
        this.bmText.text = "Guest";
        this.htmlInput.value = this.bmText.text;
        this.updateTextCenter();
        this.updateCaretPosition();
    }


    console.log("FORA");
  }

  private containsPoint(globalPoint: Point): boolean {
    const bounds = this.background.getBounds(); // bounds en global space

    return (
        globalPoint.x >= bounds.x &&
        globalPoint.x <= bounds.x + bounds.width &&
        globalPoint.y >= bounds.y &&
        globalPoint.y <= bounds.y + bounds.height
    );
  }

  private onMouseEnter(){
    this.background.alpha = 0.8;
  }

  private onMouseExit(){
    this.background.alpha =1;
  }

  private createHTMLInput() {
    this.htmlInput = document.createElement("input");
    this.htmlInput.type = "text";
    this.htmlInput.value = this.bmText.text;

    Object.assign(this.htmlInput.style, {
        position: "absolute",
        opacity: "0",
        pointerEvents: "none",
        left: "0px",
        top: "0px",
    });

    document.body.appendChild(this.htmlInput);

    this.htmlInput.addEventListener("input", () => {
        if (this.htmlInput.value.length > this.maxTextSize) {
            this.htmlInput.value = this.htmlInput.value.slice(0, this.maxTextSize);
        }
        this.bmText.text = this.htmlInput.value;
        GameManager.I.sessionData.name = this.bmText.text.length <= 0 ? "Guest" : this.bmText.text;
        this.updateTextCenter();
        this.updateCaretPosition();
    });
  }

  private createCaret() {
    const caretHeight = this.background.height * 0.5; // altura estable i visible
    this.caret = new Graphics().rect(0, 0, 2, caretHeight).fill(this.bmText.tint);
    this.background.addChild(this.caret);

    GameManager.I.gameApp.ticker.add(() => {
        if (this.isFocused) {
            this.caret.alpha = (Math.sin(performance.now() / 150) + 1) / 2;
        } else {
            this.caret.alpha = 0;
        }
    });
  }

  private updateTextCenter(){
    this.bmText.position.x = ((LayoutManager.I.layoutCurrentSize.width / LayoutManager.I.layoutScale.x) * 0.5) - (this.bmText.width * 0.5)
  }

  private updateCaretPosition() {
    this.caret.x = this.bmText.x + this.bmText.width + this.caret.width;
    this.caret.y = this.bmText.y;
  }

} 