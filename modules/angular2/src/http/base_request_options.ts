import {Headers} from './headers';
import {URLSearchParams} from './url_search_params';
import {RequestModesOpts, RequestMethods, RequestCacheOpts, RequestCredentialsOpts} from './enums';
import {IRequestOptions} from './interfaces';

export class BaseRequestOptions {
  method: RequestMethods;
  headers: Headers;
  body: URLSearchParams | FormData | string;
  mode: RequestModesOpts;
  credentials: RequestCredentialsOpts;
  cache: RequestCacheOpts;

  constructor({method = RequestMethods.GET, headers, body, mode = RequestModesOpts.Cors,
               credentials, cache}: IRequestOptions = {}) {
    this.method = method;
    this.headers = headers;
    this.body = body;
    this.mode = mode;
    this.credentials = credentials;
    this.cache = cache;
  }
}
;

export var baseRequestOptions = Object.freeze(new BaseRequestOptions());
