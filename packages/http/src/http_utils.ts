/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {RequestMethod} from './enums';

export function normalizeMethodName(method: string | RequestMethod): RequestMethod {
  if (typeof method !== 'string') return method;

  switch (method.toUpperCase()) {
    case 'GET':
      return RequestMethod.Get;
    case 'POST':
      return RequestMethod.Post;
    case 'PUT':
      return RequestMethod.Put;
    case 'DELETE':
      return RequestMethod.Delete;
    case 'OPTIONS':
      return RequestMethod.Options;
    case 'HEAD':
      return RequestMethod.Head;
    case 'PATCH':
      return RequestMethod.Patch;
  }
  throw new Error(`Invalid request method. The method "${method}" is not supported.`);
}

export const isSuccess = (status: number): boolean => (status >= 200 && status < 300);

export function getResponseURL(xhr: any): string|null {
  if ('responseURL' in xhr) {
    return xhr.responseURL;
  }
  if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
    return xhr.getResponseHeader('X-Request-URL');
  }
  return null;
}

export function stringToArrayBuffer8(input: String): ArrayBuffer {
  const view = new Uint8Array(input.length);
  for (let i = 0, strLen = input.length; i < strLen; i++) {
    view[i] = input.charCodeAt(i);
  }
  return view.buffer;
}


export function stringToArrayBuffer(input: String): ArrayBuffer {
  const view = new Uint16Array(input.length);
  for (let i = 0, strLen = input.length; i < strLen; i++) {
    view[i] = input.charCodeAt(i);
  }
  return view.buffer;
}
