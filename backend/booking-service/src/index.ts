import { app } from "./app";
import { env } from "./config/env";

app.listen(env.PORT, () => {
  console.log(`booking-service listening on port ${env.PORT}`);
});
