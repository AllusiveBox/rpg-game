import {
    isNotString,
    isNullOrUndefined
} from "@allusivebox/core/dist/.src/utils/types.util";
import {
    Cheerio,
    CheerioAPI
} from "cheerio";
import * as cheerio from 'cheerio';
import {
    ChildNode,
    ParentNode
} from "domhandler/lib/node";
import { LoggerService } from "./logger.service";

export class CheerioService {

    readonly #logger: LoggerService;

    #content: CheerioAPI;

    #selector: string;

    #context: string;

    constructor(
        logger: LoggerService
    ) {
        this.#logger = logger.createChild("Cheerio");
    }

    load(
        html: string
    ): this {
        if (isNotString(html)) {
            throw new TypeError("Cannot load data into Cheerio", {
                cause: `Expected string; Received: ${typeof html}`
            });
        }

        this.#logger.debug("Loading HTML...");
        this.#content = cheerio.load(html);
        return this;
    }

    selector(
        selector: string
    ): this {
        if (isNotString(selector)) {
            throw new TypeError("Invalid Selector provided", {
                cause: `Expected string; Received: ${typeof selector}`
            });
        }

        this.#logger.debug(`Selector: ${selector}`);
        this.#selector = selector;
        return this;
    }

    context(
        context: string
    ): this {
        if (isNotString(context)) {
            throw new TypeError("Invalid Context provided", {
                cause: `Expected string; Received: ${typeof context}`
            });
        }

        this.#logger.debug(`Context: ${context}`);
        this.#context = context;
        return this;
    }

    clear(
        clearContent?: boolean
    ): this {
        this.#logger.info("Clearing Cheerio data");
        // @ts-expect-error
        this.#selector = undefined;
        // @ts-expect-error
        this.#context = undefined;

        if (clearContent) {
            this.#logger.info("Clearing Cheerio Content");
            // @ts-expect-error
            this.#content = undefined;
        }

        return this;
    }

    execute(): Cheerio<(ParentNode | ChildNode)> {
        if (isNullOrUndefined(this.#context)) {
            this.#logger.info(`Executing $("${this.#selector}")`);
            return this.#content(this.#selector);
        }

        this.#logger.info(`Executing $("${this.#selector}", "${this.#context})"`);
        return this.#content(this.#selector, this.#context);
    }

}