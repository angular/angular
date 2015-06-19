import {StringMap, StringMapWrapper} from 'angular2/src/facade/collection';

export enum RequestModesOpts {
  Cors,
  NoCors,
  SameOrigin
}

export enum RequestCacheOpts {
  Default,
  NoStore,
  Reload,
  NoCache,
  ForceCache,
  OnlyIfCached
}

export enum RequestCredentialsOpts {
  Omit,
  SameOrigin,
  Include
}

export enum RequestMethods {
  GET,
  POST,
  PUT,
  DELETE,
  OPTIONS,
  HEAD,
  PATCH
}

// TODO: Remove this when enum lookups are available in ts2dart
// https://github.com/angular/ts2dart/issues/221
export class RequestMethodsMap {
  private _methods: List<string>;
  constructor() { this._methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH']; }
  getMethod(method: int): string { return this._methods[method]; }
}

export enum ReadyStates {
  UNSENT,
  OPEN,
  HEADERS_RECEIVED,
  LOADING,
  DONE,
  CANCELLED
}

export enum ResponseTypes {
  Basic,
  Cors,
  Default,
  Error,
  Opaque
}
