import { IResponse } from "../api";

/**
 *
 * Type alias used to indicate a method definition that is used for HTTP requests.
 *
 * @type {HttpFunction}
 *
 */
export type HttpFunction<TController, TObject extends object> =
    (controller: TController) => Promise<IResponse<TObject>>;