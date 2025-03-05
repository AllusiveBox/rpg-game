import { InvocationContext } from "@azure/functions";
import { LoggerService } from "./logger.service";

/**
 *
 * A child logger spawned by a parent {@link LoggerService} instance.
 *
 * @class ChildLogger
 * @extends LoggerService
 *
 */
export class ChildLogger extends LoggerService {

    readonly #parent: LoggerService;

    /**
     *
     * Static method that checks if the provided value is a {@link ChildLogger} instance.
     *
     * @param {unknown} arg The value to check.
     * @returns {boolean} `true` if the provided value is a {@link ChildLogger}, otherwise `false`.
     * @static
     *
     */
    static isChildLogger(
        arg: unknown
    ): arg is ChildLogger {
        return arg instanceof ChildLogger;
    }

    /**
     *
     * Creates a new {@link ChildLogger} instance.
     *
     * @param {string} name The name of the child logger.
     * @param {InvocationContext} context The Azure Context for the run.
     * @param {LoggerService} parent The parent {@link LoggerService} that is creating this child.
     * @constructor
     *
     */
    constructor(
        name: string,
        context: InvocationContext,
        parent: LoggerService
    ) {
        super(name, context);

        this.#parent = parent;
    }

    get parent(): LoggerService {
        return this.#parent;
    }

}