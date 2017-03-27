import { Observable } from 'rxjs/Observable';

/*
 * The Response interface is based on the Angular http module response
 * which is inspired by the Response constructor defined in the
 * [Fetch Spec](https://fetch.spec.whatwg.org/#response-class),
 * but certain properties and methods are missing and
 * the body can be accessed many times.
 */
export interface Response {
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
     * Attempts to return body as parsed `JSON` object, or raises an exception.
     */
    json(): any ;
    /**
     * Returns the body as a string, presuming `toString()` can be called on the response body.
     */
    text(): string;
}

export abstract class FileLoaderService {
  abstract load(url: string): Observable<Response>;
}
