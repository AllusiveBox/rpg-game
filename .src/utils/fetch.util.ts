import { Nullable } from "@allusivebox/core";
import {
    isError,
    isObject
} from "@allusivebox/core/dist/.src/utils/types.util";

export type FetchErrorLike = Error;

/**
 *
 * Helper function that handles the parsing of an unknown Error thrown by parsing a fetch Response and safely wraps it
 * into a Syntax Error.
 * <br />
 * <b>Note</b>: While the Error passed to this method is typed as `unknown`, it should always be an actual Error
 * object, however, since JavaScript can throw anything, not just Error objects, this method is designed to safely
 * wrap around non-Error objects as well with a default Syntax Error message.
 *
 * @param {unknown} parsingError The unknown error that needs to be parsed into a Syntax Error.
 * @param {string}  parseAction  The parsing action that was being performed that failed.
 * @returns {never}
 * @throws {SyntaxError} After setting the Error fields, always throws a Syntax Error.
 *
 */
function handleResponseParsingError(
    parsingError: unknown,
    parseAction: "JSON" | "text"
): never {
    let error: SyntaxError;
    /* istanbul ignore if */
    if (isError(parsingError)) {
        error = new SyntaxError(parsingError.message);
    } else {
        error = new SyntaxError(`Error parsing response ${parseAction}`);
    }

    /*
     Assign cause via brace notation due to inability to update package to use JavaScript version that actually
     supports the cause field without breaking other stuff.
     */
    error["cause"] = error;
    throw error;
}

/**
 *
 * Indicates if a provided value is FetchError-like object.
 * <br />
 * <b>Note</b>: For whatever reason FetchError is not an exposed class in Node, so the best way to do this, that
 * I've found, is based off this Stack Overflow answer:
 * <br />
 * https://stackoverflow.com/questions/75066601/how-to-access-fetcherror-class-in-nodejs
 *
 * @param {unknown} arg
 * @returns {boolean} `true` if the provided value is a {@link FetchErrorLike}-like object, otherwise, false.
 *
 */
export function isFetchErrorLike(
    arg: unknown
): arg is FetchErrorLike {
    return isError(arg)
        && isObject(arg.cause)
        && "code" in arg.cause
        && arg.cause.code === "ENETUNREACH"
}

/**
 *
 * Parses the response body from a Fetch request to JSON.
 *
 * @param {Response} response The response to parse as JSON.
 * @returns {Promise<Nullable<T>>} The response object parsed as JSON, or `null`, if parsing the object fails.
 * @template {unknown} T
 *
 */
export async function parseResponseAsJson<T>(
    response: Response
): Promise<Nullable<T>>;

/**
 *
 * Parses the response body from a Fetch request to JSON.
 *
 * @param {Response} response
 * @param {boolean}  errorOnFailedParse When `false`, will cause `null` to be returned if parsing fails.
 * @return {Promise<Nullable<T>>} The response object parsed as JSON.
 * @template {unknown} T
 * @throws {SyntaxError} If the `response` fails to parse when `errorOnFailedParse` is `true`.
 *
 */
export async function parseResponseAsJson<T, B extends boolean>(
    response: Response,
    errorOnFailedParse: B
): Promise<B extends false ? Nullable<T> : T>;

/**
 *
 * Parses the response body from a Fetch request to JSON.
 *
 * @param {Response} response           The response to parse as JSON.
 * @param {?boolean} errorOnFailedParse Indicates if the function should error when it fails to parse. Defaults to
 * `false`.
 * @returns {Promise<Nullable<T>>} The response object parsed as JSON. Can be `null`, if parsing the object fails.
 * @template T
 * @throws {SyntaxError} If the `response` fails to parse when `errorOnFailedParse` is `true`.
 *
 */
export async function parseResponseAsJson<T, B extends boolean>(
    response: Response,
    errorOnFailedParse: B = false as B
): Promise<B extends false ? Nullable<T> : T> {
    let results: Nullable<T> = null;
    try {
        results = await response.json() as T;
    } catch (error) {
        if (errorOnFailedParse) {
            handleResponseParsingError(error, "JSON");
        }
    }

    return results as T;
}

/**
 *
 * Parses the response body from a Fetch request to plain text.
 *
 * @param {Response} response The response to parse as text.
 * @return {Promise<Nullable<string>>} The response object parsed as plain text.
 *
 */
export async function parseResponseAsText(
    response: Response
): Promise<Nullable<string>>;

/**
 *
 * Parses the response body from a Fetch request to plain text.
 *
 * @param {Response} response           The response to parse as text.
 * @param {boolean}  errorOnFailedParse Indicates if the function should Error when it fails to parse.
 * @return {Promise<Nullable<string>>} The response object parsed as plain text.
 * @throws {SyntaxError} If the `response` fails to parse when `errorOnFailedParse` is `true`.
 *
 */
export async function parseResponseAsText<B extends boolean>(
    response: Response,
    errorOnFailedParse: B
): Promise<B extends false ? Nullable<string> : string>;

/**
 *
 * Parses the response body from a Fetch request to plain text.
 *
 * @param {Response} response                  The response to parse as text.
 * @param {boolean} [errorOnFailedParse=false] Indicates if the function should Error when it fails to parse.
 * @return {Promise<Nullable<string>>} The response object parsed as plain text.
 * @throws {SyntaxError} If the `response` fails to parse when `errorOnFailedParse` is `true`.
 *
 */
export async function parseResponseAsText<B extends boolean>(
    response: Response,
    errorOnFailedParse: B = false as B
): Promise<B extends false ? Nullable<string> : string> {
    let results: Nullable<string> = null;
    try {
        results = await response.text();
    } catch (error) {
        if (errorOnFailedParse) {
            handleResponseParsingError(error, "text");
        }
    }

    return results as string;
}