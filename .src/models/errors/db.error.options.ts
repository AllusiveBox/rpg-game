import { ExtendedErrorOptions } from "@allusivebox/core";

/**
 *
 * Configuration options for a {@link DbError} instance.
 *
 * @interface DbErrorOptions
 * @extends ExtendedErrorOptions
 *
 */
export interface DbErrorOptions extends ExtendedErrorOptions {

    /**
     *
     * An optional HTTP status code associated with the Error.
     *
     * @type {?number}
     *
     */
    code?: number;

}