import {
    HttpResponseInit,
    InvocationContext
} from "@azure/functions";
import { V1GaiaController } from "../../../controllers/api/v1/v1.gaia.controller";
import { V1RequestHasId } from "../../../models/api";
import { LoggerService } from "../../../services";
import { V1HandlerBase } from "./v1.handler.base";

export class V1GaiaHandler extends V1HandlerBase<V1GaiaController> {

    getController(
        logger: LoggerService
    ): V1GaiaController {
        return new V1GaiaController(logger);
    }

    getLogger(
        context: InvocationContext
    ): LoggerService {
        return new LoggerService("Gaia", context);
    }

    async getThread(
        request: V1RequestHasId,
        context: InvocationContext
    ): Promise<HttpResponseInit> {
        return await this.handle(
            context,
            request,
            (controller: V1GaiaController) =>
                controller.getThreadDetails(request.params.id)
        );
    }

}