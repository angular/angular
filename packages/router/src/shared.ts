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
 * A collection of parameters.
 *
 * @stable
 */
export type Params = {
  [key: string]: any
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

const NAVIGATION_CANCELING_ERROR = 'ngNavigationCancelingError';

export function navigationCancelingError(message: string) {
  const error = Error('NavigationCancelingError: ' + message);
  (error as any)[NAVIGATION_CANCELING_ERROR] = true;
  return error;
}

export function isNavigationCancelingError(error: Error) {
  return (error as any)[NAVIGATION_CANCELING_ERROR];
}

export function defaultUrlMatcher(
    segments: UrlSegment[], segmentGroup: UrlSegmentGroup, route: Route): UrlMatchResult {
  const path = route.path;
  const parts = path.split('/');
  const posParams: {[key: string]: UrlSegment} = {};
  const consumed: UrlSegment[] = [];

  let currentIndex = 0;

  for (let i = 0; i < parts.length; ++i) {
    if (currentIndex >= segments.length) return null;
    const current = segments[currentIndex];

    const p = parts[i];
    const isPosParam = p.startsWith(':');

    if (!isPosParam && p !== current.path) return null;
    if (isPosParam) {
      posParams[p.substring(1)] = current;
    }
    consumed.push(current);
    currentIndex++;
  }

  if (route.pathMatch === 'full' &&
      (segmentGroup.hasChildren() || currentIndex < segments.length)) {
    return null;
  } else {
    return {consumed, posParams};
  }
}
