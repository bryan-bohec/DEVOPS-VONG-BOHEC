import { app } from "./app";
import { env } from "./config/env";

app.listen(env.PORT, () => {
  console.log(`api-gateway listening on port ${env.PORT}`);
});
