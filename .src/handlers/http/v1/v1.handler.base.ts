import {
    isError,
    isNotNullOrUndefined,
    isNullOrUndefined,
    isString
} from "@allusivebox/core/dist/.src/utils/types.util";
import {
    HttpRequest,
    HttpResponseInit,
    InvocationContext
} from "@azure/functions";
import { V1ControllerBase } from "../../../controllers/api/v1/v1.controller.base";
import {
    ApiResponse,
    IResponse,
    IResponseBody,
    IResponseObject
} from "../../../models/api";
import { HttpFunction } from "../../../models/internal";
import { LoggerService } from "../../../services";
import { ContentTypes } from "../../../shared";
import { isJsonResponse } from "../../../utils/response.util";

/**
 *
 * Abstract class containing basic functionality for API Handlers in this project.
 *
 * @class V1HandlerBase
 * @abstract
 *
 */
export abstract class V1HandlerBase<TController extends V1ControllerBase> {

    /**
     *
     * Method that handles setting the response fields on an object that has a JSON body.
     * @param {LoggerService} logger The logger to use when logging details.
     * @param {(HttpResponseInit & {headers: Record<string, string>})} init The HTTP Response Init object that will
     * be returned to Azure.
     * @param {IResponse<T>} response The response from the Controller run.
     * @returns {HttpResponseInit} The HTTP Response Init object set for Azure.
     * @private
     * @template {object} T
     *
     */
    #handleJsonResponse<T extends object>(
        logger: LoggerService,
        init: (HttpResponseInit & { headers: Record<string, string> }),
        response: IResponseObject<T>
    ): HttpResponseInit {
        logger.debug("Processing JSON response...");
        logger.debug(`Ensuring Headers have "content-type" of "${ContentTypes.ApplicationJson}"...`);

        if (!init.headers["content-type"].includes(ContentTypes.ApplicationJson)) {
            init.headers["content-type"] = ContentTypes.ApplicationJson;
        }

        const jsonBody: Partial<IResponse<T>> = response;
        logger.debug("Removing Headers from JSON response...")
        delete jsonBody.headers;

        logger.debug("Setting JSON response...", jsonBody);
        return {
            ...init,
            jsonBody
        };
    }

    /**
     *
     * Method that handles setting the response fields on an object that has a response body.
     *
     * @param {LoggerService} logger The logger to use when logging details.
     * @param {(HttpResponseInit & {headers: Record<string, string>})} init The HTTP Response Init object that will
     * be returned to Azure.
     * @param {IResponseBody} response The response from the Controller run.
     * @returns {HttpResponseInit} The HTTP Response Init object set for Azure.
     * @private
     *
     */
    #handleBodyResponse(
        logger: LoggerService,
        init: (HttpResponseInit & { headers: Record<string, string> }),
        response: IResponseBody
    ): HttpResponseInit {
        logger.debug(`Processing standard response...`);

        if (isNotNullOrUndefined(response.body)) {
            logger.debug(`Response has standard body; Ensuring Headers have proper "content-type"...`);
            return this.#handleUnknownBody(logger, init, response.body);
        }

        logger.debug('Response has no body; Skipping "content-type" assignment...');
        return init;
    }

    /**
     *
     * Method that handles setting the response fields on an object that has a text body.
     *
     * @param {LoggerService} logger The logger to use when logging details.
     * @param {(HttpResponseInit & {headers: Record<string, string>})} init HTTP Response Init object that will be
     * returned to Azure.
     * @param {string} body The response text from the Controller run.
     * @returns {HttpResponseInit} The HTTP Response Init object set for Azure.
     * @private
     *
     */
    #handleTextBody(
        logger: LoggerService,
        init: (HttpResponseInit & { headers: Record<string, string>}),
        body: string
    ): HttpResponseInit {
        logger.debug(`Response body has text; Ensuring Headers have "content-type" "${ContentTypes.TextHtmlUtf8}"...`);

        init.headers["content-type"] = ContentTypes.TextHtmlUtf8;
        init.body = body;

        logger.debug("Setting body...", body);
        return init;
    }

    /**
     *
     * Method that handles setting the response fields on an object that has an unknown body type.
     *
     * @param {LoggerService} logger The logger to use when logging details.
     * @param {(HttpResponseInit & {headers: Record<string, string>})} init HTTP Response Init object that will be
     * returned to Azure.
     * @param {unknown} body The response body from the Controller run.
     * @returns {HttpResponseInit} The HTTP Response Init object set for Azure.
     * @private
     *
     */
    #handleUnknownBody(
        logger: LoggerService,
        init: (HttpResponseInit & { headers: Record<string, string> }),
        body: unknown
    ): HttpResponseInit {
        if (isString(body)) {
            return this.#handleTextBody(logger, init, body);
        }

        logger.warn('Unrecognized body type; Skipping "content-type" assignment...');
        logger.debug("Setting body...", body);

        init.body = body as any;
        return init;
    }

    /**
     *
     * Parses the response from the {@link HttpFunction} into a format that can be processed by Azure.
     *
     * @param {LoggerService} logger The logger to use when logging details.
     * @param {IResponse<T>} response The response from the Controller run.
     * @returns {HttpResponseInit} The HTTP Response Init object set for Azure.
     * @protected
     * @template {object} T
     *
     */
    protected parseResponse<T extends object>(
        logger: LoggerService,
        response: IResponse<T>
    ): HttpResponseInit {
        logger.debug("Attempting to set HTTP response...");

        if (
            isNullOrUndefined(response)
            || isNullOrUndefined(response.status)
        ) {
            logger.warn("Unable to determine HTTP response; No Status Code detected");
            return {};
        }

        const init: (HttpResponseInit & { headers: Record<string, string> }) = {
            status: response.status,
            headers: response.headers
        };
        logger.debug("Response init", init);

        if (response.status === 204) {
            logger.debug(`Response set to "No Content"`);
            return init;
        }

        if (isJsonResponse(response)) {
            return this.#handleJsonResponse(logger, init, response);
        }

        return this.#handleBodyResponse(logger, init, response);
    }

    /**
     *
     * Abstract method responsible for generating a new controller instance for the Handler.
     *
     * @param {LoggerService} logger The Logger that will be used by the Controller.
     * @returns {TController} A new controller instance for the handler.
     * @template {object} TController
     *
     */
    abstract getController(
        logger: LoggerService
    ): TController;

    /**
     *
     * Abstract method responsible for generating the logger instance for the Handler.
     *
     * @param {InvocationContext} context The Azure Function context associated with this run.
     * @returns {LoggerService}
     *
     */
    abstract getLogger(
        context: InvocationContext
    ): LoggerService;

    async handle<TObject extends object>(
        context: InvocationContext,
        req: HttpRequest,
        func: HttpFunction<TController, TObject>
    ): Promise<HttpResponseInit> {
        const logger: LoggerService = this.getLogger(context);

        const functionName: string = context.functionName;
        logger.debug(`Function Name: ${functionName}`);

        const invocationId: string = context.invocationId;
        logger.debug(`Invocation ID: ${invocationId}`);

        const jobId: string = `${functionName} (${invocationId})`;
        logger.debug(`Job ID: ${jobId}`);

        logger.trace(`Preparing to execute job ${jobId}...`);

        let response: IResponse<TObject>;
        try {
            response = await func(this.getController(logger));
        } catch (e: unknown) {
            logger.debug(e);

            let error: Error;
            if (isError(e)) {
                error = e;
            } else {
                error = new Error("Unexpected Error during processing", { cause: e });
            }

            logger.trace(error);
            logger.error(error.message);

            if (isNotNullOrUndefined(error.cause)) {
                logger.trace(error.cause);
            }

            const bufferRes: ApiResponse = new ApiResponse()
                .addError(error.message);

            if (isString(error.cause)) {
                bufferRes.addError(error.cause);
            }

            response = bufferRes.internalServerError();
        }

        return this.parseResponse(logger, response);
    }

}