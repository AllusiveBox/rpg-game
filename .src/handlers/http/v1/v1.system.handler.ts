import {
    HttpRequest,
    HttpResponseInit,
    InvocationContext
} from "@azure/functions";
import { V1SystemController } from "../../../controllers/api/v1/v1.system.controller";
import { LoggerService } from "../../../services";
import { V1HandlerBase } from "./v1.handler.base";

export class V1SystemHandler extends V1HandlerBase<V1SystemController> {

    getController(
        logger: LoggerService
    ): V1SystemController {
        return new V1SystemController(logger);
    }

    getLogger(
        context: InvocationContext
    ): LoggerService {
        return new LoggerService("System", context);
    }

    async health(
        request: HttpRequest,
        context: InvocationContext
    ): Promise<HttpResponseInit> {
        return await this.handle(
            context,
            request,
            (controller: V1SystemController) =>
                controller.health()
        );
    }

}