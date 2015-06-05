/// <reference path="../../typings/rx/rx.all.d.ts" />

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

export interface RequestOptions {
  method?: RequestMethods;
  headers?: Headers;
  body?: URLSearchParams | FormData | string;
  mode?: RequestModesOpts;
  credentials?: RequestCredentialsOpts;
  cache?: RequestCacheOpts;
}

export interface Request {
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

export interface Response {
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

export interface ConnectionBackend { createConnection(observer: any, config: Request): Connection; }

export interface Connection {
  readyState: ReadyStates;
  request: Request;
  response: Rx.Subject<Response>;
  dispose(): void;
}

// Prefixed as IHttp because used in conjunction with Http class, but interface is callable
// constructor(@Inject(Http) http:IHttp)
export interface IHttp { (url: string, options?: RequestOptions): Rx.Observable<Response> }
