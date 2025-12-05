import { Graphics, Container } from "pixi.js";
import { TweenManager } from "../../managers/TweenManager";
import { ms, Milliseconds } from "../../time/TimeUnits";
import { UniqueId } from "../IdProvider";
import { Tween } from "../../managers/TweenManager";

const spinTimeMS: number = 1100;

type LoadingCircle = {
  initPhase: number,
  circle: Graphics
}

export class Loading extends Container {
  private circles: LoadingCircle[] = [];
  private angleStep: number;
  private rotationSpeed: number = 0.02;
  private spinTweenID!: UniqueId;

  constructor(circlesNum: number, circleRadius: number, distanceFromCenter: number) {
    super();
    this.angleStep = (Math.PI * 2) / circlesNum;

    for (let i = 0; i < circlesNum; i++) {
      const angle = i * this.angleStep;

      const circle = new Graphics().circle(0, 0, circleRadius).fill(0x222222);
      circle.x = Math.cos(angle) * distanceFromCenter;
      circle.y = Math.sin(angle) * distanceFromCenter;

      const initialPhase = (i / circlesNum) * Math.PI * 2;

      circle.alpha = 0;

      this.addChild(circle);
      this.circles.push({ initPhase: initialPhase, circle });
    }

    this.pivot.set(0, 0);
    this.animateOpacity();
  }

  public update(): void {
    this.rotation += this.rotationSpeed;
  }

  public freeResources(): void {
    this.circles.forEach(element => {
      element.circle.destroy();
    });
    this.circles = [];
  }

  private animateOpacity(): void {

    const total = this.circles.length;
    const minScale = 0.4;  
    const maxScale = 1.2;  

    this.spinTweenID = TweenManager.I.AddLoopTween(<Tween<LoadingCircle[]>>{
      waitTime: ms(0),
      duration: spinTimeMS,
      context: this.circles!,
      tweenFunction: function (elapsed) {

        const t = Number(elapsed) / Number(this.duration);
        const offset = Math.floor(t * total);

        this.context.forEach((element, i) => {

          const pos = (i - offset + total) % total;

          const alpha = pos / (total - 1);
          element.circle.alpha = alpha;

          const scale = minScale + alpha * (maxScale - minScale);
          element.circle.scale.set(scale);
        });
      }
    }).id;
  }

}
