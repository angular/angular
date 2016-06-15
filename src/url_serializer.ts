import {PRIMARY_OUTLET} from './shared';
import {UrlPathWithParams, UrlSegment, UrlTree} from './url_tree';
import {forEach} from './utils/collection';



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
  } else if (segment.children[PRIMARY_OUTLET] && !root) {
    const children = [serializeSegment(segment.children[PRIMARY_OUTLET], false)];
    forEach(segment.children, (v: UrlSegment, k: string) => {
      if (k !== PRIMARY_OUTLET) {
        children.push(`${k}:${serializeSegment(v, false)}`);
      }
    });
    return `${serializePaths(segment)}/(${children.join('//')})`;
  } else {
    return serializePaths(segment);
  }
}

function serializeChildren(segment: UrlSegment) {
  if (segment.children[PRIMARY_OUTLET]) {
    const primary = serializePaths(segment.children[PRIMARY_OUTLET]);

    const secondary: string[] = [];
    forEach(segment.children, (v: UrlSegment, k: string) => {
      if (k !== PRIMARY_OUTLET) {
        secondary.push(`${k}:${serializePaths(v)}${serializeChildren(v)}`);
      }
    });
    const secondaryStr = secondary.length > 0 ? `(${secondary.join('//')})` : '';
    const primaryChildren = serializeChildren(segment.children[PRIMARY_OUTLET]);
    const primaryChildrenStr: string = primaryChildren ? `/${primaryChildren}` : '';
    return `${primary}${secondaryStr}${primaryChildrenStr}`;
  } else {
    return '';
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
  var match = SEGMENT_RE.exec(str);
  return match ? match[0] : '';
}

const QUERY_PARAM_VALUE_RE = /^[^\(\)\?;&#]+/;
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
    var params: {[key: string]: any} = {};
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
    var params: {[key: string]: any} = {};
    while (this.remaining.length > 0 && this.peekStartsWith(';')) {
      this.capture(';');
      this.parseParam(params);
    }
    return params;
  }

  parseParam(params: {[key: string]: any}): void {
    var key = matchPathWithParams(this.remaining);
    if (!key) {
      return;
    }
    this.capture(key);
    var value: any = 'true';
    if (this.peekStartsWith('=')) {
      this.capture('=');
      var valueMatch = matchPathWithParams(this.remaining);
      if (valueMatch) {
        value = valueMatch;
        this.capture(value);
      }
    }

    params[key] = value;
  }

  parseQueryParam(params: {[key: string]: any}): void {
    var key = matchPathWithParams(this.remaining);
    if (!key) {
      return;
    }
    this.capture(key);
    var value: any = 'true';
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
