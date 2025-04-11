import { Maybe } from "@allusivebox/core";
import { isEmptyObject } from "@allusivebox/core/dist/.src/utils/object.util";
import { isEmptyString } from "@allusivebox/core/dist/.src/utils/string.util";
import {
    isArray,
    isDate,
    isError,
    isNotNullOrUndefined,
    isNullOrUndefined,
    isObject,
    isString
} from "@allusivebox/core/dist/.src/utils/types.util";
import { ControllerBase } from "../../controller.base";

/**
 *
 * Abstract class containing basic functionality for API Controllers in this project.
 *
 * @class V1ControllerBase
 * @extends ControllerBase
 * @abstract
 *
 */
export abstract class V1ControllerBase extends ControllerBase {

    /**
     *
     * Wraps around the fetch API to make a request and attempt to parse the response as JSON.
     *
     * @param {string} url The URL that is being requested.
     * @param {RequestInit & {method: string}} options The Fetch options used to perform the request.
     * @returns {Promise<Response>}
     * @private
     * @throws {TypeError} If the provided `url` is `null`, `undefined` or an Empty String.
     * @throws {TypeError} If the provided `options` object does not have a `method` field that is a string.
     * @throws {FetchErrorLike} If the `fetch` method throws an Error.
     * @throws {SyntaxError} If the response fails to parse.
     *
     */
    async #makeRequest(
        url: string,
        options: RequestInit & { method: string }
    ): Promise<Response> {
        // Validate
        if (
            isNullOrUndefined(url)
            || isEmptyString(url)
        ) {
            throw new TypeError("Cannot perform request without URL", {
                cause: 'Either empty string, null, or undefined provided for "url"'
            });
        }

        if (isEmptyString(options.method)) {
            throw new TypeError("Cannot perform request without method");
        }

        this.logger.debug(`Attempting [${options.method}] request: ${url}`);
        return await fetch(url, options);
    }

    /**
     *
     * Helper method that parses a given value to determine the correct "invalid type" string to return.
     *
     * @param {unknown} arg The value to parse.
     * @returns {string} A string indicating the invalid type. Validates against Arrays and Dates.
     *
     */
    protected getInvalidType(
        arg: unknown
    ): string {
        if (isArray(arg)) {
            return "Array";
        } else if (isDate(arg)) {
            return "Date";
        } else if (isObject(arg)) {
            return "Object";
        } else {
            return typeof arg;
        }
    }

    /**
     *
     * Helper method that validates the provided data is not `null`, `undefined`, or an empty
     * object.
     *
     * @param {unknown} input The input to validate
     * @returns {boolean} `true` if the provided `input` is `null`, `undefined`, or an empty object, otherwise
     * `false`.
     * @protected
     *
     */
    protected isInvalidInputObject(
        input: unknown
    ): input is never {
        return isNullOrUndefined(input)
            || isEmptyObject(input!);
    }

    /**
     *
     * Logs an unknown Error value. Logs the whole value to the `debug` console before parsing it into an Error and
     * logging the Error object at the `error` level.
     * <br />
     * <b>Note</b>: This method deletes the `stack` property from the Error object before logging at the `error`
     * level. The `stack` will still be included in the `verbose` logs, if those are captured.
     * <br />
     * <b>Note</b>: This method returns the unknown `e` value as a base Error object if it wasn't an Error, or the
     * Error that was thrown, if it was.
     *
     * @param {unknown} e The unknown value that was thrown.
     * @returns {Error} The Error that was logged, so it can be used further, if necessary.
     * @protected
     *
     */
    protected logUnknownError(
        e: unknown
    ): Error {
        this.logger.debug(e);

        let error: Error;
        if (isError(e)) {
            error = e;
        } else if (isString(e)) {
            error = new Error(e);
        } else {
            error = new Error("Unexpected Error during processing", {
                cause: e
            });
        }

        const stack: Maybe<string> = error.stack;

        // Delete the Stack so it doesn't get captured in the Error logs
        delete error.stack;

        this.logger.error(error);
        if (isNotNullOrUndefined(stack)) {
            this.logger.verbose(stack);
        }

        return error;
    }

    /**
     *
     * Attempts to make a GET request using the Node.js Fetch API.
     *
     * @param {string} url The URL that is being requested.
     * @param {?RequestInit} [options={ method: "GET" }] The Fetch options used to perform the request.
     * @returns {Promise<Response>} The response from the external service.
     * @protected
     * @throws {TypeError} If the provided `options` object has a `method` that is not `get`.
     *
     */
    protected async tryGet(
        url: string,
        options: RequestInit = { method: "GET" }
    ): Promise<Response> {
        // Ensure method is set before accessing it
        options.method = isString(options.method)
            ? options.method.toUpperCase()
            : "GET";

        // Validatenget
        if (options.method !== "GET") {
            throw new TypeError(`Cannot perform GET request with ${options.method}`, {
                cause: `Unsupported request type: ${options.method}`
            });
        }

        return await this.#makeRequest(url, options as any);
    }

}