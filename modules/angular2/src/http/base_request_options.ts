import {CONST_EXPR, CONST, isPresent} from 'angular2/src/facade/lang';
import {Headers} from './headers';
import {RequestModesOpts, RequestMethods, RequestCacheOpts, RequestCredentialsOpts} from './enums';
import {IRequestOptions} from './interfaces';
import {Injectable} from 'angular2/di';
import {ListWrapper, StringMapWrapper, StringMap} from 'angular2/src/facade/collection';

const INITIALIZER = CONST_EXPR({});
/**
 * Creates a request options object with default properties as described in the [Fetch
 * Spec](https://fetch.spec.whatwg.org/#requestinit) to be optionally provided when instantiating a
 * {@link Request}. This class is used implicitly by {@link Http} to merge in provided request
 * options with the default options specified here. These same default options are injectable via
 * the {@link BaseRequestOptions} class.
 */
export class RequestOptions implements IRequestOptions {
  /**
   * Http method with which to execute the request.
   *
   * Defaults to "GET".
   */
  method: RequestMethods = RequestMethods.GET;
  /**
   * Headers object based on the `Headers` class in the [Fetch
   * Spec](https://fetch.spec.whatwg.org/#headers-class).
   */
  headers: Headers;
  /**
   * Body to be used when creating the request.
   */
  // TODO: support FormData, Blob, URLSearchParams, JSON
  body: string;
  mode: RequestModesOpts = RequestModesOpts.Cors;
  credentials: RequestCredentialsOpts;
  cache: RequestCacheOpts;
  url: string;
  constructor({method, headers, body, mode, credentials, cache, url}: IRequestOptions = {}) {
    this.method = isPresent(method) ? method : RequestMethods.GET;
    this.headers = headers;
    this.body = body;
    this.mode = isPresent(mode) ? mode : RequestModesOpts.Cors;
    this.credentials = credentials;
    this.cache = cache;
    this.url = url;
  }

  /**
   * Creates a copy of the `RequestOptions` instance, using the optional input as values to override
   * existing values.
   */
  merge({url = null, method = null, headers = null, body = null, mode = null, credentials = null,
         cache = null}: any = {}): RequestOptions {
    return new RequestOptions({
      method: isPresent(method) ? method : this.method,
      headers: isPresent(headers) ? headers : this.headers,
      body: isPresent(body) ? body : this.body,
      mode: isPresent(mode) ? mode : this.mode,
      credentials: isPresent(credentials) ? credentials : this.credentials,
      cache: isPresent(cache) ? cache : this.cache,
      url: isPresent(url) ? url : this.url
    });
  }

  static fromStringWrapper(map: StringMap<string, any>): RequestOptions {
    return new RequestOptions({
      method: StringMapWrapper.get(map, 'method'),
      headers: StringMapWrapper.get(map, 'headers'),
      body: StringMapWrapper.get(map, 'body'),
      mode: StringMapWrapper.get(map, 'mode'),
      credentials: StringMapWrapper.get(map, 'credentials'),
      cache: StringMapWrapper.get(map, 'cache'),
      url:<string>StringMapWrapper.get(map, 'url')
    })
  }
}

/**
 * Injectable version of {@link RequestOptions}.
 *
 * #Example
 *
 * ```
 * import {Http, BaseRequestOptions, Request} from 'angular2/http';
 * ...
 * class MyComponent {
 *   constructor(baseRequestOptions:BaseRequestOptions, http:Http) {
 *     var options = baseRequestOptions.merge({body: 'foobar'});
 *     var request = new Request('https://foo', options);
 *     http.request(request).subscribe(res => this.bars = res.json());
 *   }
 * }
 *
 * ```
 */
@Injectable()
export class BaseRequestOptions extends RequestOptions {
  constructor() { super(); }
}
