import { Container, Text } from "pixi.js";
import { IScene } from "../abstractions/IScene";
import { SceneManager } from "../managers/SceneManager";
import { sendScore } from "../../SessionManager";

export class GameOverScene implements IScene {
  public container = new Container();

  private playerId!: string;
  private score!: number;
  private timePlayed!: number;

  public constructor() {}

  public async onInit(): Promise<void> {
    // Aquí pots preparar UI si vols
  }

  public async onEnter(params?: any): Promise<void> {
    // Guardem els paràmetres rebuts
    this.playerId = params.playerId;
    this.score = params.score;
    this.timePlayed = params.timePlayed;

    console.log("GameOverScene → Enviant score…");

    // Enviem score al backend
    const resultat = await sendScore(
      this.playerId,
      this.score,
      this.timePlayed
    );

    console.log("Resposta del backend:", resultat);

    // Mostrem algun text provisional
    this.container.removeChildren();

    const resultText = new Text(
      resultat?.inRanking
        ? "🏆 Has entrat al ranking!"
        : "Game Over",
      { fontSize: 32, fill: 0xffffff }
    );

    resultText.anchor.set(0.5);
    resultText.position.set(360, 200);

    this.container.addChild(resultText);

    // Esperem 2 segons i tornem al menú
    setTimeout(() => {
      SceneManager.I.start("MainMenuScene");
    }, 2000);
  }

  public onUpdate(dt: number): void {}
  public async onExit(): Promise<void> {}
  public async onDestroy(): Promise<void> {}
  public onResize(width: number, height: number): void {}
}
