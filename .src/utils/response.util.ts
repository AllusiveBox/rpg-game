import { isObject } from "@allusivebox/core/dist/.src/utils/types.util";
import { IResponseObject } from "../models/api";

/**
 *
 * Checks if the object is a {@link IResponseObject} object.
 *
 * @param {unknown} arg The value to check.
 * @returns {boolean} `true` if the provided value is a {@link IResponseObject}, otherwise `false`.
 *
 */
export function isJsonResponse<T extends object>(
    arg: unknown
): arg is IResponseObject<T> {
    return isObject(arg)
        && "jsonBody" in arg;
}