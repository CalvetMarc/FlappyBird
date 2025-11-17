import { Container } from "pixi.js";
import { Milliseconds } from "../time/TimeUnits";

export interface IGameObject{
    container: Container;
    onCreate(): Promise<void>;
    onUpdate(dt: Milliseconds): void;
    onDestroy(): Promise<void>;
}
