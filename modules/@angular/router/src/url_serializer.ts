import {PRIMARY_OUTLET} from './shared';
import {UrlSegment, UrlTree} from './url_tree';
import {TreeNode} from './utils/tree';


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
    const node = serializeUrlTreeNode(tree._root);
    const query = serializeQueryParams(tree.queryParams);
    const fragment = tree.fragment !== null ? `#${tree.fragment}` : '';
    return `${node}${query}${fragment}`;
  }
}

function serializeUrlTreeNode(node: TreeNode<UrlSegment>): string {
  return `${serializeSegment(node.value)}${serializeChildren(node)}`;
}

function serializeUrlTreeNodes(nodes: TreeNode<UrlSegment>[]): string {
  const primary = serializeSegment(nodes[0].value);
  const secondaryNodes = nodes.slice(1);
  const secondary =
      secondaryNodes.length > 0 ? `(${secondaryNodes.map(serializeUrlTreeNode).join("//")})` : '';
  const children = serializeChildren(nodes[0]);
  return `${primary}${secondary}${children}`;
}

function serializeChildren(node: TreeNode<UrlSegment>): string {
  if (node.children.length > 0) {
    return `/${serializeUrlTreeNodes(node.children)}`;
  } else {
    return '';
  }
}

export function serializeSegment(segment: UrlSegment): string {
  const outlet = segment.outlet === PRIMARY_OUTLET ? '' : `${segment.outlet}:`;
  return `${outlet}${segment.path}${serializeParams(segment.parameters)}`;
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
  const res = [];
  for (let prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      res.push(new Pair<string, T>(prop, obj[prop]));
    }
  }
  return res;
}

const SEGMENT_RE = /^[^\/\(\)\?;=&#]+/;
function matchUrlSegment(str: string): string {
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

  parseRootSegment(): TreeNode<UrlSegment> {
    if (this.remaining == '' || this.remaining == '/') {
      return new TreeNode<UrlSegment>(new UrlSegment('', {}, PRIMARY_OUTLET), []);
    } else {
      const segments = this.parseSegments(false);
      return new TreeNode<UrlSegment>(new UrlSegment('', {}, PRIMARY_OUTLET), segments);
    }
  }

  parseSegments(hasOutletName: boolean): TreeNode<UrlSegment>[] {
    if (this.remaining.length == 0) {
      return [];
    }
    if (this.peekStartsWith('/')) {
      this.capture('/');
    }
    let path = matchUrlSegment(this.remaining);
    this.capture(path);

    let outletName;
    if (hasOutletName) {
      if (path.indexOf(':') === -1) {
        throw new Error('Not outlet name is provided');
      }
      if (path.indexOf(':') > -1 && hasOutletName) {
        let parts = path.split(':');
        outletName = parts[0];
        path = parts[1];
      }
    } else {
      if (path.indexOf(':') > -1) {
        throw new Error('Not outlet name is allowed');
      }
      outletName = PRIMARY_OUTLET;
    }

    let matrixParams: {[key: string]: any} = {};
    if (this.peekStartsWith(';')) {
      matrixParams = this.parseMatrixParams();
    }

    let secondary = [];
    if (this.peekStartsWith('(')) {
      secondary = this.parseSecondarySegments();
    }

    let children: TreeNode<UrlSegment>[] = [];
    if (this.peekStartsWith('/') && !this.peekStartsWith('//')) {
      this.capture('/');
      children = this.parseSegments(false);
    }

    const segment = new UrlSegment(path, matrixParams, outletName);
    const node = new TreeNode<UrlSegment>(segment, children);
    return [node].concat(secondary);
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

  parseFragment(): string|null {
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
    var key = matchUrlSegment(this.remaining);
    if (!key) {
      return;
    }
    this.capture(key);
    var value: any = 'true';
    if (this.peekStartsWith('=')) {
      this.capture('=');
      var valueMatch = matchUrlSegment(this.remaining);
      if (valueMatch) {
        value = valueMatch;
        this.capture(value);
      }
    }

    params[key] = value;
  }

  parseQueryParam(params: {[key: string]: any}): void {
    var key = matchUrlSegment(this.remaining);
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

  parseSecondarySegments(): TreeNode<UrlSegment>[] {
    var segments = [];
    this.capture('(');

    while (!this.peekStartsWith(')') && this.remaining.length > 0) {
      segments = segments.concat(this.parseSegments(true));
      if (this.peekStartsWith('//')) {
        this.capture('//');
      }
    }
    this.capture(')');

    return segments;
  }
}
