import "./styles.css";
import { mountGame } from "./game/game";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Missing #app root");
}

app.innerHTML = "";
mountGame();
