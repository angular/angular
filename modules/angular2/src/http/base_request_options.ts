import {CONST_EXPR, CONST, isPresent} from 'angular2/src/facade/lang';
import {Headers} from './headers';
import {URLSearchParams} from './url_search_params';
import {RequestModesOpts, RequestMethods, RequestCacheOpts, RequestCredentialsOpts} from './enums';
import {RequestOptions} from './interfaces';
import {Injectable} from 'angular2/di';
import {ListWrapper, StringMapWrapper} from 'angular2/src/facade/collection';

export class RequestOptionsClass {
  method: RequestMethods = RequestMethods.GET;
  headers: Headers;
  body: URLSearchParams | FormData | string;
  mode: RequestModesOpts = RequestModesOpts.Cors;
  credentials: RequestCredentialsOpts;
  cache: RequestCacheOpts;
  constructor({method, headers, body, mode, credentials,
               cache}: RequestOptions = {method: RequestMethods.GET, mode: RequestModesOpts.Cors}) {
    this.method = method;
    this.headers = headers;
    this.body = body;
    this.mode = mode;
    this.credentials = credentials;
    this.cache = cache;
  }

  merge(opts: RequestOptions = {}): RequestOptionsClass {
    return new RequestOptionsClass(StringMapWrapper.merge(this, opts));
  }
}

@Injectable()
export class BaseRequestOptions extends RequestOptionsClass {
  constructor() { super(); }
}
