import {Response as IResponse, ResponseOptions} from './interfaces';
import {ResponseTypes} from './enums';
import {baseResponseOptions} from './base_response_options';
import {BaseException, isJsObject, isString, global} from 'angular2/src/facade/lang';
import {Headers} from './headers';

// TODO: make this injectable so baseResponseOptions can be overridden, mostly for the benefit of
// headers merging.
/**
 * Creates `Response` instances with default values.
 *
 * Though this object isn't
 * usually instantiated by end-users, it is the primary object interacted with when it comes time to
 * add data to a view.
 *
 * #Example
 *
 * ```
 * http.request('my-friends.txt').subscribe(response => this.friends = response.text());
 * ```
 *
 * The Response's interface is inspired by the Request constructor defined in the [Fetch
 * Spec](https://fetch.spec.whatwg.org/#response-class), but is considered a static value whose body
 * can be accessed many times. There are other differences in the implementation, but this is the
 * most significant.
 */
export class Response implements IResponse {
  /**
   * One of "basic", "cors", "default", "error, or "opaque".
   *
   * Defaults to "default".
   */
  type: ResponseTypes;
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
  constructor(private _body?: string | Object | ArrayBuffer | JSON | FormData | Blob,
              {status, statusText, headers, type, url}: ResponseOptions = baseResponseOptions) {
    if (isJsObject(headers)) {
      headers = new Headers(headers);
    }
    this.status = status;
    this.statusText = statusText;
    this.headers = <Headers>headers;
    this.type = type;
    this.url = url;
  }

  /**
   * Not yet implemented
   */
  blob(): Blob {
    throw new BaseException('"blob()" method not implemented on Response superclass');
  }

  /**
   * Attempts to return body as parsed `JSON` object, or raises an exception.
   */
  json(): JSON {
    if (isJsObject(this._body)) {
      return <JSON>this._body;
    } else if (isString(this._body)) {
      return global.JSON.parse(<string>this._body);
    }
  }

  /**
   * Returns the body as a string, presuming `toString()` can be called on the response body.
   */
  text(): string { return this._body.toString(); }

  /**
   * Not yet implemented
   */
  arrayBuffer(): ArrayBuffer {
    throw new BaseException('"arrayBuffer()" method not implemented on Response superclass');
  }
}
