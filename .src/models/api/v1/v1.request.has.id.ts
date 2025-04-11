import { HttpRequest } from "@azure/functions";

/**
 *
 * Extended interface indicating an HTTP Request that has an `id` parameter in the URL.
 *
 * @interface V1RequestHasId
 * @extends HttpRequest
 *
 */
export interface V1RequestHasId extends HttpRequest {

    readonly params: {

        /**
         *
         * The unique ID for an external resource.
         *
         * @type {string}
         *
         */
        id: string;

    }

}