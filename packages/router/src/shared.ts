/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Route, UrlMatchResult} from './config';
import {UrlSegment, UrlSegmentGroup} from './url_tree';

/**
 * @whatItDoes Name of the primary outlet.
 *
 * @stable
 */
export const PRIMARY_OUTLET = 'primary';

/**
 * Matrix and Query parameters.
 *
 * `simple=a&multiple=b&multiple=c`
 *
 * will result in the following value
 *
 * ```
 * {
 *    'simple': 'a',
 *    'multiple': ['b', 'c'],
 * }
 * ```
 *
 * @stable
 */
export type Params = {
  [key: string]: string | string[]
};

/**
 * Matrix and Query parameters.
 *
 * `ParamMap` makes it easier to work with parameters as they could have either a single value or
 * multiple value. Because this should be known by the user, calling `get` or `getAll` returns the
 * correct type (either `string` or `string[]`).
 *
 * The API is inspired by the URLSearchParams interface.
 * see https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
 *
 * @stable
 */
export interface ParamMap {
  has(name: string): boolean;
  /**
   * Return a single value for the given parameter name:
   * - the value when the parameter has a single value,
   * - the first value if the parameter has multiple values,
   * - `null` when there is no such parameter.
   */
  get(name: string): string|null;
  /**
   * Return an array of values for the given parameter name.
   *
   * If there is no such parameter, an empty array is returned.
   */
  getAll(name: string): string[];

  /** Name of the parameters */
  readonly keys: string[];
}

class ParamsAsMap implements ParamMap {
  private params: Params;

  constructor(params: Params) { this.params = params || {}; }

  has(name: string): boolean { return this.params.hasOwnProperty(name); }

  get(name: string): string|null {
    if (this.has(name)) {
      const v = this.params[name];
      return Array.isArray(v) ? v[0] : v;
    }

    return null;
  }

  getAll(name: string): string[] {
    if (this.has(name)) {
      const v = this.params[name];
      return Array.isArray(v) ? v : [v];
    }

    return [];
  }

  get keys(): string[] { return Object.keys(this.params); }
}

/**
 * Convert a {@link Params} instance to a {@link ParamMap}.
 *
 * @stable
 */
export function convertToParamMap(params: Params): ParamMap {
  return new ParamsAsMap(params);
}

// Stringify the values
export function convertToParams(params: {[name: string]: any | any[]}): Params {
  let qp: Params = {};
  if (params) {
    Object.keys(params).forEach((name: string) => {
      const value = params[name];
      qp[name] = Array.isArray(value) ? value.map((v: any) => `${v}`) : `${value}`;
    });
  }
  return qp;
}

export function equalsParams(a: Params, b: Params): boolean {
  return (Object.keys(a).length === Object.keys(b).length) && containsParams(a, b);
}

// return whether b is contained in a
export function containsParams(a: Params, b: Params): boolean {
  const names = Object.keys(b);
  if (names.length > Object.keys(a).length) return false;

  return names.every((name) => {
    if (!a.hasOwnProperty(name)) return false;
    const aValue = a[name];
    const aIsArray = Array.isArray(aValue);
    const bValue = b[name];
    const bIsArray = Array.isArray(bValue);
    if (aIsArray !== bIsArray) return false;
    return aIsArray ?
        aValue.length === bValue.length &&
            (<string[]>aValue).every(v => (<string[]>bValue).indexOf(v) > -1) :
        aValue === bValue;
  });
}

const NAVIGATION_CANCELING_ERROR = 'ngNavigationCancelingError';

export function navigationCancelingError(message: string) {
  const error = Error('NavigationCancelingError: ' + message);
  (error as any)[NAVIGATION_CANCELING_ERROR] = true;
  return error;
}

export function isNavigationCancelingError(error: Error) {
  return (error as any)[NAVIGATION_CANCELING_ERROR];
}

// Matches the route configuration (`route`) against the actual URL (`segments`).
export function defaultUrlMatcher(
    segments: UrlSegment[], segmentGroup: UrlSegmentGroup, route: Route): UrlMatchResult|null {
  const parts = route.path !.split('/');

  if (parts.length > segments.length) {
    // The actual URL is shorter than the config, no match
    return null;
  }

  if (route.pathMatch === 'full' &&
      (segmentGroup.hasChildren() || parts.length < segments.length)) {
    // The config is longer than the actual URL but we are looking for a full match, return null
    return null;
  }

  // Positional parameters `path/to/:param`
  const posParams: {[key: string]: UrlSegment} = {};

  // Check each config part against the actual URL
  for (let index = 0; index < parts.length; index++) {
    const part = parts[index];
    const segment = segments[index];
    const isParameter = part.startsWith(':');
    if (isParameter) {
      posParams[part.substring(1)] = segment;
    } else if (part !== segment.path) {
      // The actual URL part does not match the config, no match
      return null;
    }
  }

  return {consumed: segments.slice(0, parts.length), posParams};
}
