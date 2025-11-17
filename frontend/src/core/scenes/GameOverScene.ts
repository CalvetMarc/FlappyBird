import { Container, Sprite, Texture, Assets, Rectangle, Text } from "pixi.js";
import { IScene } from "../abstractions/IScene";
import { SceneManager } from "../managers/SceneManager";
import { sendScore } from "../../SessionManager";
import { GameManager } from "../managers/GameManager";
import uiUrl from "../../../public/assets/ui/UiCozyFree.png";

export class GameOverScene implements IScene {

  public container = new Container();

  public constructor() {}

  public async onInit(): Promise<void> {

    const uiTexture = await Assets.load(uiUrl);
    await document.fonts.load('48px "Minecraft"');

    // ---- RECUT DEL SPRITE (25px + 25px) ----
    const baseRect = new Rectangle(164, 167, 47, 80);

    // Part superior (25px)
    const topTex = new Texture({
      source: uiTexture.source,
      frame: new Rectangle(
        baseRect.x,
        baseRect.y,
        baseRect.width,
        25
      )
    });

    // Part inferior (25px)
    const bottomTex = new Texture({
      source: uiTexture.source,
      frame: new Rectangle(
        baseRect.x,
        baseRect.y + baseRect.height - 25, // 167 + 80 - 25 = 222
        baseRect.width,
        25
      )
    });

    const topSprite = new Sprite(topTex);
    const bottomSprite = new Sprite(bottomTex);

    bottomSprite.y = topSprite.height;

    const combined = new Container();
    combined.addChild(topSprite);
    combined.addChild(bottomSprite);

    // Nova alçada = 25px + 25px = 50px
    const newHeight = 50;
    const scale = newHeight / baseRect.width;

    combined.width = BackgroundManager.I.bgRect.width / 3;
    combined.height = combined.width * scale;

    combined.position.set(
      BackgroundManager.I.bgRect.x + BackgroundManager.I.bgRect.width / 2,
      BackgroundManager.I.bgRect.y + BackgroundManager.I.bgRect.height / 2
    );

    this.container.addChild(combined);
  }

  public async onEnter(): Promise<void> {

    const resultat = await sendScore(GameManager.I.lastScore);
    console.log("Resposta del backend:", resultat);

    const resultText = new Text(
      resultat?.inRanking
        ? "🏆 Has entrat al ranking!"
        : "Game Over",
      { fontSize: 32, fill: 0xffffff }
    );

    resultText.anchor.set(0.5);
    resultText.position.set(360, 200);
    this.container.addChild(resultText);
  }

  public onUpdate(dt: number): void {}
  public async onExit(): Promise<void> {}
  public async onDestroy(): Promise<void> {}
  public onResize(width: number, height: number): void {}
}
