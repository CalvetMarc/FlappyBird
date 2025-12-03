import { Application, Container } from "pixi.js";
import { Milliseconds } from "../time/TimeUnits";

export const LAYERS = {
  BACKGROUND: 0,
  GROUND: 10,
  PIPES: 30,
  PLAYER: 50,
  UI: 100,
} as const;

export interface IScene {
  containerGame: Container;
  containerUi: Container;
  onInit(): Promise<void>;
  onEnter(): Promise<void>;
  onUpdate(dt: Milliseconds): void;
  onExit(): Promise<void>;
  onDestroy(): Promise<void>;
}

const sceneEvents = ["play", "splash", "settings", "menu", "ranking", "gameover"] as const;
export type SceneEvent = (typeof sceneEvents)[number];
