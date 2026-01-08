/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {Route, UrlMatchResult} from './models';
import type {UrlSegment, UrlSegmentGroup} from './url_tree';

/**
 * The primary routing outlet.
 *
 * @publicApi
 */
export const PRIMARY_OUTLET = 'primary';

/**
 * A private symbol used to store the value of `Route.title` inside the `Route.data` if it is a
 * static string or `Route.resolve` if anything else. This allows us to reuse the existing route
 * data/resolvers to support the title feature without new instrumentation in the `Router` pipeline.
 */
export const RouteTitleKey: unique symbol = /* @__PURE__ */ Symbol('RouteTitle');

/**
 * A collection of matrix and query URL parameters.
 * @see {@link convertToParamMap}
 * @see {@link ParamMap}
 *
 * @publicApi
 */
export type Params = {
  [key: string]: any;
};

/**
 * A map that provides access to the required and optional parameters
 * specific to a route.
 * The map supports retrieving a single value with `get()`
 * or multiple values with `getAll()`.
 *
 * @see [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)
 *
 * @publicApi
 */
export interface ParamMap {
  /**
   * Reports whether the map contains a given parameter.
   * @param name The parameter name.
   * @returns True if the map contains the given parameter, false otherwise.
   */
  has(name: string): boolean;
  /**
   * Retrieves a single value for a parameter.
   * @param name The parameter name.
   * @return The parameter's single value,
   * or the first value if the parameter has multiple values,
   * or `null` when there is no such parameter.
   */
  get(name: string): string | null;
  /**
   * Retrieves multiple values for a parameter.
   * @param name The parameter name.
   * @return An array containing one or more values,
   * or an empty array if there is no such parameter.
   *
   */
  getAll(name: string): string[];

  /** Names of the parameters in the map. */
  readonly keys: string[];
}

class ParamsAsMap implements ParamMap {
  private params: Params;

  constructor(params: Params) {
    this.params = params || {};
  }

  has(name: string): boolean {
    return Object.prototype.hasOwnProperty.call(this.params, name);
  }

  get(name: string): string | null {
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

  get keys(): string[] {
    return Object.keys(this.params);
  }
}

/**
 * Converts a `Params` instance to a `ParamMap`.
 * @param params The instance to convert.
 * @returns The new map instance.
 *
 * @publicApi
 */
export function convertToParamMap(params: Params): ParamMap {
  return new ParamsAsMap(params);
}

function matchParts(
  routeParts: string[],
  urlSegments: UrlSegment[],
  posParams: {[key: string]: UrlSegment},
): boolean {
  for (let i = 0; i < routeParts.length; i++) {
    const part = routeParts[i];
    const segment = urlSegments[i];
    const isParameter = part[0] === ':';
    if (isParameter) {
      posParams[part.substring(1)] = segment;
    } else if (part !== segment.path) {
      return false;
    }
  }
  return true;
}

/**
 * Matches the route configuration (`route`) against the actual URL (`segments`).
 *
 * When no matcher is defined on a `Route`, this is the matcher used by the Router by default.
 *
 * @param segments The remaining unmatched segments in the current navigation
 * @param segmentGroup The current segment group being matched
 * @param route The `Route` to match against.
 *
 * @see {@link UrlMatchResult}
 * @see {@link Route}
 *
 * @returns The resulting match information or `null` if the `route` should not match.
 * @publicApi
 */
export function defaultUrlMatcher(
  segments: UrlSegment[],
  segmentGroup: UrlSegmentGroup,
  route: Route,
): UrlMatchResult | null {
  const parts = route.path!.split('/');
  const wildcardIndex = parts.indexOf('**');
  if (wildcardIndex === -1) {
    // No wildcard, use original logic
    if (parts.length > segments.length) {
      // The actual URL is shorter than the config, no match
      return null;
    }

    if (
      route.pathMatch === 'full' &&
      (segmentGroup.hasChildren() || parts.length < segments.length) &&
      (parts.length + 1 !== segments.length || segments[parts.length].path !== '')
    ) {
      // The config is longer than the actual URL but we are looking for a full match, return null.
      //
      // We allow the actual URL to be longer than the config if it has exactly one trailing empty
      // segment (representing a trailing slash). This is because we want to allow `path: 'a'` to match
      // `/a/` if the global configuration allows it. We rely on the `Location` service or `UrlSerializer`
      // to strip the slash if it's not allowed, so if it's here, we should match it.
      return null;
    }

    const posParams: {[key: string]: UrlSegment} = {};
    const consumed = segments.slice(0, parts.length);
    if (!matchParts(parts, consumed, posParams)) {
      return null;
    }

    // If we matched the whole route and there is one remaining segment which is empty, consume it.
    // This allows `path: 'a'` to match `/a/`.
    if (segments.length === parts.length + 1 && segments[segments.length - 1].path === '') {
      consumed.push(segments[segments.length - 1]);
    }

    return {consumed, posParams};
  }

  // Path has a wildcard.
  if (wildcardIndex !== parts.lastIndexOf('**')) {
    // We do not support more than one wildcard segment in the path
    return null;
  }

  const pre = parts.slice(0, wildcardIndex);
  const post = parts.slice(wildcardIndex + 1);

  if (pre.length + post.length > segments.length) {
    // The actual URL is shorter than the config, no match
    return null;
  }

  if (route.pathMatch === 'full' && segmentGroup.hasChildren() && route.path !== '**') {
    // The config is longer than the actual URL but we are looking for a full match, return null
    return null;
  }

  const posParams: {[key: string]: UrlSegment} = {};

  // Match the segments before the wildcard
  if (!matchParts(pre, segments.slice(0, pre.length), posParams)) {
    return null;
  }
  // Match the segments after the wildcard
  if (!matchParts(post, segments.slice(segments.length - post.length), posParams)) {
    return null;
  }

  // TODO(atscott): put the wildcard segments into a _splat param.
  // this would require a breaking change to the UrlMatchResult to allow UrlSegment[]
  // since the splat could be multiple segments.

  return {consumed: segments, posParams};
}
