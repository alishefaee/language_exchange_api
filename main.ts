import { Hono } from "hono";
import { router } from "./src/app.ts";

const app = new Hono()

app.route("/api/v1", router);

// Put this back instead of 'export default app;'
Deno.serve(app.fetch);