import { Hono } from 'hono'

interface WebSocketData {
    username?: string;
}

const users = new Map<string, any>();

const app = new Hono()

app.get("/", (c:any) => {
  return c.text("testing!");
});

const server = Bun.serve<WebSocketData>({
  port: 8080,
  fetch(req, server) {
    if (server.upgrade(req, {
      data:{
        username: 'anonymous'
      }
    })) return undefined;
 
    
    return app.fetch(req,server);
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
            targetWs.send(JSON.stringify({ 
                ...data, 
                sender: ws.data.username 
            }));
        } else {
            console.warn(`Target ${data.target} not found in active users.`);
        }
    },
    close(ws) {
      if (ws.data?.username) users.delete(ws.data.username);
    }
  }
});

console.log(`🚀 Signaling server running at ws://localhost:${server.port}`);