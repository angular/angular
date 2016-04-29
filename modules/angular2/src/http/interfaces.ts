import {ReadyState, RequestMethod, ResponseType} from './enums';
import {Headers} from './headers';
import {BaseException, WrappedException} from 'angular2/src/facade/exceptions';
import {EventEmitter} from 'angular2/src/facade/async';
import {Request} from './static_request';
import {URLSearchParams} from './url_search_params';

/**
 * Abstract class from which real backends are derived.
 *
 * The primary purpose of a `ConnectionBackend` is to create new connections to fulfill a given
 * {@link Request}.
 */
export abstract class ConnectionBackend { abstract createConnection(request: any): Connection; }

/**
 * Abstract class from which real connections are derived.
 */
export abstract class Connection {
  readyState: ReadyState;
  request: Request;
  response: any;  // TODO: generic of <Response>;
}

/**
 * Interface for options to construct a RequestOptions, based on
 * [RequestInit](https://fetch.spec.whatwg.org/#requestinit) from the Fetch spec.
 */
export interface RequestOptionsArgs {
  url?: string;
  method?: string | RequestMethod;
  search?: string | URLSearchParams;
  headers?: Headers;
  // TODO: Support Blob, ArrayBuffer, JSON, URLSearchParams, FormData
  body?: string;
}

/**
 * Required structure when constructing new Request();
 */
export interface RequestArgs extends RequestOptionsArgs { url: string; }

/**
 * Interface for options to construct a Response, based on
 * [ResponseInit](https://fetch.spec.whatwg.org/#responseinit) from the Fetch spec.
 */
export type ResponseOptionsArgs = {
  // TODO: Support Blob, ArrayBuffer, JSON
  body?: string | Object | FormData;
  status?: number;
  statusText?: string;
  headers?: Headers;
  type?: ResponseType;
  url?: string;
}
