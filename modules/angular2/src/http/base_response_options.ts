import {Injectable} from 'angular2/src/core/di';
import {isPresent, isJsObject} from 'angular2/src/core/facade/lang';
import {Headers} from './headers';
import {ResponseTypes} from './enums';
import {ResponseOptionsArgs} from './interfaces';

/**
 * Creates a response options object to be optionally provided when instantiating a
 * {@link Response}.
 *
 * This class is based on the `ResponseInit` description in the [Fetch
 * Spec](https://fetch.spec.whatwg.org/#responseinit).
 *
 * All values are null by default. Typical defaults can be found in the
 * {@link BaseResponseOptions} class, which sub-classes `ResponseOptions`.
 *
 * This class may be used in tests to build {@link Response Responses} for
 * mock responses (see {@link MockBackend}).
 *
 * ### Example ([live demo](http://plnkr.co/edit/P9Jkk8e8cz6NVzbcxEsD?p=preview))
 *
 * ```typescript
 * import {ResponseOptions, Response} from 'angular2/http';
 *
 * var options = new ResponseOptions({
 *   body: '{"name":"Jeff"}'
 * });
 * var res = new Response(options);
 *
 * console.log('res.json():', res.json()); // Object {name: "Jeff"}
 * ```
 */
export class ResponseOptions {
  // TODO: ArrayBuffer | FormData | Blob
  /**
   * String or Object representing the body of the {@link Response}.
   */
  body: string | Object;
  /**
   * Http {@link http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html status code}
   * associated with the response.
   */
  status: number;
  /**
   * Response {@link Headers headers}
   */
  headers: Headers;
  /**
   * @private
   */
  statusText: string;
  /**
   * @private
   */
  type: ResponseTypes;
  url: string;
  constructor({body, status, headers, statusText, type, url}: ResponseOptionsArgs = {}) {
    this.body = isPresent(body) ? body : null;
    this.status = isPresent(status) ? status : null;
    this.headers = isPresent(headers) ? headers : null;
    this.statusText = isPresent(statusText) ? statusText : null;
    this.type = isPresent(type) ? type : null;
    this.url = isPresent(url) ? url : null;
  }

  /**
   * Creates a copy of the `ResponseOptions` instance, using the optional input as values to
   * override
   * existing values. This method will not change the values of the instance on which it is being
   * called.
   *
   * This may be useful when sharing a base `ResponseOptions` object inside tests,
   * where certain properties may change from test to test.
   *
   * Example ([live demo](http://plnkr.co/edit/1lXquqFfgduTFBWjNoRE?p=preview))
   *
   * ```typescript
   * import {ResponseOptions, Response} from 'angular2/http';
   *
   * var options = new ResponseOptions({
   *   body: {name: 'Jeff'}
   * });
   * var res = new Response(options.merge({
   *   url: 'https://google.com'
   * }));
   * console.log('options.url:', options.url); // null
   * console.log('res.json():', res.json()); // Object {name: "Jeff"}
   * console.log('res.url:', res.url); // https://google.com
   * ```
   */
  merge(options?: ResponseOptionsArgs): ResponseOptions {
    return new ResponseOptions({
      body: isPresent(options) && isPresent(options.body) ? options.body : this.body,
      status: isPresent(options) && isPresent(options.status) ? options.status : this.status,
      headers: isPresent(options) && isPresent(options.headers) ? options.headers : this.headers,
      statusText: isPresent(options) && isPresent(options.statusText) ? options.statusText :
                                                                        this.statusText,
      type: isPresent(options) && isPresent(options.type) ? options.type : this.type,
      url: isPresent(options) && isPresent(options.url) ? options.url : this.url,
    });
  }
}

/**
 * Injectable version of {@link ResponseOptions}, with overridable default values.
 */
@Injectable()
export class BaseResponseOptions extends ResponseOptions {
  // TODO: Object | ArrayBuffer | JSON | FormData | Blob
  body: string | Object | ArrayBuffer | JSON | FormData | Blob;
  status: number;
  headers: Headers;
  statusText: string;
  type: ResponseTypes;
  url: string;

  constructor() {
    super({status: 200, statusText: 'Ok', type: ResponseTypes.Default, headers: new Headers()});
  }
}
