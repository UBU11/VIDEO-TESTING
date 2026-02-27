import { type WebSocketData } from "../types/websocketData";
import { saveMessageToDatabase } from "../controller/websocketHelper";

Bun.serve({
  fetch(req, server) {
    const success = server.upgrade(req);
    if (success) {
      return undefined;
    }
  return new Response("Socket chcking!");
  },
  websocket: {
    data:{} as {AuthTokem: string},
    async message(ws, message) {
      console.log(`Received ${message}`);
      ws.send(`You said: ${message}`);
    },
    open(ws) {},
    close(ws, code, message) {},
    drain(ws) {},
  },
});
