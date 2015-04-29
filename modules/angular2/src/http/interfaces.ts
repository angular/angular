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

export interface IRequestOptions {
  method?: RequestMethods;
  headers?: Headers;
  body?: URLSearchParams | FormData | string;
  mode?: RequestModesOpts;
  credentials?: RequestCredentialsOpts;
  cache?: RequestCacheOpts;
}

export interface IRequest {
  method: RequestMethods;
  mode: RequestModesOpts;
  credentials: RequestCredentialsOpts;
}

export interface IResponseOptions {
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

export interface IConnectionBackend {
  createConnection(observer: any, config: IRequest): IConnection;
}

export interface IConnection {
  readyState: ReadyStates;
  request: IRequest;
  response: Rx.Subject<IResponse>;
  dispose(): void;
}

export interface IHttp { (url: string, options?: IRequestOptions): Rx.Observable<IResponse> }
