import {
    ApiResponse,
    IResponse
} from "../../../models/api";
import { LoggerService } from "../../../services";
import { V1ControllerBase } from "./v1.controller.base";

/**
 *
 * Class containing all the business logic related to `system` level API routes.
 *
 * @class V1SystemController
 * @extends V1ControllerBase
 *
 */
export class V1SystemController extends V1ControllerBase {

    /**
     *
     * Creates a new {@link V1SystemController} instance.
     *
     * @param {LoggerService} logger The Logger that will be used by the controller.
     * @constructor
     *
     */
    constructor(
        logger: LoggerService
    ) {
        super(logger);
    }

    /**
     *
     * Simple endpoint to check if the API is running.
     *
     * @returns {Promise<IResponse<{body: string}>>} The response from the API.
     *
     */
    async health(): Promise<IResponse<{ body: string }>> {
        return new ApiResponse<{ body: string }>()
            .data(
                "body",
                "OK"
            )
            .ok();
    }

}