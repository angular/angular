import {RequestMethods, RequestModesOpts, RequestCredentialsOpts, RequestCacheOpts} from './enums';
import {RequestOptions} from './base_request_options';
import {Headers} from './headers';
import {
  BaseException,
  RegExpWrapper,
  CONST_EXPR,
  isPresent,
  isJsObject,
  StringWrapper
} from 'angular2/src/core/facade/lang';

// TODO(jeffbcross): properly implement body accessors
/**
 * Creates `Request` instances from provided values.
 *
 * The Request's interface is inspired by the Request constructor defined in the [Fetch
 * Spec](https://fetch.spec.whatwg.org/#request-class),
 * but is considered a static value whose body can be accessed many times. There are other
 * differences in the implementation, but this is the most significant.
 */
export class Request {
  /**
   * Http method with which to perform the request.
   *
   * Defaults to GET.
   */
  method: RequestMethods;
  mode: RequestModesOpts;
  credentials: RequestCredentialsOpts;
  /**
   * Headers object based on the `Headers` class in the [Fetch
   * Spec](https://fetch.spec.whatwg.org/#headers-class). {@link Headers} class reference.
   */
  headers: Headers;
  /** Url of the remote resource */
  url: string;
  // TODO: support URLSearchParams | FormData | Blob | ArrayBuffer
  private _body: string;
  cache: RequestCacheOpts;
  constructor(requestOptions: RequestOptions) {
    // TODO: assert that url is present
    let url = requestOptions.url;
    this.url = requestOptions.url;
    if (isPresent(requestOptions.search)) {
      let search = requestOptions.search.toString();
      if (search.length > 0) {
        let prefix = '?';
        if (StringWrapper.contains(this.url, '?')) {
          prefix = (this.url[this.url.length - 1] == '&') ? '' : '&';
        }
        // TODO: just delete search-query-looking string in url?
        this.url = url + prefix + search;
      }
    }
    this._body = requestOptions.body;
    this.method = requestOptions.method;
    // TODO(jeffbcross): implement behavior
    this.mode = requestOptions.mode;
    // Defaults to 'omit', consistent with browser
    // TODO(jeffbcross): implement behavior
    this.credentials = requestOptions.credentials;
    this.headers = new Headers(requestOptions.headers);
    this.cache = requestOptions.cache;
  }


  /**
   * Returns the request's body as string, assuming that body exists. If body is undefined, return
   * empty
   * string.
   */
  text(): String { return isPresent(this._body) ? this._body.toString() : ''; }
}
