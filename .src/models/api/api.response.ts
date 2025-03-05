import {
    EmptyObject,
    Maybe,
    Nullable
} from "@allusivebox/core";
import { isNonEmptyArray } from "@allusivebox/core/dist/.src/utils/array.util";
import { isNonEmptyObject } from "@allusivebox/core/dist/.src/utils/object.util";
import {
    isArray,
    isNotNullOrUndefined,
    isNotUndefined
} from "@allusivebox/core/dist/.src/utils/types.util";
import { OverrideError } from "../errors";
import { IResponse } from "./i.response";

/**
 *
 * Class used to represent the response from an API. Modeled after the builder pattern.
 *
 * @class ApiResponse
 *
 */
export class ApiResponse<T extends object = EmptyObject> {

    readonly #data: T;

    #errors: Array<string>;

    readonly #headers: Record<string, string>;

    #reason: string;

    #status: number;

    #success: boolean;

    #timestamp: string;

    #warnings: Array<string>;

    /**
     *
     * Creates a new {@link ApiResponse} instance.
     *
     * @constructor
     *
     */
    constructor() {
        this.#data = {} as T;
        this.#errors = new Array<string>();
        this.#headers = {};
        this.#warnings = new Array<string>();
    }

    #build(
        reason: string,
        status: number
    ): IResponse<T> {
        this.#reason = reason;
        this.#status = status;
        this.#success = status >= 200 && status <= 299;
        this.#timestamp = new Date().toISOString();

        return this.toJSON();
    }

    get #this(): (this & T) {
        return this as (this & T);
    }

    /**
     *
     * Sets the response to success status code.
     *
     * @param {string} reason The reason for the success.
     * @param {number} status The status code.
     * @returns {IResponse<T>}
     * @protected
     * @template {object} T
     *
     */
    protected successful(
        reason: string,
        status: number
    ): IResponse<T> {
        return this.#build(reason, status);
    }

    /**
     *
     * Sets the response to a failed status code.
     *
     * @param {string} reason The reason for the failure.
     * @param {number} status The status code.
     * @param {?Array<string>} [errors] An Array of Errors. Optional.
     * @returns {IResponse<T>}
     * @protected
     * @template {object} T
     *
     */
    protected failed(
        reason: string,
        status: number,
        errors?: Array<string>
    ): IResponse<T> {
        if (
            isNotNullOrUndefined(errors)
            && isNonEmptyArray(errors)
        ) {
            this.addErrors(errors);
        }

        return this.#build(reason, status);
    }

    public addError(
        error: string
    ): (this & T) {
        this.#errors.push(error);

        return this.#this;
    }

    public addErrors(
        errors: Array<string>
    ): (this & T);

    public addErrors(
        ...errors: Array<string>
    ): (this & T);

    public addErrors(
        arg: (Array<string> | string),
        ...additionalArgs: Array<string>
    ): (this & T) {
        let errors: Array<string> = isArray(arg) ? arg : [arg];

        if (
            isNotNullOrUndefined(additionalArgs)
            && isNonEmptyArray(additionalArgs)
        ) {
            errors = errors.concat(additionalArgs);
        }

        this.#errors = this.#errors.concat(errors);
        return this.#this;
    }

    public addWarning(
        warning: string
    ): (this & T) {
        this.#warnings.push(warning);

        return this.#this;
    }

    public addWarnings(
        warnings: Array<string>
    ): (this & T);

    public addWarnings(
        ...warnings: Array<string>
    ): (this & T);

    public addWarnings(
        arg: (Array<string> | string),
        ...additionalArgs: Array<string>
    ): (this & T) {
        let warnings: Array<string> = isArray(arg) ? arg : [arg];

        if (
            isNotNullOrUndefined(additionalArgs)
            && isNonEmptyArray(additionalArgs)
        ) {
            warnings = warnings.concat(additionalArgs);
        }

        this.#warnings = this.#warnings.concat(warnings);
        return this.#this;
    }

    public data<K extends keyof T>(
        key: T extends EmptyObject ? never : K,
        value: T[K]
    ): (this & T) {
        this.#data[key as PropertyKey] = value;

        return this.#this;
    }

    public get<K extends keyof T>(
        key: T extends EmptyObject ? never : K,
    ): Nullable<T[K]> {
        return this.#data[key] || null;
    }

    public set<K extends keyof T>(
        key: T extends EmptyObject ? never : K,
        value: T[K],
    ): (this & T) {
        const storedValue: Maybe<T[K]> = this.#data[key];

        if (isNotUndefined(storedValue)) {
            throw new OverrideError(key, storedValue, value);
        }

        return this.data(key, value);
    }

    public setHeader(
        header: string,
        value: string,
        overrideIfSet: boolean
    ): (this & T) {
        const bufferHeader: Nullable<string> = this.#headers[header];
        if (
            isNotNullOrUndefined(bufferHeader)
            && !overrideIfSet
        ) {
            throw new OverrideError(header, bufferHeader, value);
        } else {
            this.#headers[header.toLocaleLowerCase()] = value;
        }

        return this.#this;
    }

    public toString(): string {
        return `${this.#status}: ${this.#reason}`;
    }

    public toJSON(): IResponse<T> {
        let init: IResponse<T> = {
            status: this.#status,
            headers: this.#headers
        };
        if (
            isNonEmptyObject(this.#data)
            && "body" in this.#data
        ) {
            init["body"] = this.#data.body as any;
        } else if (isNonEmptyObject(this.#data)) {
            init["jsonBody"] = this.#data;
        }

        return init;
    }

    /**
     *
     * Sets the response to Status Code `200` and reason to `OK`.
     *
     * @returns {IResponse<T>}
     * @template {object} T
     *
     */
    public ok(): IResponse<T> {
        return this.successful("OK", 200);
    }

    /**
     *
     * Sets the response to Status Code `400` and reason to `Bad Request`.
     *
     * @returns {IResponse<T>}
     * @template {object} T
     *
     */
    public badRequest(): IResponse<T> {
        return this.failed("Bad Request", 400);
    }

    /**
     *
     * Sets the response to Status Code `500` and reason to `Internal Server Error`.
     *
     * @returns {IResponse<T>}
     * @template {object} T
     *
     */
    public internalServerError(): IResponse<T> {
        return this.failed("Internal Server Error", 500);
    }

    get errors(): ReadonlyArray<string> {
        return Object.freeze(this.#errors);
    }

    get headers(): Readonly<Record<string, string>> {
        return Object.freeze(this.#headers);
    }

    get reason(): Readonly<string> {
        return this.#reason;
    }

    get status(): Readonly<number> {
        return this.#status;
    }

    get success(): Readonly<boolean> {
        return this.#success;
    }

    get timestamp(): Readonly<string> {
        return this.#timestamp;
    }

    get warnings(): ReadonlyArray<string> {
        return Object.freeze(this.#warnings);
    }

}