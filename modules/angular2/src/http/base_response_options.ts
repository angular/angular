import {Injectable} from 'angular2/di';
import {isPresent, isJsObject} from 'angular2/src/core/facade/lang';
import {Headers} from './headers';
import {ResponseTypes} from './enums';
import {ResponseOptionsArgs} from './interfaces';

/**
 * Creates a response options object similar to the
 * [ResponseInit](https://fetch.spec.whatwg.org/#responseinit) description
 * in the Fetch
 * Spec to be optionally provided when instantiating a
 * {@link Response}.
 *
 * All values are null by default.
 */
export class ResponseOptions {
  // TODO: ArrayBuffer | FormData | Blob
  body: string | Object;
  status: number;
  headers: Headers;
  statusText: string;
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
