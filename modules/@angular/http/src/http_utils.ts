/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {isString} from '../src/facade/lang';

import {RequestMethod} from './enums';

export function normalizeMethodName(method: string | RequestMethod): RequestMethod {
  if (isString(method)) {
    var originalMethod = method;
    method = (<string>method)
                 .replace(
                     /(\w)(\w*)/g,
                     (g0: string, g1: string, g2: string) => g1.toUpperCase() + g2.toLowerCase());
    method = <RequestMethod>(<{[key: string]: any}>RequestMethod)[method];
    if (typeof method !== 'number')
      throw new Error(`Invalid request method. The method "${originalMethod}" is not supported.`);
  }
  return <RequestMethod>method;
}

export const isSuccess = (status: number): boolean => (status >= 200 && status < 300);

export function getResponseURL(xhr: any): string {
  if ('responseURL' in xhr) {
    return xhr.responseURL;
  }
  if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
    return xhr.getResponseHeader('X-Request-URL');
  }
  return;
}

export function stringToArrayBuffer(input: String): ArrayBuffer {
  let view = new Uint16Array(input.length);
  for (var i = 0, strLen = input.length; i < strLen; i++) {
    view[i] = input.charCodeAt(i);
  }
  return view.buffer;
}

export {isJsObject} from '../src/facade/lang';
