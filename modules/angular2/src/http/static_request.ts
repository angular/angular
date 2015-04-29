import {RequestMethods, RequestModesOpts, RequestCredentialsOpts} from './enums';
import {URLSearchParams} from './url_search_params';
import {IRequestOptions, IRequest} from './interfaces';
import {Headers} from './headers';
import {baseRequestOptions} from './base_request_options';
import {BaseException, RegExpWrapper} from 'angular2/src/facade/lang';

export class Request implements IRequest {
  method: RequestMethods;
  mode: RequestModesOpts;
  credentials: RequestCredentialsOpts;
  headers: Headers;
  /*
   * Non-Standard Properties
   */
  // This property deviates from the standard. Body can be set in constructor, but is only
  // accessible
  // via json(), text(), arrayBuffer(), and blob() accessors, which also change the request's state
  // to "used".
  body: URLSearchParams | FormData | Blob | string;

  constructor(public url: string, {body, method, mode, credentials, headers,
                                   body}: IRequestOptions = baseRequestOptions) {
    this.body = body;
    this.method = method;
    this.mode = mode;
    this.credentials = credentials;
    this.headers = headers;
  }
}
