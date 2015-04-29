import {RequestMethods, RequestModesOpts, RequestCredentialsOpts} from './enums';
import {URLSearchParams} from './url_search_params';
import {RequestOptions, Request as IRequest} from './interfaces';
import {Headers} from './headers';
import {BaseException, RegExpWrapper} from 'angular2/src/facade/lang';

// TODO(jeffbcross): implement body accessors
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
  private body: URLSearchParams | FormData | Blob | string;

  constructor(public url: string, {body, method = RequestMethods.GET, mode = RequestModesOpts.Cors,
                                   credentials = RequestCredentialsOpts.Omit,
                                   headers = new Headers()}: RequestOptions = {}) {
    this.body = body;
    // Defaults to 'GET', consistent with browser
    this.method = method;
    // Defaults to 'cors', consistent with browser
    // TODO(jeffbcross): implement behavior
    this.mode = mode;
    // Defaults to 'omit', consistent with browser
    // TODO(jeffbcross): implement behavior
    this.credentials = credentials;
    // Defaults to empty headers object, consistent with browser
    this.headers = headers;
  }

  text(): String { return this.body ? this.body.toString() : ''; }
}
