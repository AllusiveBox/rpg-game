import { app } from "@azure/functions";
import { V1GaiaHandler } from "../../../handlers/http/v1/v1.gaia.handler";

const handler: V1GaiaHandler = new V1GaiaHandler();

app.http("getThread", {
    route: "api/v1/gaia/thread/{id:int}",
    methods: ["GET"],
    authLevel: "anonymous",
    handler: handler.getThread.bind(handler)
});