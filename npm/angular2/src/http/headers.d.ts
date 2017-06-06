/**
 * Polyfill for [Headers](https://developer.mozilla.org/en-US/docs/Web/API/Headers/Headers), as
 * specified in the [Fetch Spec](https://fetch.spec.whatwg.org/#headers-class).
 *
 * The only known difference between this `Headers` implementation and the spec is the
 * lack of an `entries` method.
 *
 * ### Example ([live demo](http://plnkr.co/edit/MTdwT6?p=preview))
 *
 * ```
 * import {Headers} from 'angular2/http';
 *
 * var firstHeaders = new Headers();
 * firstHeaders.append('Content-Type', 'image/jpeg');
 * console.log(firstHeaders.get('Content-Type')) //'image/jpeg'
 *
 * // Create headers from Plain Old JavaScript Object
 * var secondHeaders = new Headers({
 *   'X-My-Custom-Header': 'Angular'
 * });
 * console.log(secondHeaders.get('X-My-Custom-Header')); //'Angular'
 *
 * var thirdHeaders = new Headers(secondHeaders);
 * console.log(thirdHeaders.get('X-My-Custom-Header')); //'Angular'
 * ```
 */
export declare class Headers {
    constructor(headers?: Headers | {
        [key: string]: any;
    });
    /**
     * Returns a new Headers instance from the given DOMString of Response Headers
     */
    static fromResponseHeaderString(headersString: string): Headers;
    /**
     * Appends a header to existing list of header values for a given header name.
     */
    append(name: string, value: string): void;
    /**
     * Deletes all header values for the given name.
     */
    delete(name: string): void;
    forEach(fn: (values: string[], name: string, headers: Map<string, string[]>) => void): void;
    /**
     * Returns first header that matches given name.
     */
    get(header: string): string;
    /**
     * Check for existence of header by given name.
     */
    has(header: string): boolean;
    /**
     * Provides names of set headers
     */
    keys(): string[];
    /**
     * Sets or overrides header value for given name.
     */
    set(header: string, value: string | string[]): void;
    /**
     * Returns values of all headers.
     */
    values(): string[][];
    /**
     * Returns string of all headers.
     */
    toJSON(): {
        [key: string]: any;
    };
    /**
     * Returns list of header values for a given name.
     */
    getAll(header: string): string[];
    /**
     * This method is not implemented.
     */
    entries(): void;
}
