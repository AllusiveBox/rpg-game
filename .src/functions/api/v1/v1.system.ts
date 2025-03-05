import { app } from "@azure/functions";
import { V1SystemHandler } from "../../../handlers/http/v1/v1.system.handler";

const handler: V1SystemHandler = new V1SystemHandler();

app.http("health", {
    route: "api/v1/system/health",
    methods: ["GET"],
    authLevel: "anonymous",
    handler: handler.health.bind(handler)
});