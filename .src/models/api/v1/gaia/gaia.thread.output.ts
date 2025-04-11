/**
 *
 * Interface outlining the output from the {@link V1GaiaController#getThreadDetails} method.
 *
 * @interface GaiaThreadOutput
 *
 */
export interface GaiaThreadOutput {

    /**
     *
     * The title of the thread.
     *
     * @type {string}
     *
     */
    name: string;

    /**
     *
     * The current page count for the thread.
     *
     * @type {number}
     *
     */
    pageCount: number;

    /**
     *
     * The username of the user that created the thread.
     *
     * @type {string}
     *
     */
    createdBy: string;

    /**
     *
     * The username of the user that last updated the thread.
     *
     * @type {string}
     *
     */
    lastUpdatedBy: string;

    /**
     *
     * The Date the thread was last updated.
     * <br />
     * Formatted as an ISO Date string.
     *
     * @type {string}
     *
     */
    lastUpdatedOn: string;

}