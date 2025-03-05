export interface ContentTypes {

    /**
     *
     * Indicates a Content-Type of `application/json`.
     *
     * @type {"application/json;"}
     *
     */
    ApplicationJson: "application/json;";

    /**
     *
     * Indicates a Content-Type of `text/html` that is encoded in UTF-8 character encoding.
     *
     * @type {"text/html; charset=UTF-8"}
     *
     */
    TextHtmlUtf8: "text/html; charset=UTF-8";

}

/**
 *
 * Object containing all the supported Content-Type values used by this project.
 *
 * @type {ContentTypes}
 *
 */
export const ContentTypes: ContentTypes = {
    ApplicationJson: "application/json;",
    TextHtmlUtf8: "text/html; charset=UTF-8"
} as const;

/**
 *
 * Type alias used to represent all the values supported by the {@link ContentTypes} object.
 *
 * @type {ContentType}
 * 
 */
export type ContentType = (typeof ContentTypes)[keyof typeof ContentTypes];