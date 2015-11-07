import {isPresent, isString} from 'angular2/src/facade/lang';
import {Headers} from './headers';
import {RequestMethods} from './enums';
import {RequestOptionsArgs} from './interfaces';
import {Injectable} from 'angular2/angular2';
import {URLSearchParams} from './url_search_params';
import {normalizeMethodName} from './http_utils';

/**
 * Creates a request options object to be optionally provided when instantiating a
 * {@link Request}.
 *
 * This class is based on the `RequestInit` description in the [Fetch
 * Spec](https://fetch.spec.whatwg.org/#requestinit).
 *
 * All values are null by default. Typical defaults can be found in the {@link BaseRequestOptions}
 * class, which sub-classes `RequestOptions`.
 *
 * ### Example ([live demo](http://plnkr.co/edit/7Wvi3lfLq41aQPKlxB4O?p=preview))
 *
 * ```typescript
 * import {RequestOptions, Request, RequestMethods} from 'angular2/http';
 *
 * var options = new RequestOptions({
 *   method: RequestMethods.Post,
 *   url: 'https://google.com'
 * });
 * var req = new Request(options);
 * console.log('req.method:', RequestMethods[req.method]); // Post
 * console.log('options.url:', options.url); // https://google.com
 * ```
 */
export class RequestOptions {
  /**
   * Http method with which to execute a {@link Request}.
   * Acceptable methods are defined in the {@link RequestMethods} enum.
   */
  method: RequestMethods | string;
  /**
   * {@link Headers} to be attached to a {@link Request}.
   */
  headers: Headers;
  /**
   * Body to be used when creating a {@link Request}.
   */
  // TODO: support FormData, Blob, URLSearchParams
  body: string;
  /**
   * Url with which to perform a {@link Request}.
   */
  url: string;
  /**
   * Search parameters to be included in a {@link Request}.
   */
  search: URLSearchParams;
  constructor({method, headers, body, url, search}: RequestOptionsArgs = {}) {
    this.method = isPresent(method) ? normalizeMethodName(method) : null;
    this.headers = isPresent(headers) ? headers : null;
    this.body = isPresent(body) ? body : null;
    this.url = isPresent(url) ? url : null;
    this.search = isPresent(search) ? (isString(search) ? new URLSearchParams(<string>(search)) :
                                                          <URLSearchParams>(search)) :
                                      null;
  }

  /**
   * Creates a copy of the `RequestOptions` instance, using the optional input as values to override
   * existing values. This method will not change the values of the instance on which it is being
   * called.
   *
   * Note that `headers` and `search` will override existing values completely if present in
   * the `options` object. If these values should be merged, it should be done prior to calling
   * `merge` on the `RequestOptions` instance.
   *
   * ### Example ([live demo](http://plnkr.co/edit/6w8XA8YTkDRcPYpdB9dk?p=preview))
   *
   * ```typescript
   * import {RequestOptions, Request, RequestMethods} from 'angular2/http';
   *
   * var options = new RequestOptions({
   *   method: RequestMethods.Post
   * });
   * var req = new Request(options.merge({
   *   url: 'https://google.com'
   * }));
   * console.log('req.method:', RequestMethods[req.method]); // Post
   * console.log('options.url:', options.url); // null
   * console.log('req.url:', req.url); // https://google.com
   * ```
   */
  merge(options?: RequestOptionsArgs): RequestOptions {
    return new RequestOptions({
      method: isPresent(options) && isPresent(options.method) ? options.method : this.method,
      headers: isPresent(options) && isPresent(options.headers) ? options.headers : this.headers,
      body: isPresent(options) && isPresent(options.body) ? options.body : this.body,
      url: isPresent(options) && isPresent(options.url) ? options.url : this.url,
      search: isPresent(options) && isPresent(options.search) ?
                  (isString(options.search) ? new URLSearchParams(<string>(options.search)) :
                                              (<URLSearchParams>(options.search)).clone()) :
                  this.search
    });
  }
}


/**
 * Subclass of {@link RequestOptions}, with default values.
 *
 * Default values:
 *  * method: {@link RequestMethods RequestMethods.Get}
 *  * headers: empty {@link Headers} object
 *
 * This class could be extended and bound to the {@link RequestOptions} class
 * when configuring an {@link Injector}, in order to override the default options
 * used by {@link Http} to create and send {@link Request Requests}.
 *
 * ### Example ([live demo](http://plnkr.co/edit/LEKVSx?p=preview))
 *
 * ```typescript
 * import {provide, bootstrap} from 'angular2/angular2';
 * import {HTTP_PROVIDERS, Http, BaseRequestOptions, RequestOptions} from 'angular2/http';
 * import {App} from './myapp';
 *
 * class MyOptions extends BaseRequestOptions {
 *   search: string = 'coreTeam=true';
 * }
 *
 * bootstrap(App, [HTTP_PROVIDERS, provide(RequestOptions, {useClass: MyOptions})]);
 * ```
 *
 * The options could also be extended when manually creating a {@link Request}
 * object.
 *
 * ### Example ([live demo](http://plnkr.co/edit/oyBoEvNtDhOSfi9YxaVb?p=preview))
 *
 * ```
 * import {BaseRequestOptions, Request, RequestMethods} from 'angular2/http';
 *
 * var options = new BaseRequestOptions();
 * var req = new Request(options.merge({
 *   method: RequestMethods.Post,
 *   url: 'https://google.com'
 * }));
 * console.log('req.method:', RequestMethods[req.method]); // Post
 * console.log('options.url:', options.url); // null
 * console.log('req.url:', req.url); // https://google.com
 * ```
 */
@Injectable()
export class BaseRequestOptions extends RequestOptions {
  constructor() { super({method: RequestMethods.Get, headers: new Headers()}); }
}
