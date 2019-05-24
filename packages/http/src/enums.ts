/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Supported http methods.
 * @deprecated see https://angular.io/guide/http
 * @publicApi
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
 * @deprecated see https://angular.io/guide/http
 * @publicApi
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
 * @deprecated see https://angular.io/guide/http
 * @publicApi
 */
export enum ResponseType {
  Basic,
  Cors,
  Default,
  Error,
  Opaque
}

/**
 * Supported content type to be automatically associated with a {@link Request}.
 * @deprecated see https://angular.io/guide/http
 */
export enum ContentType {
  NONE,
  JSON,
  FORM,
  FORM_DATA,
  TEXT,
  BLOB,
  ARRAY_BUFFER
}

/**
 * Define which buffer to use to store the response
 * @deprecated see https://angular.io/guide/http
 * @publicApi
 */
export enum ResponseContentType {
  Text,
  Json,
  ArrayBuffer,
  Blob
}
