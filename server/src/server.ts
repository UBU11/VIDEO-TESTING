import { Hono } from "hono";
import { auth } from "./lib/auth";
import { cors } from "hono/cors";
import { use } from "hono/jsx";

interface WebSocketData {
  username?: string;
}

const users = new Map<string, any>();

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

app.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
    await next();
    return;
  }

  c.set("user", session.user);
  c.set("session", session.session);
  await next();
  return;
});

app.use(
  "api/auth/*",
  cors({
    origin: "http://localhost:3000",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    exposeHeaders: ["content-type"],
    maxAge: 600,
    credentials: true,
  }),
);

app.on(["GET", "POST"], "api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

app.get("/", (c: any) => {
  return c.text("testing!");
});

app.get("/session", (c) => {
  const session = c.get("session");
  const user = c.get("user");

  if (!user) return c.body(null, 401);

  return c.json({
    user,
    session,
  });
});

const server = Bun.serve<WebSocketData>({
  port: 8080,
  fetch(req, server) {
    if (
      server.upgrade(req, {
        data: {
          username: "anonymous",
        },
      })
    )
      return undefined;

    return app.fetch(req, server);
  },
  websocket: {
    message(ws, message) {
      const data = JSON.parse(message.toString());
      console.log(`Message from ${ws.data.username}:`, data.type);

      if (data.type === "login") {
        users.set(data.username, ws);
        ws.data.username = data.username;
        return;
      }

      const targetWs = users.get(data.target);
      if (targetWs) {
        console.log(`Forwarding ${data.type} to ${data.target}`);
        targetWs.send(
          JSON.stringify({
            ...data,
            sender: ws.data.username,
          }),
        );
      } else {
        console.warn(`Target ${data.target} not found in active users.`);
      }
    },
    close(ws) {
      if (ws.data?.username) users.delete(ws.data.username);
    },
  },
});

console.log(`🚀 Signaling server running at ws://localhost:${server.port}`);
