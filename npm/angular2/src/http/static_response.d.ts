import { ResponseType } from './enums';
import { Headers } from './headers';
import { ResponseOptions } from './base_response_options';
/**
 * Creates `Response` instances from provided values.
 *
 * Though this object isn't
 * usually instantiated by end-users, it is the primary object interacted with when it comes time to
 * add data to a view.
 *
 * ### Example
 *
 * ```
 * http.request('my-friends.txt').subscribe(response => this.friends = response.text());
 * ```
 *
 * The Response's interface is inspired by the Response constructor defined in the [Fetch
 * Spec](https://fetch.spec.whatwg.org/#response-class), but is considered a static value whose body
 * can be accessed many times. There are other differences in the implementation, but this is the
 * most significant.
 */
export declare class Response {
    /**
     * One of "basic", "cors", "default", "error, or "opaque".
     *
     * Defaults to "default".
     */
    type: ResponseType;
    /**
     * True if the response's status is within 200-299
     */
    ok: boolean;
    /**
     * URL of response.
     *
     * Defaults to empty string.
     */
    url: string;
    /**
     * Status code returned by server.
     *
     * Defaults to 200.
     */
    status: number;
    /**
     * Text representing the corresponding reason phrase to the `status`, as defined in [ietf rfc 2616
     * section 6.1.1](https://tools.ietf.org/html/rfc2616#section-6.1.1)
     *
     * Defaults to "OK"
     */
    statusText: string;
    /**
     * Non-standard property
     *
     * Denotes how many of the response body's bytes have been loaded, for example if the response is
     * the result of a progress event.
     */
    bytesLoaded: number;
    /**
     * Non-standard property
     *
     * Denotes how many bytes are expected in the final response body.
     */
    totalBytes: number;
    /**
     * Headers object based on the `Headers` class in the [Fetch
     * Spec](https://fetch.spec.whatwg.org/#headers-class).
     */
    headers: Headers;
    private _body;
    constructor(responseOptions: ResponseOptions);
    /**
     * Not yet implemented
     */
    blob(): any;
    /**
     * Attempts to return body as parsed `JSON` object, or raises an exception.
     */
    json(): any;
    /**
     * Returns the body as a string, presuming `toString()` can be called on the response body.
     */
    text(): string;
    /**
     * Not yet implemented
     */
    arrayBuffer(): any;
}
