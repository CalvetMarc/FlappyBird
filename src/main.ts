/*import { Application, Text } from "pixi.js";

// Create and initialize the Pixi application
const app = new Application();
await app.init({
  width: 800,
  height: 600,
  backgroundColor: "#1099bb", // Color in hex string format
});

// Append the canvas to the document
document.body.appendChild(app.canvas);

// Add simple text
const message = new Text({
  text: "Hola Marc 👋",
  style: {
    fontFamily: "Arial",
    fontSize: 36,
    fill: 0xffffff,
  },
});

message.x = 200;
message.y = 250;
app.stage.addChild(message);
*/

// main.ts — Pixi v8
import { GameManager } from "./managers/GameManager";

// Simply start the game; GameManager handles Application + SceneManager
GameManager.I; 
