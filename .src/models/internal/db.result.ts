import { DbError } from "../errors";

/**
 *
 * Base interface for all {@link DbResult} types, regardless of success status.
 *
 * @interface DbResultBase
 *
 */
interface DbResultBase {

    /**
     *
     * An HTTP status code associated with the result.
     *
     * @type {number}
     *
     */
    code: number;

    /**
     *
     * Flag indicating the overall status of the operation.
     *
     * @type {boolean}
     *
     */
    success: boolean;

}

/**
 *
 * Interface indicating a successful result from a {@link DbService} operation.
 *
 * @interface DbSuccess
 * @extends DbResultBase
 *
 */
export interface DbSuccess<TData extends object> extends DbResultBase {

    success: true;

    /**
     *
     * The data returned from the Database.
     *
     * @type {Array<TData>}
     * @template {object} TData
     *
     */
    data: Array<TData>;

}

/**
 *
 * Interface indicating a failed result from a {@link DbService} operation.
 *
 * @interface DbFailure
 * @extends DbResultBase
 *
 */
export interface DbFailure extends DbResultBase {

    success: false;

    /**
     *
     * An Array of {@link DbError}s reported by the {@link DbService} for the failed operation.
     *
     * @type {Array<DbError>}
     *
     */
    errors: Array<DbError>;

}

/**
 *
 * Type alias used to indicate the possible results from a {@link DbService} operation.
 *
 * @type {DbResult}
 *
 */
export type DbResult<TData extends object> = (DbSuccess<TData> | DbFailure);