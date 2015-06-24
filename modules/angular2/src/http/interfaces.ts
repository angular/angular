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
  response: EventEmitter;  // TODO: generic of <Response>;
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

export interface IResponseOptions {
  // TODO: Support Blob, ArrayBuffer, JSON
  body?: string | Object | FormData;
  status?: number;
  statusText?: string;
  headers?: Headers;
  type?: ResponseTypes;
  url?: string;
}
