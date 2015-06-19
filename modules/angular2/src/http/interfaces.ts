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
import {BaseException} from 'angular2/src/facade/lang';
import {EventEmitter} from 'angular2/src/facade/async';
import {Request} from './static_request';

export class ConnectionBackend {
  constructor() {}
  createConnection(request: any): Connection { throw new BaseException('Abstract!'); }
}

export class Connection {
  readyState: ReadyStates;
  request: Request;
  response: EventEmitter;  //<IResponse>;
  dispose(): void { throw new BaseException('Abstract!'); }
}

export interface IRequestOptions {
  url?: string;
  method?: RequestMethods;
  headers?: Headers;
  // TODO: Support Blob, ArrayBuffer, JSON, URLSearchParams, FormData
  body?: string;
  mode?: RequestModesOpts;
  credentials?: RequestCredentialsOpts;
  cache?: RequestCacheOpts;
}

export interface ResponseOptions {
  // TODO: Support Blob, ArrayBuffer, JSON
  body?: string | Object | FormData;
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
  blob(): any;  // TODO: Blob
  arrayBuffer(): any;  // TODO: ArrayBuffer
  text(): string;
  json(): Object;
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
export interface IHttp { (url: string, options?: IRequestOptions): EventEmitter }
