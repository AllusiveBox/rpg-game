import { Nullable } from "@allusivebox/core";
import { isNonEmptyArray } from "@allusivebox/core/dist/.src/utils/array.util";
import { isEmptyString } from "@allusivebox/core/dist/.src/utils/string.util";
import {
    getType,
    isNotNullOrUndefined,
    isNotObject,
    isNotString,
    isNullOrUndefined
} from "@allusivebox/core/dist/.src/utils/types.util";
import { InvocationContext } from "@azure/functions";
import { ChildLogger } from "./child.logger";

/**
 *
 * A service that wraps around the Azure {@link InvocationContext} object to provide uniform logging.
 *
 * @class LoggerService
 *
 */
export class LoggerService {

    readonly #context: InvocationContext;

    readonly #displayDebug: boolean;

    readonly #name: string;

    /**
     *
     * Static method that checks if the provided value is a {@link LoggerService} instance.
     *
     * @param {unknown} arg The value to check.
     * @returns {boolean} `true` if the provided value is a {@link LoggerService}, otherwise `false`.
     * @static
     *
     */
    static isLoggerService(
        arg: unknown
    ): arg is LoggerService {
        return arg instanceof LoggerService;
    }

    /**
     *
     * Creates a new {@link LoggerService} instance.
     *
     * @param {string} name The name of the current Logger.
     * @param {InvocationContext} context The Azure Context for the run.
     * @constructor
     * @throws {AggregateError} If either the provided values are invalid.
     *
     */
    constructor(
        name: string,
        context: InvocationContext
    ) {
        // Validate
        this.#validate(name, context);

        this.#name = name.toUpperCase();
        this.#context = context;
        this.#displayDebug = process.env["NODE_ENV"] !== "production";
    }

    /**
     *
     * Validates the supplied input.
     *
     * @param {string} name The name for the logger.
     * @param {InvocationContext} context The context object for the logger.
     * @private
     * @throws {AggregateError} If either the provided values are invalid.
     *
     */
    #validate(
        name: string,
        context: InvocationContext
    ): void {
        const errors: Array<TypeError> = new Array<TypeError>();

        const nameError: Nullable<TypeError> = this.#validateName(name);
        if (isNotNullOrUndefined(nameError)) {
            errors.push(nameError);
        }

        const contextError: Nullable<TypeError> = this.#validateContext(context);
        if (isNotNullOrUndefined(contextError)) {
            errors.push(contextError);
        }

        if (isNonEmptyArray(errors)) {
            throw new AggregateError(errors, "Unable to build logger due to Error(s)");
        }
    }

    /**
     *
     * Validates the provided {@link InvocationContext} object.
     *
     * @param {InvocationContext} context The Azure Context object to validate.
     * @returns {Nullable<TypeError>} `null` if no validation Error, otherwise a `TypeError`.
     * @private
     *
     */
    #validateContext(
        context: InvocationContext
    ): Nullable<TypeError> {
        if (isNullOrUndefined(context)) {
            return new TypeError('Value "context" cannot be null or undefined');
        } else if (isNotObject(context)) {
            return new TypeError('Invalid type for "context"; Must be an object', {
                cause: `Expected object; Received ${getType(context)} (${context})`
            });
        }

        return null;
    }

    /**
     *
     * Validates the provided name for the {@link LoggerService} instance.
     *
     * @param {string} name The name to validate.
     * @returns {Nullable<TypeError>} `null` if no validation Error, otherwise a `TypeError`.
     * @private
     *
     */
    #validateName(
        name: string
    ): Nullable<TypeError> {
        if (isNullOrUndefined(name)) {
            return new TypeError('Value "name" cannot be null or undefined');
        } else if (isEmptyString(name)) {
            return new TypeError('Value "name" cannot be an empty string');
        } else if (isNotString(name)) {
            return new TypeError('Invalid type for "name"; Must be a string', {
                cause: `Expected string; Received ${getType(name)} (${name})`
            });
        }

        return null;
    }

    /**
     *
     * Creates a child {@link LoggerService} instance using this logger as the parent.
     *
     * @param {string} name The name of the Child logger.
     * @returns {ChildLogger} The newly created logger.
     *
     */
    createChild(
        name: string
    ): ChildLogger {
        this.debug(`Creating new child logger for ${this.#name}...`);

        return new ChildLogger(`${this.#name}:${name}`, this.#context, this);
    }

    /**
     *
     * Logs details at the `debug` level.
     *
     * @param {unknown} args The data to log.
     * @returns {void}
     *
     */
    debug(
        ...args: Array<unknown>
    ): void {
        if (this.#displayDebug) {
            console.debug(`[${this.#name}]`, ...args);
        }
    }

    /**
     *
     * Logs details at the `trace` level.
     *
     * @param {unknown} args The data to log.
     * @returns {void}
     *
     */
    trace(
        ...args: Array<unknown>
    ): void {
        this.#context.trace(`[${this.#name}]`, ...args);
    }

    /**
     *
     * Logs details at the `verbose` level.
     * <br />
     * <b>Note</b>: The `verbose` level is tagged as `debug` in Azure.
     *
     * @param {unknown} args The data to log.
     * @returns {void}
     *
     */
    verbose(
        ...args: Array<unknown>
    ): void {
        this.#context.debug(`[${this.#name}]`, ...args);
    }

    /**
     *
     * Logs details at the `info` level.
     *
     * @param {unknown} args The data to log.
     * @returns {void}
     *
     */
    info(
        ...args: Array<unknown>
    ): void {
        this.#context.info(`[${this.#name}]`, ...args);
    }

    /**
     *
     * Logs details at the `warning` level.
     *
     * @param {unknown} args The data to log.
     * @returns {void}
     *
     */
    warn(
        ...args: Array<unknown>
    ): void {
        this.#context.warn(`[${this.#name}]`, ...args);
    }

    /**
     *
     * Logs details at the `error` level.
     *
     * @param {unknown} args The data to log.
     * @returns {void}
     *
     */
    error(
        ...args: Array<unknown>
    ): void {
        this.#context.error(`[${this.#name}]`, ...args);
    }

}