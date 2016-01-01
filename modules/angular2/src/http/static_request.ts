import {RequestMethod} from './enums';
import {RequestArgs} from './interfaces';
import {Headers} from './headers';
import {normalizeMethodName} from './http_utils';
import {
  RegExpWrapper,
  CONST_EXPR,
  isPresent,
  isJsObject,
  StringWrapper
} from 'angular2/src/facade/lang';

// TODO(jeffbcross): properly implement body accessors
/**
 * Creates `Request` instances from provided values.
 *
 * The Request's interface is inspired by the Request constructor defined in the [Fetch
 * Spec](https://fetch.spec.whatwg.org/#request-class),
 * but is considered a static value whose body can be accessed many times. There are other
 * differences in the implementation, but this is the most significant.
 *
 * `Request` instances are typically created by higher-level classes, like {@link Http} and
 * {@link Jsonp}, but it may occasionally be useful to explicitly create `Request` instances.
 * One such example is when creating services that wrap higher-level services, like {@link Http},
 * where it may be useful to generate a `Request` with arbitrary headers and search params.
 *
 * ```typescript
 * import {Injectable, Injector} from 'angular2/core';
 * import {HTTP_PROVIDERS, Http, Request, RequestMethod} from 'angular2/http';
 *
 * @Injectable()
 * class AutoAuthenticator {
 *   constructor(public http:Http) {}
 *   request(url:string) {
 *     return this.http.request(new Request({
 *       method: RequestMethod.Get,
 *       url: url,
 *       search: 'password=123'
 *     }));
 *   }
 * }
 *
 * var injector = Injector.resolveAndCreate([HTTP_PROVIDERS, AutoAuthenticator]);
 * var authenticator = injector.get(AutoAuthenticator);
 * authenticator.request('people.json').subscribe(res => {
 *   //URL should have included '?password=123'
 *   console.log('people', res.json());
 * });
 * ```
 */
export class Request {
  /**
   * Http method with which to perform the request.
   */
  method: RequestMethod;
  /**
   * {@link Headers} instance
   */
  headers: Headers;
  /** Url of the remote resource */
  url: string;
  // TODO: support URLSearchParams | FormData | Blob | ArrayBuffer
  private _body: string;
  constructor(requestOptions: RequestArgs) {
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
    this.method = normalizeMethodName(requestOptions.method);
    // TODO(jeffbcross): implement behavior
    // Defaults to 'omit', consistent with browser
    // TODO(jeffbcross): implement behavior
    this.headers = new Headers(requestOptions.headers);
  }


  /**
   * Returns the request's body as string, assuming that body exists. If body is undefined, return
   * empty
   * string.
   */
  text(): String { return isPresent(this._body) ? this._body.toString() : ''; }
}
