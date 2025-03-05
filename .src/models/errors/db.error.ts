import { ExtendedError } from "@allusivebox/core";
import {
    isError,
    isString
} from "@allusivebox/core/dist/.src/utils/types.util";
import { DbErrorOptions } from "./db.error.options";

/**
 *
 * A Custom Error instance used to indicate an Error with the {@link DbService} during execution.
 *
 * @class DbError
 * @extends ExtendedError
 *
 */
export class DbError extends ExtendedError {

    readonly #code: number;

    /**
     *
     * Creates a new {@link DbError} instance from an unknown value that was thrown during {@link DbService} execution.
     *
     * @param {unknown} error The unknown value that was thrown.
     * @returns {DbError} The newly created {@link DbError} instance.
     *
     */
    static createDbErrorFromUnknown(
        error: unknown
    ): DbError {
        if (isError(error)) {
            return new DbError(error.message, { cause: error, code: 529 });
        } else if (isString(error)) {
            return new DbError(error, { code: 529 });
        }

        // TODO 3/5/2025: Update context to be of type any
        return new DbError("Unexpected Database Error", { context: error as any });
    }

    /**
     *
     * Creates a new {@link DbError} instance with the provided Error message.
     *
     * @param {string} message The message to include alongside the Error.
     * @constructor
     *
     */
    constructor(
        message: string
    );

    /**
     *
     * Creates a new {@link DbError} instance with the provided Error message and configuration settings.
     *
     * @param {string} message The message to include alongside the Error.
     * @param {DbErrorOptions} options Additional options to include alongside the Error message.
     * @constructor
     *
     */
    constructor(
        message: string,
        options: DbErrorOptions
    );

    /**
     *
     * Creates a new {@link DbError} instance using the defaults.
     *
     * @constructor
     *
     */
    constructor();

    constructor(
        message?: string,
        options?: DbErrorOptions
    ) {
        super(
            message || "Unexpected Database Error",
            options
        );

        this.name = this.constructor.name;
        this.#code = options?.code || 500;
    }

    /**
     *
     * The HTTP status code associated with this Error.
     *
     * @returns {number}
     *
     */
    get code(): number {
        return this.#code;
    }

}