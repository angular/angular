import {PRIMARY_OUTLET} from './shared';
import {forEach, shallowEqual} from './utils/collection';

export function createEmptyUrlTree() {
  return new UrlTree(new UrlSegment([], {}), {}, null);
}

export function containsTree(container: UrlTree, containee: UrlTree, exact: boolean): boolean {
  if (exact) {
    return equalSegments(container.root, containee.root);
  } else {
    return containsSegment(container.root, containee.root);
  }
}

function equalSegments(container: UrlSegment, containee: UrlSegment): boolean {
  if (!equalPath(container.pathsWithParams, containee.pathsWithParams)) return false;
  if (Object.keys(container.children).length !== Object.keys(containee.children).length)
    return false;
  for (let c in containee.children) {
    if (!container.children[c]) return false;
    if (!equalSegments(container.children[c], containee.children[c])) return false;
  }
  return true;
}

function containsSegment(container: UrlSegment, containee: UrlSegment): boolean {
  return containsSegmentHelper(container, containee, containee.pathsWithParams);
}

function containsSegmentHelper(
    container: UrlSegment, containee: UrlSegment, containeePaths: UrlPathWithParams[]): boolean {
  if (container.pathsWithParams.length > containeePaths.length) {
    const current = container.pathsWithParams.slice(0, containeePaths.length);
    if (!equalPath(current, containeePaths)) return false;
    if (Object.keys(containee.children).length > 0) return false;
    return true;

  } else if (container.pathsWithParams.length === containeePaths.length) {
    if (!equalPath(container.pathsWithParams, containeePaths)) return false;
    for (let c in containee.children) {
      if (!container.children[c]) return false;
      if (!containsSegment(container.children[c], containee.children[c])) return false;
    }
    return true;

  } else {
    const current = containeePaths.slice(0, container.pathsWithParams.length);
    const next = containeePaths.slice(container.pathsWithParams.length);
    if (!equalPath(container.pathsWithParams, current)) return false;
    return containsSegmentHelper(container.children[PRIMARY_OUTLET], containee, next);
  }
}

/**
 * A URL in the tree form.
 */
export class UrlTree {
  /**
   * @internal
   */
  constructor(
      public root: UrlSegment, public queryParams: {[key: string]: string},
      public fragment: string) {}

  toString(): string { return new DefaultUrlSerializer().serialize(this); }
}

export class UrlSegment {
  public parent: UrlSegment = null;
  constructor(
      public pathsWithParams: UrlPathWithParams[], public children: {[key: string]: UrlSegment}) {
    forEach(children, (v: any, k: any) => v.parent = this);
  }

  hasChildren(): boolean { return Object.keys(this.children).length > 0; }

  toString(): string { return serializePaths(this); }
}

export class UrlPathWithParams {
  constructor(public path: string, public parameters: {[key: string]: string}) {}
  toString(): string { return serializePath(this); }
}

export function equalPathsWithParams(a: UrlPathWithParams[], b: UrlPathWithParams[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; ++i) {
    if (a[i].path !== b[i].path) return false;
    if (!shallowEqual(a[i].parameters, b[i].parameters)) return false;
  }
  return true;
}

export function equalPath(a: UrlPathWithParams[], b: UrlPathWithParams[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; ++i) {
    if (a[i].path !== b[i].path) return false;
  }
  return true;
}

export function mapChildren(segment: UrlSegment, fn: (v: UrlSegment, k: string) => UrlSegment):
    {[name: string]: UrlSegment} {
  const newChildren: {[name: string]: UrlSegment} = {};
  forEach(segment.children, (child: UrlSegment, childOutlet: string) => {
    if (childOutlet === PRIMARY_OUTLET) {
      newChildren[childOutlet] = fn(child, childOutlet);
    }
  });
  forEach(segment.children, (child: UrlSegment, childOutlet: string) => {
    if (childOutlet !== PRIMARY_OUTLET) {
      newChildren[childOutlet] = fn(child, childOutlet);
    }
  });
  return newChildren;
}

export function mapChildrenIntoArray<T>(
    segment: UrlSegment, fn: (v: UrlSegment, k: string) => T[]): T[] {
  let res: T[] = [];
  forEach(segment.children, (child: UrlSegment, childOutlet: string) => {
    if (childOutlet === PRIMARY_OUTLET) {
      res = res.concat(fn(child, childOutlet));
    }
  });
  forEach(segment.children, (child: UrlSegment, childOutlet: string) => {
    if (childOutlet !== PRIMARY_OUTLET) {
      res = res.concat(fn(child, childOutlet));
    }
  });
  return res;
}


/**
 * Defines a way to serialize/deserialize a url tree.
 */
export abstract class UrlSerializer {
  /**
   * Parse a url into a {@Link UrlTree}
   */
  abstract parse(url: string): UrlTree;

  /**
   * Converts a {@Link UrlTree} into a url
   */
  abstract serialize(tree: UrlTree): string;
}

/**
 * A default implementation of the serialization.
 */
export class DefaultUrlSerializer implements UrlSerializer {
  parse(url: string): UrlTree {
    const p = new UrlParser(url);
    return new UrlTree(p.parseRootSegment(), p.parseQueryParams(), p.parseFragment());
  }

  serialize(tree: UrlTree): string {
    const segment = `/${serializeSegment(tree.root, true)}`;
    const query = serializeQueryParams(tree.queryParams);
    const fragment = tree.fragment !== null ? `#${tree.fragment}` : '';
    return `${segment}${query}${fragment}`;
  }
}

export function serializePaths(segment: UrlSegment): string {
  return segment.pathsWithParams.map(p => serializePath(p)).join('/');
}

function serializeSegment(segment: UrlSegment, root: boolean): string {
  if (segment.children[PRIMARY_OUTLET] && root) {
    const primary = serializeSegment(segment.children[PRIMARY_OUTLET], false);
    const children: string[] = [];
    forEach(segment.children, (v: UrlSegment, k: string) => {
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
    const children = mapChildrenIntoArray(segment, (v: UrlSegment, k: string) => {
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

export function serializePath(path: UrlPathWithParams): string {
  return `${path.path}${serializeParams(path.parameters)}`;
}

function serializeParams(params: {[key: string]: string}): string {
  return pairs(params).map(p => `;${p.first}=${p.second}`).join('');
}

function serializeQueryParams(params: {[key: string]: string}): string {
  const strs = pairs(params).map(p => `${p.first}=${p.second}`);
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
function matchPathWithParams(str: string): string {
  SEGMENT_RE.lastIndex = 0;
  const match = SEGMENT_RE.exec(str);
  return match ? match[0] : '';
}

const QUERY_PARAM_RE = /^[^=\?&#]+/;
function matchQueryParams(str: string): string {
  QUERY_PARAM_RE.lastIndex = 0;
  const match = SEGMENT_RE.exec(str);
  return match ? match[0] : '';
}

const QUERY_PARAM_VALUE_RE = /^[^\?&#]+/;
function matchUrlQueryParamValue(str: string): string {
  QUERY_PARAM_VALUE_RE.lastIndex = 0;
  const match = QUERY_PARAM_VALUE_RE.exec(str);
  return match ? match[0] : '';
}

class UrlParser {
  constructor(private remaining: string) {}

  peekStartsWith(str: string): boolean { return this.remaining.startsWith(str); }

  capture(str: string): void {
    if (!this.remaining.startsWith(str)) {
      throw new Error(`Expected "${str}".`);
    }
    this.remaining = this.remaining.substring(str.length);
  }

  parseRootSegment(): UrlSegment {
    if (this.remaining === '' || this.remaining === '/') {
      return new UrlSegment([], {});
    } else {
      return new UrlSegment([], this.parseSegmentChildren());
    }
  }

  parseSegmentChildren(): {[key: string]: UrlSegment} {
    if (this.remaining.length == 0) {
      return {};
    }

    if (this.peekStartsWith('/')) {
      this.capture('/');
    }

    const paths = [this.parsePathWithParams()];

    while (this.peekStartsWith('/') && !this.peekStartsWith('//') && !this.peekStartsWith('/(')) {
      this.capture('/');
      paths.push(this.parsePathWithParams());
    }

    let children: {[key: string]: UrlSegment} = {};
    if (this.peekStartsWith('/(')) {
      this.capture('/');
      children = this.parseParens(true);
    }

    let res: {[key: string]: UrlSegment} = {};
    if (this.peekStartsWith('(')) {
      res = this.parseParens(false);
    }

    res[PRIMARY_OUTLET] = new UrlSegment(paths, children);
    return res;
  }

  parsePathWithParams(): UrlPathWithParams {
    let path = matchPathWithParams(this.remaining);
    this.capture(path);
    let matrixParams: {[key: string]: any} = {};
    if (this.peekStartsWith(';')) {
      matrixParams = this.parseMatrixParams();
    }
    return new UrlPathWithParams(path, matrixParams);
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
      return this.remaining.substring(1);
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
    const key = matchPathWithParams(this.remaining);
    if (!key) {
      return;
    }
    this.capture(key);
    let value: any = 'true';
    if (this.peekStartsWith('=')) {
      this.capture('=');
      const valueMatch = matchPathWithParams(this.remaining);
      if (valueMatch) {
        value = valueMatch;
        this.capture(value);
      }
    }

    params[key] = value;
  }

  parseQueryParam(params: {[key: string]: any}): void {
    const key = matchQueryParams(this.remaining);
    if (!key) {
      return;
    }
    this.capture(key);
    let value: any = 'true';
    if (this.peekStartsWith('=')) {
      this.capture('=');
      var valueMatch = matchUrlQueryParamValue(this.remaining);
      if (valueMatch) {
        value = valueMatch;
        this.capture(value);
      }
    }
    params[key] = value;
  }

  parseParens(allowPrimary: boolean): {[key: string]: UrlSegment} {
    const segments: {[key: string]: UrlSegment} = {};
    this.capture('(');

    while (!this.peekStartsWith(')') && this.remaining.length > 0) {
      let path = matchPathWithParams(this.remaining);
      let outletName: string;
      if (path.indexOf(':') > -1) {
        outletName = path.substr(0, path.indexOf(':'));
        this.capture(outletName);
        this.capture(':');
      } else if (allowPrimary) {
        outletName = PRIMARY_OUTLET;
      }

      const children = this.parseSegmentChildren();
      segments[outletName] = Object.keys(children).length === 1 ? children[PRIMARY_OUTLET] :
                                                                  new UrlSegment([], children);

      if (this.peekStartsWith('//')) {
        this.capture('//');
      }
    }
    this.capture(')');

    return segments;
  }
}