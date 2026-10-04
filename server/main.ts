import { createApp } from "./app.js";
import { registerHealthRoutes } from "./health.route.js";
import { registerTodoRoutes } from "./todo.route.js";

const port = Number(process.env.PORT ?? 3000);
createApp((app) => {
  registerHealthRoutes(app);
  registerTodoRoutes(app);
}).listen(port, () => {
  console.log(`API on http://127.0.0.1:${port}`);
});
