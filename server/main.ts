import { createApp } from "./app.js";
import { registerHealthRoutes } from "./health.route.js";

const port = Number(process.env.PORT ?? 3000);
createApp(registerHealthRoutes).listen(port, () => {
  console.log(`API on http://127.0.0.1:${port}`);
});
