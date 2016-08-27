/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ListWrapper, Map, isListLikeIterable} from '../src/facade/collection';
import {isPresent} from '../src/facade/lang';

function paramParser(rawParams: string = ''): Map<string, string[]> {
  const map = new Map<string, string[]>();
  if (rawParams.length > 0) {
    const params: string[] = rawParams.split('&');
    params.forEach((param: string) => {
      const eqIdx = param.indexOf('=');
      const [key, val]: string[] =
          eqIdx == -1 ? [param, ''] : [param.slice(0, eqIdx), param.slice(eqIdx + 1)];
      const list = map.get(key) || [];
      list.push(val);
      map.set(key, list);
    });
  }
  return map;
}
/**
 * @experimental
 **/
export class QueryEncoder {
  encodeKey(k: string): string { return standardEncoding(k); }

  encodeValue(v: string): string { return standardEncoding(v); }
}

function standardEncoding(v: string): string {
  return encodeURIComponent(v)
      .replace(/%40/gi, '@')
      .replace(/%3A/gi, ':')
      .replace(/%24/gi, '$')
      .replace(/%2C/gi, ',')
      .replace(/%3B/gi, ';')
      .replace(/%2B/gi, '+')
      .replace(/%3D/gi, '=')
      .replace(/%3F/gi, '?')
      .replace(/%2F/gi, '/');
}

/**
 * Map-like representation of url search parameters, based on
 * [URLSearchParams](https://url.spec.whatwg.org/#urlsearchparams) in the url living standard,
 * with several extensions for merging URLSearchParams objects:
 *   - setAll()
 *   - appendAll()
 *   - replaceAll()
 *
 * This class accepts an optional second parameter of ${@link QueryEncoder},
 * which is used to serialize parameters before making a request. By default,
 * `QueryEncoder` encodes keys and values of parameters using `encodeURIComponent`,
 * and then un-encodes certain characters that are allowed to be part of the query
 * according to IETF RFC 3986: https://tools.ietf.org/html/rfc3986.
 *
 * These are the characters that are not encoded: `! $ \' ( ) * + , ; A 9 - . _ ~ ? /`
 *
 * If the set of allowed query characters is not acceptable for a particular backend,
 * `QueryEncoder` can be subclassed and provided as the 2nd argument to URLSearchParams.
 *
 * ```
 * import {URLSearchParams, QueryEncoder} from '@angular/http';
 * class MyQueryEncoder extends QueryEncoder {
 *   encodeKey(k: string): string {
 *     return myEncodingFunction(k);
 *   }
 *
 *   encodeValue(v: string): string {
 *     return myEncodingFunction(v);
 *   }
 * }
 *
 * let params = new URLSearchParams('', new MyQueryEncoder());
 * ```
 * @experimental
 */
export class URLSearchParams {
  paramsMap: Map<string, string[]>;
  constructor(
      public rawParams: string = '', private queryEncoder: QueryEncoder = new QueryEncoder()) {
    this.paramsMap = paramParser(rawParams);
  }

  clone(): URLSearchParams {
    var clone = new URLSearchParams('', this.queryEncoder);
    clone.appendAll(this);
    return clone;
  }

  has(param: string): boolean { return this.paramsMap.has(param); }

  get(param: string): string {
    var storedParam = this.paramsMap.get(param);
    if (isListLikeIterable(storedParam)) {
      return ListWrapper.first(storedParam);
    } else {
      return null;
    }
  }

  getAll(param: string): string[] {
    var mapParam = this.paramsMap.get(param);
    return isPresent(mapParam) ? mapParam : [];
  }

  set(param: string, val: string) {
    var mapParam = this.paramsMap.get(param);
    var list = isPresent(mapParam) ? mapParam : [];
    ListWrapper.clear(list);
    list.push(val);
    this.paramsMap.set(param, list);
  }

  // A merge operation
  // For each name-values pair in `searchParams`, perform `set(name, values[0])`
  //
  // E.g: "a=[1,2,3], c=[8]" + "a=[4,5,6], b=[7]" = "a=[4], c=[8], b=[7]"
  //
  // TODO(@caitp): document this better
  setAll(searchParams: URLSearchParams) {
    searchParams.paramsMap.forEach((value, param) => {
      var mapParam = this.paramsMap.get(param);
      var list = isPresent(mapParam) ? mapParam : [];
      ListWrapper.clear(list);
      list.push(value[0]);
      this.paramsMap.set(param, list);
    });
  }

  append(param: string, val: string): void {
    var mapParam = this.paramsMap.get(param);
    var list = isPresent(mapParam) ? mapParam : [];
    list.push(val);
    this.paramsMap.set(param, list);
  }

  // A merge operation
  // For each name-values pair in `searchParams`, perform `append(name, value)`
  // for each value in `values`.
  //
  // E.g: "a=[1,2], c=[8]" + "a=[3,4], b=[7]" = "a=[1,2,3,4], c=[8], b=[7]"
  //
  // TODO(@caitp): document this better
  appendAll(searchParams: URLSearchParams) {
    searchParams.paramsMap.forEach((value, param) => {
      var mapParam = this.paramsMap.get(param);
      var list = isPresent(mapParam) ? mapParam : [];
      for (var i = 0; i < value.length; ++i) {
        list.push(value[i]);
      }
      this.paramsMap.set(param, list);
    });
  }


  // A merge operation
  // For each name-values pair in `searchParams`, perform `delete(name)`,
  // followed by `set(name, values)`
  //
  // E.g: "a=[1,2,3], c=[8]" + "a=[4,5,6], b=[7]" = "a=[4,5,6], c=[8], b=[7]"
  //
  // TODO(@caitp): document this better
  replaceAll(searchParams: URLSearchParams) {
    searchParams.paramsMap.forEach((value, param) => {
      var mapParam = this.paramsMap.get(param);
      var list = isPresent(mapParam) ? mapParam : [];
      ListWrapper.clear(list);
      for (var i = 0; i < value.length; ++i) {
        list.push(value[i]);
      }
      this.paramsMap.set(param, list);
    });
  }

  toString(): string {
    var paramsList: string[] = [];
    this.paramsMap.forEach((values, k) => {
      values.forEach(
          v => paramsList.push(
              this.queryEncoder.encodeKey(k) + '=' + this.queryEncoder.encodeValue(v)));
    });
    return paramsList.join('&');
  }

  delete (param: string): void { this.paramsMap.delete(param); }
}
