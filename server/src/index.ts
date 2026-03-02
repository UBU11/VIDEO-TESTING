import { Hono } from "hono";
import p2p from "./routes/ws/p2p";
import { string } from "zod";

const app = new Hono();
app.route("/p2p", p2p);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

const server = Bun.serve({
  port: 5000,
  fetch(req, server) {
    const success = server.upgrade(req);
    if (success) {
      return undefined;
    }

    return app.fetch(req);
  },
  websocket: {
    open(ws) {
      console.log("Socket connected");
      ws.send(JSON.stringify({ type: "Connected" }));
      ws.subscribe('signaling')
    },
    data: {} as { authToken: string },

    async message(ws, message) {
      console.log(`Received ${message}`);

      ws.send(`You said: ${message}`);
      ws.publish('signaling',message)
    },

    close(ws) {
      console.log("Socket disconnected");
    },
  },
});

console.log(`Listening on ${server.hostname}:${server.port}`);
