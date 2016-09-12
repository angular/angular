/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PRIMARY_OUTLET} from './shared';
import {forEach, shallowEqual} from './utils/collection';

export function createEmptyUrlTree() {
  return new UrlTree(new UrlSegmentGroup([], {}), {}, null);
}

export function containsTree(container: UrlTree, containee: UrlTree, exact: boolean): boolean {
  if (exact) {
    return equalSegmentGroups(container.root, containee.root);
  } else {
    return containsSegmentGroup(container.root, containee.root);
  }
}

function equalSegmentGroups(container: UrlSegmentGroup, containee: UrlSegmentGroup): boolean {
  if (!equalPath(container.segments, containee.segments)) return false;
  if (container.numberOfChildren !== containee.numberOfChildren) return false;
  for (let c in containee.children) {
    if (!container.children[c]) return false;
    if (!equalSegmentGroups(container.children[c], containee.children[c])) return false;
  }
  return true;
}

function containsSegmentGroup(container: UrlSegmentGroup, containee: UrlSegmentGroup): boolean {
  return containsSegmentGroupHelper(container, containee, containee.segments);
}

function containsSegmentGroupHelper(
    container: UrlSegmentGroup, containee: UrlSegmentGroup, containeePaths: UrlSegment[]): boolean {
  if (container.segments.length > containeePaths.length) {
    const current = container.segments.slice(0, containeePaths.length);
    if (!equalPath(current, containeePaths)) return false;
    if (containee.hasChildren()) return false;
    return true;

  } else if (container.segments.length === containeePaths.length) {
    if (!equalPath(container.segments, containeePaths)) return false;
    for (let c in containee.children) {
      if (!container.children[c]) return false;
      if (!containsSegmentGroup(container.children[c], containee.children[c])) return false;
    }
    return true;

  } else {
    const current = containeePaths.slice(0, container.segments.length);
    const next = containeePaths.slice(container.segments.length);
    if (!equalPath(container.segments, current)) return false;
    if (!container.children[PRIMARY_OUTLET]) return false;
    return containsSegmentGroupHelper(container.children[PRIMARY_OUTLET], containee, next);
  }
}

/**
 * @whatItDoes Represents the parsed URL.
 *
 * @howToUse
 *
 * ```
 * @Component({templateUrl:'template.html'})
 * class MyComponent {
 *   constructor(router: Router) {
 *     const tree: UrlTree =
 * router.parseUrl('/team/33/(user/victor//support:help)?debug=true#fragment');
 *     const f = tree.fragment; // return 'fragment'
 *     const q = tree.queryParams; // returns {debug: 'true'}
 *     const g: UrlSegmentGroup = tree.root.children[PRIMARY_OUTLET];
 *     const s: UrlSegment[] = g.segments; // returns 2 segments 'team' and '33'
 *     g.children[PRIMARY_OUTLET].segments; // returns 2 segments 'user' and 'victor'
 *     g.children['support'].segments; // return 1 segment 'help'
 *   }
 * }
 * ```
 *
 * @description
 *
 * Since a router state is a tree, and the URL is nothing but a serialized state, the URL is a
 * serialized tree.
 * UrlTree is a data structure that provides a lot of affordances in dealing with URLs
 *
 * @stable
 */
export class UrlTree {
  /**
   * @internal
   */
  constructor(
      /**
      * The root segment group of the URL tree.
       */
      public root: UrlSegmentGroup,
      /**
       * The query params of the URL.
       */
      public queryParams: {[key: string]: string},
      /**
       * The fragment of the URL.
       */
      public fragment: string) {}

  /**
   * @docsNotRequired
   */
  toString(): string { return new DefaultUrlSerializer().serialize(this); }
}

/**
 * @whatItDoes Represents the parsed URL segment.
 *
 * See {@link UrlTree} for more information.
 *
 * @stable
 */
export class UrlSegmentGroup {
  /**
   * @internal
   */
  _sourceSegment: UrlSegmentGroup;

  /**
   * @internal
   */
  _segmentIndexShift: number;

  /**
   * The parent node in the url tree.
   */
  public parent: UrlSegmentGroup = null;

  constructor(
      /**
       * The URL segments of this group. See {@link UrlSegment} for more information.
       */
      public segments: UrlSegment[],
      /**
       * The list of children of this group.
       */
      public children: {[key: string]: UrlSegmentGroup}

      ) {
    forEach(children, (v: any, k: any) => v.parent = this);
  }

  /**
   * Return true if the segment has child segments
   */
  hasChildren(): boolean { return this.numberOfChildren > 0; }

  /**
   * Returns the number of child sements.
   */
  get numberOfChildren(): number { return Object.keys(this.children).length; }

  /**
   * @docsNotRequired
   */
  toString(): string { return serializePaths(this); }
}


/**
 * @whatItDoes Represents a single URL segment.
 *
 * @howToUse
 *
 * ```
 * @Component({templateUrl:'template.html'})
 * class MyComponent {
 *   constructor(router: Router) {
 *     const tree: UrlTree = router.parseUrl('/team;id=33');
 *     const g: UrlSegmentGroup = tree.root.children[PRIMARY_OUTLET];
 *     const s: UrlSegment[] = g.segments;
 *     s[0].path; // returns 'team'
 *     s[0].parameters; // returns {id: 33}
 *   }
 * }
 * ```
 *
 * @description
 *
 * A UrlSegment is a part of a URL between the two slashes. It contains a path and
 * the matrix parameters associated with the segment.
 *
 * @stable
 */
export class UrlSegment {
  constructor(
      /**
       * The part part of a URL segment.
       */
      public path: string,

      /**
       * The matrix parameters associated with a segment.
       */
      public parameters: {[key: string]: string}) {}

  /**
   * @docsNotRequired
   */
  toString(): string { return serializePath(this); }
}

export function equalSegments(a: UrlSegment[], b: UrlSegment[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; ++i) {
    if (a[i].path !== b[i].path) return false;
    if (!shallowEqual(a[i].parameters, b[i].parameters)) return false;
  }
  return true;
}

export function equalPath(a: UrlSegment[], b: UrlSegment[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; ++i) {
    if (a[i].path !== b[i].path) return false;
  }
  return true;
}

export function mapChildrenIntoArray<T>(
    segment: UrlSegmentGroup, fn: (v: UrlSegmentGroup, k: string) => T[]): T[] {
  let res: T[] = [];
  forEach(segment.children, (child: UrlSegmentGroup, childOutlet: string) => {
    if (childOutlet === PRIMARY_OUTLET) {
      res = res.concat(fn(child, childOutlet));
    }
  });
  forEach(segment.children, (child: UrlSegmentGroup, childOutlet: string) => {
    if (childOutlet !== PRIMARY_OUTLET) {
      res = res.concat(fn(child, childOutlet));
    }
  });
  return res;
}


/**
 * @whatItDoes Serializes and deserializes a URL string into a URL tree.
 *
 * @description The url serialization strategy is customizable. You can
 * make all URLs case insensitive by providing a custom UrlSerializer.
 *
 * See {@link DefaultUrlSerializer} for an example of a URL serializer.
 *
 * @stable
 */
export abstract class UrlSerializer {
  /**
   * Parse a url into a {@link UrlTree}.
   */
  abstract parse(url: string): UrlTree;

  /**
   * Converts a {@link UrlTree} into a url.
   */
  abstract serialize(tree: UrlTree): string;
}

/**
 * @whatItDoes A default implementation of the {@link UrlSerializer}.
 *
 * @description
 *
 * Example URLs:
 *
 * ```
 * /inbox/33(popup:compose)
 * /inbox/33;open=true/messages/44
 * ```
 *
 * DefaultUrlSerializer uses parentheses to serialize secondary segments (e.g., popup:compose), the
 * colon syntax to specify the outlet, and the ';parameter=value' syntax (e.g., open=true) to
 * specify route specific parameters.
 *
 * @stable
 */
export class DefaultUrlSerializer implements UrlSerializer {
  /**
   * Parse a url into a {@link UrlTree}.
   */
  parse(url: string): UrlTree {
    const p = new UrlParser(url);
    return new UrlTree(p.parseRootSegment(), p.parseQueryParams(), p.parseFragment());
  }

  /**
   * Converts a {@link UrlTree} into a url.
   */
  serialize(tree: UrlTree): string {
    const segment = `/${serializeSegment(tree.root, true)}`;
    const query = serializeQueryParams(tree.queryParams);
    const fragment =
        tree.fragment !== null && tree.fragment !== undefined ? `#${encodeURI(tree.fragment)}` : '';
    return `${segment}${query}${fragment}`;
  }
}

export function serializePaths(segment: UrlSegmentGroup): string {
  return segment.segments.map(p => serializePath(p)).join('/');
}

function serializeSegment(segment: UrlSegmentGroup, root: boolean): string {
  if (segment.hasChildren() && root) {
    const primary = segment.children[PRIMARY_OUTLET] ?
        serializeSegment(segment.children[PRIMARY_OUTLET], false) :
        '';
    const children: string[] = [];
    forEach(segment.children, (v: UrlSegmentGroup, k: string) => {
      if (k !== PRIMARY_OUTLET) {
        children.push(`${k}:${serializeSegment(v, false)}`);
      }
    });
    if (children.length > 0) {
      return `${primary}(${children.join('//')})`;
    } else {
      return `${primary}`;
    }

  } else if (segment.hasChildren() && !root) {
    const children = mapChildrenIntoArray(segment, (v: UrlSegmentGroup, k: string) => {
      if (k === PRIMARY_OUTLET) {
        return [serializeSegment(segment.children[PRIMARY_OUTLET], false)];
      } else {
        return [`${k}:${serializeSegment(v, false)}`];
      }
    });
    return `${serializePaths(segment)}/(${children.join('//')})`;

  } else {
    return serializePaths(segment);
  }
}

export function encode(s: string): string {
  return encodeURIComponent(s);
}

export function decode(s: string): string {
  return decodeURIComponent(s);
}

export function serializePath(path: UrlSegment): string {
  return `${encode(path.path)}${serializeParams(path.parameters)}`;
}

function serializeParams(params: {[key: string]: string}): string {
  return pairs(params).map(p => `;${encode(p.first)}=${encode(p.second)}`).join('');
}

function serializeQueryParams(params: {[key: string]: string}): string {
  const strs = pairs(params).map(p => `${encode(p.first)}=${encode(p.second)}`);
  return strs.length > 0 ? `?${strs.join("&")}` : '';
}

class Pair<A, B> {
  constructor(public first: A, public second: B) {}
}
function pairs<T>(obj: {[key: string]: T}): Pair<string, T>[] {
  const res: Pair<string, T>[] = [];
  for (let prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      res.push(new Pair<string, T>(prop, obj[prop]));
    }
  }
  return res;
}

const SEGMENT_RE = /^[^\/\(\)\?;=&#]+/;
function matchSegments(str: string): string {
  SEGMENT_RE.lastIndex = 0;
  const match = str.match(SEGMENT_RE);
  return match ? match[0] : '';
}

const QUERY_PARAM_RE = /^[^=\?&#]+/;
function matchQueryParams(str: string): string {
  QUERY_PARAM_RE.lastIndex = 0;
  const match = str.match(SEGMENT_RE);
  return match ? match[0] : '';
}

const QUERY_PARAM_VALUE_RE = /^[^\?&#]+/;
function matchUrlQueryParamValue(str: string): string {
  QUERY_PARAM_VALUE_RE.lastIndex = 0;
  const match = str.match(QUERY_PARAM_VALUE_RE);
  return match ? match[0] : '';
}

class UrlParser {
  private remaining: string;
  constructor(private url: string) { this.remaining = url; }

  peekStartsWith(str: string): boolean { return this.remaining.startsWith(str); }

  capture(str: string): void {
    if (!this.remaining.startsWith(str)) {
      throw new Error(`Expected "${str}".`);
    }
    this.remaining = this.remaining.substring(str.length);
  }

  parseRootSegment(): UrlSegmentGroup {
    if (this.remaining.startsWith('/')) {
      this.capture('/');
    }

    if (this.remaining === '' || this.remaining.startsWith('?') || this.remaining.startsWith('#')) {
      return new UrlSegmentGroup([], {});
    } else {
      return new UrlSegmentGroup([], this.parseChildren());
    }
  }

  parseChildren(): {[key: string]: UrlSegmentGroup} {
    if (this.remaining.length == 0) {
      return {};
    }

    if (this.peekStartsWith('/')) {
      this.capture('/');
    }

    let paths: any[] = [];
    if (!this.peekStartsWith('(')) {
      paths.push(this.parseSegments());
    }

    while (this.peekStartsWith('/') && !this.peekStartsWith('//') && !this.peekStartsWith('/(')) {
      this.capture('/');
      paths.push(this.parseSegments());
    }

    let children: {[key: string]: UrlSegmentGroup} = {};
    if (this.peekStartsWith('/(')) {
      this.capture('/');
      children = this.parseParens(true);
    }

    let res: {[key: string]: UrlSegmentGroup} = {};
    if (this.peekStartsWith('(')) {
      res = this.parseParens(false);
    }

    if (paths.length > 0 || Object.keys(children).length > 0) {
      res[PRIMARY_OUTLET] = new UrlSegmentGroup(paths, children);
    }

    return res;
  }

  parseSegments(): UrlSegment {
    const path = matchSegments(this.remaining);
    if (path === '' && this.peekStartsWith(';')) {
      throw new Error(`Empty path url segment cannot have parameters: '${this.remaining}'.`);
    }

    this.capture(path);
    let matrixParams: {[key: string]: any} = {};
    if (this.peekStartsWith(';')) {
      matrixParams = this.parseMatrixParams();
    }
    return new UrlSegment(decode(path), matrixParams);
  }

  parseQueryParams(): {[key: string]: any} {
    const params: {[key: string]: any} = {};
    if (this.peekStartsWith('?')) {
      this.capture('?');
      this.parseQueryParam(params);
      while (this.remaining.length > 0 && this.peekStartsWith('&')) {
        this.capture('&');
        this.parseQueryParam(params);
      }
    }
    return params;
  }

  parseFragment(): string {
    if (this.peekStartsWith('#')) {
      return decodeURI(this.remaining.substring(1));
    } else {
      return null;
    }
  }

  parseMatrixParams(): {[key: string]: any} {
    const params: {[key: string]: any} = {};
    while (this.remaining.length > 0 && this.peekStartsWith(';')) {
      this.capture(';');
      this.parseParam(params);
    }
    return params;
  }

  parseParam(params: {[key: string]: any}): void {
    const key = matchSegments(this.remaining);
    if (!key) {
      return;
    }
    this.capture(key);
    let value: any = '';
    if (this.peekStartsWith('=')) {
      this.capture('=');
      const valueMatch = matchSegments(this.remaining);
      if (valueMatch) {
        value = valueMatch;
        this.capture(value);
      }
    }

    params[decode(key)] = decode(value);
  }

  parseQueryParam(params: {[key: string]: any}): void {
    const key = matchQueryParams(this.remaining);
    if (!key) {
      return;
    }
    this.capture(key);
    let value: any = '';
    if (this.peekStartsWith('=')) {
      this.capture('=');
      var valueMatch = matchUrlQueryParamValue(this.remaining);
      if (valueMatch) {
        value = valueMatch;
        this.capture(value);
      }
    }
    params[decode(key)] = decode(value);
  }

  parseParens(allowPrimary: boolean): {[key: string]: UrlSegmentGroup} {
    const segments: {[key: string]: UrlSegmentGroup} = {};
    this.capture('(');
    while (!this.peekStartsWith(')') && this.remaining.length > 0) {
      const path = matchSegments(this.remaining);

      const next = this.remaining[path.length];

      // if is is not one of these characters, then the segment was unescaped
      // or the group was not closed
      if (next !== '/' && next !== ')' && next !== ';') {
        throw new Error(`Cannot parse url '${this.url}'`);
      }

      let outletName: string;
      if (path.indexOf(':') > -1) {
        outletName = path.substr(0, path.indexOf(':'));
        this.capture(outletName);
        this.capture(':');
      } else if (allowPrimary) {
        outletName = PRIMARY_OUTLET;
      }

      const children = this.parseChildren();
      segments[outletName] = Object.keys(children).length === 1 ? children[PRIMARY_OUTLET] :
                                                                  new UrlSegmentGroup([], children);
      if (this.peekStartsWith('//')) {
        this.capture('//');
      }
    }
    this.capture(')');
    return segments;
  }
}
