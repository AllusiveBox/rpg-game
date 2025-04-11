import { LoggerService } from "../services";

/**
 *
 * Abstract class containing basic functionality for all Controllers in this project.
 *
 * @class ControllerBase
 * @abstract
 *
 */
export abstract class ControllerBase {

    /**
     *
     * The Logger used by the Controller.
     *
     * @type {LoggerService}
     * @private
     * @readonly
     *
     */
    readonly #logger: LoggerService;

    /**
     *
     * Abstract Constructor that creates a new {@link V1ControllerBase} instance.
     *
     * @param {LoggerService} logger The Logger that will be used by the Controller instance.
     * @protected
     * @constructor
     * @abstract
     *
     */
    protected constructor(
        logger: LoggerService
    ) {
        this.#logger = logger;
    }

    /**
     *
     * The Logger instance used by the Controller.
     *
     * @returns {LoggerService}
     *
     */
    get logger(): LoggerService {
        return this.#logger;
    }

}