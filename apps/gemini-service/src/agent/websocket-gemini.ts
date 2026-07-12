import { WebSocket} from "ws";
import { config } from "../config/config.js";


const ws = new WebSocket(
  `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${config.GEMINI_API_KEY}`
);

ws.on("open", () => {
  console.log("Connected to Gemini Live");
  ws.send(
    JSON.stringify({
      setup: {
        model: "models/gemini-3.1-flash-live-preview"
      }
    })
  );
});

ws.on("message", (data) => {
  console.log(data.toString());
});

ws.onerror = (err) => {
    console.log(err);
};

ws.onclose = () => {
    console.log("Disconnected");
};