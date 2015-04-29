import {CONST_EXPR, CONST} from 'angular2/src/facade/lang';
import {Headers} from './headers';
import {URLSearchParams} from './url_search_params';
import {RequestModesOpts, RequestMethods, RequestCacheOpts, RequestCredentialsOpts} from './enums';
import {RequestOptions} from './interfaces';
import {Injectable} from 'angular2/di';

@Injectable()
export class BaseRequestOptions implements RequestOptions {
  method: RequestMethods;
  headers: Headers;
  body: URLSearchParams | FormData | string;
  mode: RequestModesOpts;
  credentials: RequestCredentialsOpts;
  cache: RequestCacheOpts;

  constructor() {
    this.method = RequestMethods.GET;
    this.mode = RequestModesOpts.Cors;
  }
}
