import { Cookie } from "@azure/functions";

/**
 *
 * Base response object structure.
 *
 * @interface IResponseBase
 *
 */
interface IResponseBase {

    /**
     *
     * HTTP response status code.
     *
     * @type {number}
     *
     */
    status: number;

    /**
     *
     * HTTP response headers.
     *
     * @type {Record<string, string>}
     *
     */
    headers: Record<string, string>;

    /**
     *
     * HTTP response cookies.
     *
     * @type {?Array<Cookie>}
     *
     */
    cookies?: Array<Cookie>;

}

/**
 *
 * A response object with a response body.
 *
 * @interface IResponseBody
 * @extends IResponseBase
 *
 */
export interface IResponseBody extends IResponseBase {

    /**
     *
     * HTTP response body.
     *
     * @type {?BodyInit}
     *
     */
    body?: BodyInit;

}

/**
 *
 * A response object with a JSON response body.
 *
 * @interface IResponseObject
 * @extends IResponseBase
 * 
 */
export interface IResponseObject<TBody extends object> extends IResponseBase {

    /**
     *
     * A JSON-serializable HTTP response body.
     *
     * @type {?TBody}
     * @template {object} TBody
     *
     */
    jsonBody?: TBody;

}

/**
 *
 * Type alias used to indicate the response type possibilities.
 *
 * @type IResponse
 *
 */
export type IResponse<TObject extends object = never> =
    (IResponseBody | IResponseObject<TObject>);