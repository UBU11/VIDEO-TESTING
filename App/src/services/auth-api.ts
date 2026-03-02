import { hc } from "hono/client";


const client = hc("http://localhost:8080/", {
  init: {
    credentials: "include", // Required for sending cookies cross-origin
  },
});

// Now your client requests will include credentials
const response = await client.someProtectedEndpoint.$get();
console.log(response)