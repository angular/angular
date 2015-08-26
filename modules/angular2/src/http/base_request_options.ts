import {CONST_EXPR, CONST, isPresent, isString} from 'angular2/src/core/facade/lang';
import {Headers} from './headers';
import {RequestModesOpts, RequestMethods, RequestCacheOpts, RequestCredentialsOpts} from './enums';
import {RequestOptionsArgs} from './interfaces';
import {Injectable} from 'angular2/di';
import {URLSearchParams} from './url_search_params';

/**
 * Creates a request options object similar to the `RequestInit` description
 * in the [Fetch
 * Spec](https://fetch.spec.whatwg.org/#requestinit) to be optionally provided when instantiating a
 * {@link Request}.
 *
 * All values are null by default.
 */
export class RequestOptions {
  /**
   * Http method with which to execute the request.
   *
   * Defaults to "GET".
   */
  method: RequestMethods;
  /**
   * Headers object based on the `Headers` class in the [Fetch
   * Spec](https://fetch.spec.whatwg.org/#headers-class).
   */
  headers: Headers;
  /**
   * Body to be used when creating the request.
   */
  // TODO: support FormData, Blob, URLSearchParams
  body: string;
  mode: RequestModesOpts;
  credentials: RequestCredentialsOpts;
  cache: RequestCacheOpts;
  url: string;
  search: URLSearchParams;
  constructor({method, headers, body, mode, credentials, cache, url, search}:
                  RequestOptionsArgs = {}) {
    this.method = isPresent(method) ? method : null;
    this.headers = isPresent(headers) ? headers : null;
    this.body = isPresent(body) ? body : null;
    this.mode = isPresent(mode) ? mode : null;
    this.credentials = isPresent(credentials) ? credentials : null;
    this.cache = isPresent(cache) ? cache : null;
    this.url = isPresent(url) ? url : null;
    this.search = isPresent(search) ? (isString(search) ? new URLSearchParams(<string>(search)) :
                                                          <URLSearchParams>(search)) :
                                      null;
  }

  /**
   * Creates a copy of the `RequestOptions` instance, using the optional input as values to override
   * existing values.
   */
  merge(options?: RequestOptionsArgs): RequestOptions {
    return new RequestOptions({
      method: isPresent(options) && isPresent(options.method) ? options.method : this.method,
      headers: isPresent(options) && isPresent(options.headers) ? options.headers : this.headers,
      body: isPresent(options) && isPresent(options.body) ? options.body : this.body,
      mode: isPresent(options) && isPresent(options.mode) ? options.mode : this.mode,
      credentials: isPresent(options) && isPresent(options.credentials) ? options.credentials :
                                                                          this.credentials,
      cache: isPresent(options) && isPresent(options.cache) ? options.cache : this.cache,
      url: isPresent(options) && isPresent(options.url) ? options.url : this.url,
      search: isPresent(options) && isPresent(options.search) ?
                  (isString(options.search) ? new URLSearchParams(<string>(options.search)) :
                                              (<URLSearchParams>(options.search)).clone()) :
                  this.search
    });
  }
}

/**
 * Injectable version of {@link RequestOptions}, with overridable default values.
 *
 * #Example
 *
 * ```
 * import {Http, BaseRequestOptions, Request} from 'angular2/http';
 * ...
 * class MyComponent {
 *   constructor(baseRequestOptions:BaseRequestOptions, http:Http) {
 *     var options = baseRequestOptions.merge({body: 'foobar', url: 'https://foo'});
 *     var request = new Request(options);
 *     http.request(request).subscribe(res => this.bars = res.json());
 *   }
 * }
 *
 * ```
 */
@Injectable()
export class BaseRequestOptions extends RequestOptions {
  constructor() {
    super({method: RequestMethods.Get, headers: new Headers(), mode: RequestModesOpts.Cors});
  }
}
