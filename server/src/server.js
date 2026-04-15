import { createApp } from "./app.js";
import { connectDb } from "./config/db.js";
import { env } from "./config/env.js";

const app = createApp();

connectDb()
  .then(() => {
    app.listen(env.port, () => {
      console.log(`API running on http://localhost:${env.port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server");
    console.error(error);
    process.exit(1);
  });
