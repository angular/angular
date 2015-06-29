/// <reference path="../../typings/rx/rx.d.ts" />

import {
  ReadyStates,
  RequestModesOpts,
  RequestMethods,
  RequestCacheOpts,
  RequestCredentialsOpts,
  ResponseTypes
} from './enums';
import {Headers} from './headers';
import {URLSearchParams} from './url_search_params';

export interface IRequestOptions {
  method?: RequestMethods;
  headers?: Headers;
  body?: URLSearchParams | FormData | Blob | string;
  mode?: RequestModesOpts;
  credentials?: RequestCredentialsOpts;
  cache?: RequestCacheOpts;
}

export interface IRequest {
  method: RequestMethods;
  mode: RequestModesOpts;
  credentials: RequestCredentialsOpts;
}

export interface ResponseOptions {
  status?: number;
  statusText?: string;
  headers?: Headers | Object;
  type?: ResponseTypes;
  url?: string;
}

export interface IResponse {
  headers: Headers;
  ok: boolean;
  status: number;
  statusText: string;
  type: ResponseTypes;
  url: string;
  totalBytes: number;
  bytesLoaded: number;
  blob(): Blob;
  arrayBuffer(): ArrayBuffer;
  text(): string;
  json(): Object;
}

export interface ConnectionBackend {
  createConnection(observer: any, config: IRequest): Connection;
}

export interface Connection {
  readyState: ReadyStates;
  request: IRequest;
  response: Rx.Subject<IResponse>;
  dispose(): void;
}

/**
 * Provides an interface to provide type information for {@link HttpFactory} when injecting.
 *
 * #Example
 *
 * ```
 * * import {httpInjectables, HttpFactory, IHttp} from 'angular2/http';
 * @Component({
 *   appInjector: [httpInjectables]
 * })
 * @View({
 *   templateUrl: 'people.html'
 * })
 * class MyComponent {
 *  constructor(@Inject(HttpFactory) http:IHttp) {
 *    http('people.json').subscribe(res => this.people = res.json());
 *  }
 * }
 * ```
 *
 */
// Prefixed as IHttp because used in conjunction with Http class, but interface is callable
// constructor(@Inject(Http) http:IHttp)
export interface IHttp { (url: string, options?: IRequestOptions): Rx.Observable<IResponse> }
