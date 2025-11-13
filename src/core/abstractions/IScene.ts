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
  container: Container;
  onInit(): Promise<void>;
  onEnter(): void;
  onUpdate(dt: Milliseconds): void;
  onExit(): Promise<void>;
  onDestroy(): Promise<void>;
  onResize(width: number, height: number): void;
}

const sceneEvents = ["play", "pause", "settings", "menu", "ranking"] as const;
export type SceneEvent = (typeof sceneEvents)[number];
