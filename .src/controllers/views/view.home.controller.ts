import { HttpRequest } from "@azure/functions";
import fs from "fs";
import {
    ApiResponse,
    IResponse
} from "../../models/api";
import { LoggerService } from "../../services";
import { ViewControllerBase } from "./view.controller.base";


/**
 *
 * Class containing all the business logic related to `home` level routes.
 *
 * @class ViewHomeController
 * @extends ViewControllerBase
 *
 */
export class ViewHomeController extends ViewControllerBase {

    /**
     *
     * Creates a new {@link ViewHomeController} instance.
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

    public async view(
        request: HttpRequest
    ): Promise<IResponse<{ body: string }>> {
        const html: Buffer = fs.readFileSync(`${__dirname}/assets/views/home/home.html`);

        console.log(html);

        return new ApiResponse<{ body: string }>()
            .data("body", "OK")
            .ok();
    }

}