import {RequestMethods, RequestModesOpts, RequestCredentialsOpts} from './enums';
import {URLSearchParams} from './url_search_params';
import {IRequestOptions, Request as IRequest} from './interfaces';
import {Headers} from './headers';
import {BaseException, RegExpWrapper} from 'angular2/src/facade/lang';

// TODO(jeffbcross): properly implement body accessors
/**
 * Creates `Request` instances with default values.
 *
 * The Request's interface is inspired by the Request constructor defined in the [Fetch
 * Spec](https://fetch.spec.whatwg.org/#request-class),
 * but is considered a static value whose body can be accessed many times. There are other
 * differences in the implementation, but this is the most significant.
 */
export class Request implements IRequest {
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

  private _body: URLSearchParams | FormData | Blob | string;

  constructor(/** Url of the remote resource */ public url: string,
              {body, method = RequestMethods.GET, mode = RequestModesOpts.Cors,
               credentials = RequestCredentialsOpts.Omit,
               headers = new Headers()}: IRequestOptions = {}) {
    this._body = body;
    this.method = method;
    // Defaults to 'cors', consistent with browser
    // TODO(jeffbcross): implement behavior
    this.mode = mode;
    // Defaults to 'omit', consistent with browser
    // TODO(jeffbcross): implement behavior
    this.credentials = credentials;
    this.headers = headers;
  }

  /**
   * Returns the request's body as string, assuming that body exists. If body is undefined, return
   * empty
   * string.
   */
  text(): String { return this._body ? this._body.toString() : ''; }
}
