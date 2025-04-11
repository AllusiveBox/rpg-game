import { Nullable } from "@allusivebox/core";
import { isEmptyArray } from "@allusivebox/core/dist/.src/utils/array.util";
import { isEmptyString } from "@allusivebox/core/dist/.src/utils/string.util";
import {
    isNotNumber,
    isNullOrUndefined
} from "@allusivebox/core/dist/.src/utils/types.util";
import dayjs from "dayjs";
import {
    ApiResponse,
    IResponse
} from "../../../models/api";
import { GaiaThreadOutput } from "../../../models/api/v1/gaia/gaia.thread.output";
import {
    CheerioService,
    LoggerService
} from "../../../services";
import { parseResponseAsText } from "../../../utils/fetch.util";
import { V1ControllerBase } from "./v1.controller.base";

const EDGE_OF_OBLIVION_BASE_LINK: string =
    "https://www.gaiaonline.com/forum/barton-town-role-play/edge-of-oblivion-death-from-below-open/t.{{id}}/";

// @ts-ignore
const GAIA_ONLINE_BASE_LINK: string = "https://www.gaiaonline.com/forum/t.{{id}}/";

const THREAD_PAGE_ID_OFFSET: 15 = 15;

/**
 *
 * Class containing all the business logic related to `gaia` (GaiaOnline) level API routes.
 *
 * @class V1GaiaController
 * @extends V1ControllerBase
 *
 */
export class V1GaiaController extends V1ControllerBase {

    /**
     *
     * A wrapper around the Cheerio API. Used to parse HTML data.
     *
     * @type {CheerioService}
     * @private
     *
     */
    readonly #cs: CheerioService;

    /**
     *
     * Creates a new {@link V1GaiaController} instance.
     *
     * @param {LoggerService} logger The Logger that will be used by the controller.
     * @constructor
     *
     */
    constructor(
        logger: LoggerService
    ) {
        super(logger);
        this.#cs = new CheerioService(this.logger);
    }

    /**
     *
     * Builds the URL using the Base Gaia link and the supplied ID and page.
     *
     * @param {number} id The ID for the Thread to get.
     * @param {string} page The Gaia Online Thread Page number.
     * @returns {string} The Gaia Online Thread Page URL.
     * @private
     *
     */
    #buildThreadPageUrl(
        id: number,
        page: string
    ): string {
        const pageNumber: number = parseInt(page, 10) - 1;

        let pageThreadId: string;
        if (pageNumber === 0) {
            pageThreadId = `${id}_1`;
        } else {
            const postId: number = (pageNumber * THREAD_PAGE_ID_OFFSET) + 1;
            pageThreadId = `${id}_${postId}`;
        }

        this.logger.debug(`Page Thread ID: ${pageThreadId}`);
        return pageThreadId;
    }

    /**
     *
     * Core logic used to gather the necessary data from Gaia to generate a {@link GaiaThreadOutput} response.
     *
     * @param {string} id The ID for the Thread to get.
     * @param {ApiResponse<GaiaThreadOutput>} response The current API response.
     * @returns {Promise<IResponse<GaiaThreadOutput>>} The results from the current execution.
     * @private
     *
     */
    async #getThreadDetails(
        id: number,
        response: ApiResponse<GaiaThreadOutput>
    ): Promise<IResponse<GaiaThreadOutput>> {
        // Load the Main Page Data
        let wasDataLoaded: boolean = await this.#loadData(`${id}`, response);
        if (!wasDataLoaded) {
            return response;
        }

        if (!this.#getThreadTitle(id, response)) {
            return response;
        }

        if (!this.#getThreadPageCount(id, response)) {
            return response;
        }

        if (!this.#getThreadCreatedBy(id, response)) {
            return response;
        }

        // TODO 4/11/2025: Get Created On - Model it after the lastUpdatedOn logic

        // Load the Last Page Data
        const pages: Array<string> = this.#getThreadPages(id, response);
        if (isNullOrUndefined(pages)) {
            const errorMessage: string = `Unexpected Error parsing Thread: ${id}`;
            this.logger.error(errorMessage);

            return response.addError(errorMessage)
                .internalServerError();
        }

        this.logger.debug(`Calculating last page for Thread: ${id}...`);

        // If there is only one page, then we can default to _1
        const lastPageId: string = pages.at(-1) || `${id}_1`;
        this.logger.debug(`Last page ID calculated as ${lastPageId}...`);

        wasDataLoaded = await this.#loadData(lastPageId, response);
        if (!wasDataLoaded) {
            return response;
        }

        if (!this.#getThreadLastUpdatedBy(id, response)) {
            return response;
        }

        if (!this.#getThreadLastUpdatedOn(id, response)) {
            return response;
        }

        return response.ok();
    }

    /**
     *
     * Parses the currently loaded {@link CheerioService} to get the Created By for a Gaia Thread.
     *
     * @param {number} id The ID for the Thread being parsed.
     * @param {ApiResponse<GaiaThreadOutput>} response The current API response.
     * @returns {boolean} `true` if the Thread Created By was successfully parsed, otherwise `false`.
     * @private
     *
     */
    #getThreadCreatedBy(
        id: number,
        response: ApiResponse<GaiaThreadOutput>
    ): boolean {
        this.logger.debug(`Parsing data for Thread ${id} Created By...`);

        const createdBy: string = this.#cs.selector(".user_name")
            .context("#post-1")
            .execute()
            .text();

        if (isNullOrUndefined(createdBy)) {
            const errorMessage: string = `Unexpected Error parsing Created By for Thread: ${id}`;
            this.logger.error(errorMessage);

            response.addError(errorMessage)
                .internalServerError();

            return false;
        } else if (isEmptyString(createdBy)) {
            const errorMessage: string = `Unable to determine Created By for Thread: ${id}`;
            this.logger.error(errorMessage);

            response.addError(errorMessage)
                .proxyRequestFailed();

            return false;
        }

        this.#cs.clear();
        this.logger.debug("Created By", createdBy);
        response.data("createdBy", createdBy);

        return true;
    }

    /**
     *
     * Parses the currently loaded {@link CheerioService} to get the username for the last posted user.
     *
     * @param {number} id The ID for the Thread being parsed.
     * @param {ApiResponse<GaiaThreadOutput>} response The current API response.
     * @returns {boolean} `true` if the Thread Last Updated By was successfully parsed, otherwise `false`.
     * @private
     *
     */
    #getThreadLastUpdatedBy(
        id: number,
        response: ApiResponse<GaiaThreadOutput>
    ): boolean {
        const lastUpdatedBy: string = this.#cs.selector(".user_name")
            .context("#content")
            .execute()
            .last()
            .text();

        if (isNullOrUndefined(lastUpdatedBy)) {
            const errorMessage: string = `Unexpected Error parsing Last Updated By for Thread: ${id}`;
            this.logger.error(errorMessage);

            response.addError(errorMessage)
                .internalServerError();

            return false;
        } else if (isEmptyString(lastUpdatedBy)) {
            const errorMessage: string = `Unable to determine Last Updated By for Thread: ${id}`;
            this.logger.error(errorMessage);

            response.addError(errorMessage)
                .proxyRequestFailed();

            return false;
        }

        this.#cs.clear();
        this.logger.debug("Last Updated By", lastUpdatedBy);
        response.data("lastUpdatedBy", lastUpdatedBy);

        return true;
    }

    /**
     *
     * Parses the currently loaded {@link CheerioService} to get the Last Updated On.
     *
     * @param {number} id The ID for the Thread being parsed.
     * @param {ApiResponse<GaiaThreadOutput>} response The current API response.
     * @returns {boolean} `true` if the Thread Last Updated On was successfully parsed, otherwise `false`.
     * @private
     *
     */
    #getThreadLastUpdatedOn(
        id: number,
        response: ApiResponse<GaiaThreadOutput>
    ): boolean {
        const timestamp: string = this.#cs.selector(".relative-timestamp")
            .context("#content")
            .execute()
            .last()
            .text();


        if (isNullOrUndefined(timestamp)) {
            const errorMessage: string = `Unexpected Error parsing Last Updated On for Thread: ${id}`;
            this.logger.error(errorMessage);

            response.addError(errorMessage)
                .internalServerError();

            return false;
        } else if (isEmptyString(timestamp)) {
            const errorMessage: string = `Unable to determine Last Updated On for Thread: ${id}`;
            this.logger.error(errorMessage);

            response.addError(errorMessage)
                .proxyRequestFailed();

            return false;
        }

        this.#cs.clear();
        this.logger.debug("Timestamp", timestamp);
        const lastUpdatedOn: string = dayjs.utc(timestamp).toISOString();
        this.logger.debug("Last Updated On", lastUpdatedOn);
        response.data("lastUpdatedOn", lastUpdatedOn);

        return true;
    }

    /**
     *
     * Parses the currently loaded {@link CheerioService} to get the Page Count for a Gaia Thread.
     *
     * @param {number} id The ID for the Thread being parsed.
     * @param {ApiResponse<GaiaThreadOutput>} response The current API response.
     * @returns {boolean} `true` if the Page Count was successfully parsed, otherwise `false`.
     * @private
     *
     */
    #getThreadPageCount(
        id: number,
        response: ApiResponse<GaiaThreadOutput>
    ): boolean {
        this.logger.debug(`Parsing data for Thread ${id} Page Count...`);

        const pages: Array<string> = this.#getThreadPages(id, response);
        if (isNullOrUndefined(pages)) {
            const errorMessage: string = `Unexpected Error parsing Page Count for Thread: ${id}`;
            this.logger.error(errorMessage);

            response.addError(errorMessage)
                .internalServerError();

            return false;
        }

        const pageCount: number = pages.length;

        this.#cs.clear();
        this.logger.debug("Page Count", pageCount);
        response.data("pageCount", pageCount);

        return true;
    }

    /**
     *
     * Parses the currently loaded {@link CheerioService} to get the Pages list for a Gaia Thread.
     *
     * @param {number} id The ID for the Thread being parsed.
     * @param {ApiResponse<GaiaThreadOutput>} response The current API response.
     * @returns {Array<string>} An Array of Thread Page IDs, or an Empty Array, if an Error was reported.
     * @private
     *
     */
    #getThreadPages(
        id: number,
        response: ApiResponse<GaiaThreadOutput>
    ): Array<string> {
        this.logger.debug(`Parsing data for Thread ${id} Pages...`);

        const pages: string = this.#cs.selector("a")
            .context(".pagination_last")
            .execute()
            .text();

        if (isNullOrUndefined(pages)) {
            const errorMessage: string = `Unexpected Error parsing Pages for Thread: ${id}`;
            this.logger.error(errorMessage);

            response.addError(errorMessage)
                .internalServerError();

            return [];
        }

        this.logger.debug("Pages", pages);
        this.logger.debug(`Parsing Pages for Thread: ${id}...`);

        /*
         The pages element will always end with a ">" character, except when there is only a single page for a thread.
          This can be replaced with an empty string.

         We then split into an Array, and get the length to confirm the total number of pages.

         There should always be at least one page.
        */
        const pagesList: Array<string> = pages.replace(">", "")
            .split("");

        this.logger.debug("Pages List", pagesList);

        if (isEmptyArray(pagesList)) {
            const warning: string = `No pages detected; Defaulting to 1 page`;
            this.logger.warn(warning);

            response.addWarning(warning);
            return [this.#buildThreadPageUrl(id, "1")];
        }

        this.logger.debug(`Building ${pagesList.length} Thread Page URLs...`);
        return pagesList.map((page: string) => this.#buildThreadPageUrl(id, page));
    }

    /**
     *
     * Parses the currently loaded {@link CheerioService} to get the Title for a Gaia Thread.
     *
     * @param {number} id The ID for the Thread being parsed.
     * @param {ApiResponse<GaiaThreadOutput>} response The current API response.
     * @returns {boolean} `true` if the Title was successfully parsed, otherwise `false`.
     * @private
     *
     */
    #getThreadTitle(
        id: number,
        response: ApiResponse<GaiaThreadOutput>
    ): boolean {
        this.logger.debug(`Parsing data for Thread ${id} Title...`);

        const title: string = this.#cs.selector("a")
            .context("#thread_title")
            .execute()
            .text();

        if (isNullOrUndefined(title)) {
            const errorMessage: string = `Unexpected Error parsing Title for Thread: ${id}`;
            this.logger.error(errorMessage);

            response.addError(errorMessage)
                .internalServerError();

            return false;
        } else if (isEmptyString(title)) {
            const errorMessage: string = `Unable to determine Title for Thread: ${id}`;
            this.logger.error(errorMessage);

            response.addError(errorMessage)
                .proxyRequestFailed();

            return false;
        }

        this.#cs.clear();
        this.logger.debug("Title", title);
        response.data("name", title);

        return true;
    }

    /**
     *
     * Gets the URL for the Thread from the Database.
     *
     * @param {number} id The ID for the Thread being parsed.
     * @param {ApiResponse<GaiaThreadOutput>} response The current API response.
     * @returns {Promise<Nullable<string>>} The URL for the Gaia Thread, or `null` if it is unable to be returned.
     * @private
     *
     */
    async #getThreadUrl(
        id: string,
        response: ApiResponse<GaiaThreadOutput>
    ): Promise<Nullable<string>> {
        // TODO 4/11/2025: Replace this with DB get logic (:
        const url: string = EDGE_OF_OBLIVION_BASE_LINK.replace("{{id}}", id);
        if (isNullOrUndefined(url)) {
            const errorMessage: string = `Failed to get Thread URL for Thread: ${id}`;
            this.logger.error(errorMessage);

            response.addError(errorMessage)
                .internalServerError();

            return null;
        }

        return url;
    }

    /**
     *
     * Makes a Fetch API request and then attempts to load the data into the {@link CheerioService}.
     *
     * @param {string} id The ID for the Thread to get.
     * @param {ApiResponse<GaiaThreadOutput>} response The current API response.
     * @returns {Promise<boolean>} `true` if the Thread data was successfully loaded, otherwise `false`.
     * @private
     *
     */
    async #loadData(
        id: string,
        response: ApiResponse<GaiaThreadOutput>
    ): Promise<boolean> {
        this.logger.debug(`Attempting to load Cheerio for Thread ${id}...`);

        const url: Nullable<string> = await this.#getThreadUrl(`${id}`, response);
        if (isNullOrUndefined(url)) {
            return false;
        }

        const fetchResponse: Response = await this.tryGet(url);
        if (
            !fetchResponse.ok
            && fetchResponse.status === 404
        ) {
            const errorMessage: string = `No Thread found matching ID ${id}`;
            this.logger.error(errorMessage);

            response.addError(errorMessage)
                .notFound();

            return false;
        } else if (!fetchResponse.ok) {
            const errorMessage: string = `Unexpected Error processing request for Thread: ${id}`;
            this.logger.error(errorMessage);

            response.addError(errorMessage)
                .proxyRequestFailed();

            return false;
        }

        const data: Nullable<string> = await this.#tryParseFetchResponseAsString(fetchResponse, response);
        if (isNullOrUndefined(data)) {
            return false;
        }

        this.#cs.load(data);
        this.logger.debug(`Successfully loaded Cheerio with Data from Thread ${id}`);

        return true;
    }

    /**
     *
     * Attempts to parse a Fetch API Response into a string format.
     *
     * @param {Response} fetchResponse The Fetch response.
     * @param {ApiResponse<{body: string}>} response The current API response. Only set when `null` is returned.
     * @returns {Promise<Nullable<string>>} The data that was fetched, or `null`, if an Error was thrown.
     * @private
     *
     */
    async #tryParseFetchResponseAsString<TObject extends object>(
        fetchResponse: Response,
        response: ApiResponse<TObject>
    ): Promise<Nullable<string>> {
        let data: Nullable<string> = null;
        try {
            this.logger.debug("Attempting to parse Fetch Response...");
            data = await parseResponseAsText(fetchResponse, true);
        } catch (e: unknown) {
            const error: Error = this.logUnknownError(e);
            response.addError(error.message)
                .internalServerError();
        }

        return data;
    }

    /**
     *
     * Returns Thread Details from Gaia that matches the provided ID.
     *
     * @param {string} rawId The raw ID as a string.
     * @returns {Promise<IResponse<GaiaThreadOutput>>} The Results from the current API run.
     *
     */
    async getThreadDetails(
        rawId: string
    ): Promise<IResponse<GaiaThreadOutput>> {
        const response: ApiResponse<GaiaThreadOutput> = new ApiResponse<GaiaThreadOutput>();

        const id: number = parseInt(rawId, 10);

        if (isNotNumber(id)) {
            return response
                .addError("Invalid ID provided")
                .internalServerError();
        }

        return this.#getThreadDetails(id, response);
    }

}