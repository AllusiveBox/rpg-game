import { IResponse } from "../../models/api";
import { ControllerBase } from "../controller.base";

/**
 *
 * Abstract class containing basic functionality for all views (HTML pages) in this project.
 *
 * @class ViewControllerBase
 * @extends ControllerBase
 *
 */
export abstract class ViewControllerBase extends ControllerBase {

    /**
     *
     * Displays the associated page details.
     *
     * @param {unknown} args Any arguments passed to the method.
     * @returns {Promise<IResponse<{body: string}>>} The response from the server.
     * @abstract
     *
     */
    public abstract view(
        ...args: Array<unknown>
    ): Promise<IResponse<{ body: string }>>;
}