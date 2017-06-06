import {StringMapWrapper} from 'angular2/src/facade/collection';

/**
 * Supported http methods.
 */
export enum RequestMethod {
  Get,
  Post,
  Put,
  Delete,
  Options,
  Head,
  Patch
}

/**
 * All possible states in which a connection can be, based on
 * [States](http://www.w3.org/TR/XMLHttpRequest/#states) from the `XMLHttpRequest` spec, but with an
 * additional "CANCELLED" state.
 */
export enum ReadyState {
  Unsent,
  Open,
  HeadersReceived,
  Loading,
  Done,
  Cancelled
}

/**
 * Acceptable response types to be associated with a {@link Response}, based on
 * [ResponseType](https://fetch.spec.whatwg.org/#responsetype) from the Fetch spec.
 */
export enum ResponseType {
  Basic,
  Cors,
  Default,
  Error,
  Opaque
}
