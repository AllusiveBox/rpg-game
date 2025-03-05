import { ExtendedError } from "@allusivebox/core";

/**
 *
 * A Custom Error instance used to indicate an attempt at overwriting a stored value that is not supposed to be
 * written over.
 *
 * @class OverrideError
 * @extends ExtendedError
 *
 */
export class OverrideError extends ExtendedError {

    /**
     *
     * Creates a new {@link OverrideError} instance.
     *
     * @param {PropertyKey} key The key that is attempting to be set to.
     * @param {unknown} storedValue The value already stored that would be overwritten.
     * @param {unknown} newValue The value attempted to be set on top of the already stored value.
     * @constructor
     *
     */
    constructor(
        key: PropertyKey,
        storedValue: unknown,
        newValue: unknown
    ) {
        super(`Unable to set ${String(key)}; Value already set with ${storedValue}`, {
            cause: `Attempted to set "${String(key)}"; Value already set with "${newValue}"`
        });

        this.name = this.constructor.name;
    }

}