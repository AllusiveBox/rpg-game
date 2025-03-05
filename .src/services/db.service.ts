import { Nullable } from "@allusivebox/core";
import { isNonEmptyArray } from "@allusivebox/core/dist/.src/utils/array.util";
import { isEmptyString } from "@allusivebox/core/dist/.src/utils/string.util";
import {
    getType,
    isNotNullOrUndefined,
    isNotObject,
    isNullOrUndefined
} from "@allusivebox/core/dist/.src/utils/types.util";
import {
    ConnectionConfig,
    Pool,
    PoolClient
} from "pg";
import { DbError } from "../models/errors";
import { DbResult } from "../models/internal";
import { LoggerService } from "./logger.service";


export class DbService {

    readonly #config: ConnectionConfig;

    readonly #logger: LoggerService;

    readonly #pool: Pool;

    /**
     *
     * Static method that checks if the provided value is a {@link DbService} instance.
     *
     * @param {unknown} arg The value to check.
     * @returns {boolean} `true` if the provided value is a {@link DbService}, otherwise `false`.
     */
    static isDbService(
        arg: unknown
    ): arg is DbService {
        return arg instanceof DbService;
    }

    /**
     *
     * Creates a new {@link DbService} instance.
     *
     * @param {ConnectionConfig} config The Database credentials that will be used.
     * @param {LoggerService} logger The logger that will be used by the service.
     * @constructor
     * @throws {AggregateError} If either the provided values are invalid.
     *
     */
    constructor(
        config: ConnectionConfig,
        logger: LoggerService
    ) {
        // Validate
        this.#validate(config, logger);

        this.#config = config;
        this.#logger = logger.createChild(`${config.database}`);

        this.#pool = new Pool(this.#config);
    }

    /**
     *
     * Generates a new {@link PoolClient} to be used for Database operations.
     *
     * @returns {Promise<PoolClient>} The DB client.
     * @private
     * @throws {DbError} If the {@link PoolClient} is unable to be generated.
     *
     */
    async #getClient(): Promise<PoolClient> {
        this.#logger.debug(`Generating new Pool Client for ${this.#config.database}...`);

        let client: PoolClient;
        try {
            client = await this.#pool.connect();
        } catch (e: unknown) {
            throw DbError.createDbErrorFromUnknown(e);
        }

        return client;
    }

    #validate(
        config: ConnectionConfig,
        logger: LoggerService
    ): void {
        const errors: Array<TypeError> = new Array<TypeError>();

        const configError: Nullable<TypeError> = this.#validateConfig(config);
        if (isNotNullOrUndefined(configError)) {
            errors.push(configError);
        }

        const loggerError: Nullable<TypeError> = this.#validateLogger(logger);
        if (isNotNullOrUndefined(loggerError)) {
            errors.push(loggerError);
        }

        if (isNonEmptyArray(errors)) {
            throw new AggregateError(errors, "Unable to build DbService due to Error(s)");
        }
    }

    #validateConfig(
        config: ConnectionConfig
    ): Nullable<TypeError> {
        if (isNullOrUndefined(config)) {
            return new TypeError('Value "config" cannot be null or undefined');
        } else if (isNotObject(config)) {
            return new TypeError('Invalid type for "config"; Must be an object', {
                cause: `Expected object; Received ${getType(config)} (${config})`
            });
        }

        // Validate the individual fields
        const missingFields: Array<string> = new Array<string>();
        const {
            user,
            database,
            password,
            port
        } = config;
        if (
            isNullOrUndefined(user)
            || isEmptyString(user)
        ) {
            missingFields.push("user");
        }

        if (
            isNullOrUndefined(database)
            || isEmptyString(database)
        ) {
            missingFields.push("database");
        }

        if (
            isNullOrUndefined(password)
            || isEmptyString(password)
        ) {
            missingFields.push("password");
        }

        if (
            isNullOrUndefined(port)
            || isEmptyString(port)
        ) {
            missingFields.push("port");
        }

        if (isNonEmptyArray(missingFields)) {
            throw new TypeError(`Invalid object for "config"; Missing required fields; ${missingFields.join(";")}`, {
                cause: `Expected object with "user", "database", password" and "port" fields; Missing ${missingFields}`
            });
        }

        return null;
    }

    #validateLogger(
        logger: LoggerService
    ): Nullable<TypeError> {
        if (isNullOrUndefined(logger)) {
            return new TypeError('Value "logger" cannot be null or undefined');
        } else if (!LoggerService.isLoggerService(logger)) {
            return new TypeError('Invalid type for "logger"; Must be a LoggerService', {
                cause: `Expected LoggerService; Received ${getType(logger)} (${logger})`
            });
        }

        return null;
    }

    /**
     *
     * Executes the provided SQL query using the provided parameters.
     *
     * @param {string} sql The SQL query to execute.
     * @param {?any} [params] Optional SQL parameters to use alongside the query.
     * @returns {Promise<DbResult<T>>} The results from executing the query.
     * @template {object} T
     *
     */
    async query<T extends object>(
        sql: string,
        params?: any
    ): Promise<DbResult<T>> {
        let result: DbResult<T>;
        try {
            const client: PoolClient = await this.#getClient();
            const { rows }: { rows: Array<T> } = await client.query<T>(sql, params);
            result = {
                code: 200,
                data: rows,
                success: true
            };
        } catch (e: unknown) {
            const error: DbError = DbError.createDbErrorFromUnknown(e);
            result = {
                code: error.code,
                errors: [error],
                success: false
            };
        }

        return result;
    }

}