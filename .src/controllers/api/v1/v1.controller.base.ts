import { isEmptyObject } from "@allusivebox/core/dist/.src/utils/object.util";
import {
    isArray,
    isDate,
    isNullOrUndefined,
    isObject
} from "@allusivebox/core/dist/.src/utils/types.util";
import { LoggerService } from "../../../services";

/**
 *
 * Abstract class containing basic functionality for API Controllers in this project.
 *
 * @class V1ControllerBase
 * @abstract
 *
 */
export abstract class V1ControllerBase {

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
     * The Logger instance used by the Controller.
     *
     * @returns {LoggerService}
     *
     */
    get logger(): LoggerService {
        return this.#logger;
    }

}