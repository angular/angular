import {ComponentFactory} from 'angular2/core';
import {StringMapWrapper, ListWrapper} from 'angular2/src/facade/collection';
import {Type, isBlank, isPresent, stringify} from 'angular2/src/facade/lang';

export class Tree<T> {
  /** @internal */
  _root: TreeNode<T>;

  constructor(root: TreeNode<T>) { this._root = root; }

  get root(): T { return this._root.value; }

  parent(t: T): T {
    let p = this.pathFromRoot(t);
    return p.length > 1 ? p[p.length - 2] : null;
  }

  children(t: T): T[] {
    let n = _findNode(t, this._root);
    return isPresent(n) ? n.children.map(t => t.value) : null;
  }

  firstChild(t: T): T {
    let n = _findNode(t, this._root);
    return isPresent(n) && n.children.length > 0 ? n.children[0].value : null;
  }

  pathFromRoot(t: T): T[] { return _findPath(t, this._root, []).map(s => s.value); }
}

export function rootNode<T>(tree: Tree<T>): TreeNode<T> {
  return tree._root;
}

function _findNode<T>(expected: T, c: TreeNode<T>): TreeNode<T> {
  // TODO: vsavkin remove it once recognize is fixed
  if (expected instanceof RouteSegment && equalSegments(<any>expected, <any>c.value)) return c;
  if (expected === c.value) return c;
  for (let cc of c.children) {
    let r = _findNode(expected, cc);
    if (isPresent(r)) return r;
  }
  return null;
}

function _findPath<T>(expected: T, c: TreeNode<T>, collected: TreeNode<T>[]): TreeNode<T>[] {
  collected.push(c);

  // TODO: vsavkin remove it once recognize is fixed
  if (expected instanceof RouteSegment && equalSegments(<any>expected, <any>c.value))
    return collected;
  if (expected === c.value) return collected;
  for (let cc of c.children) {
    let r = _findPath(expected, cc, ListWrapper.clone(collected));
    if (isPresent(r)) return r;
  }

  return null;
}

export class TreeNode<T> {
  constructor(public value: T, public children: TreeNode<T>[]) {}
}

export class UrlSegment {
  constructor(public segment: any, public parameters: {[key: string]: string},
              public outlet: string) {}

  toString(): string {
    let outletPrefix = isBlank(this.outlet) ? "" : `${this.outlet}:`;
    let segmentPrefix = isBlank(this.segment) ? "" : this.segment;
    return `${outletPrefix}${segmentPrefix}${_serializeParams(this.parameters)}`;
  }
}

function _serializeParams(params: {[key: string]: string}): string {
  let res = "";
  if (isPresent(params)) {
    StringMapWrapper.forEach(params, (v, k) => res += `;${k}=${v}`);
  }
  return res;
}

export class RouteSegment {
  /** @internal */
  _type: Type;

  /** @internal */
  _componentFactory: ComponentFactory<any>;

  constructor(public urlSegments: UrlSegment[], public parameters: {[key: string]: string},
              public outlet: string, type: Type, componentFactory: ComponentFactory<any>) {
    this._type = type;
    this._componentFactory = componentFactory;
  }

  getParam(param: string): string {
    return isPresent(this.parameters) ? this.parameters[param] : null;
  }

  get type(): Type { return this._type; }

  get stringifiedUrlSegments(): string { return this.urlSegments.map(s => s.toString()).join("/"); }
}

export function serializeRouteSegmentTree(tree: Tree<RouteSegment>): string {
  return _serializeRouteSegmentTree(tree._root);
}

function _serializeRouteSegmentTree(node: TreeNode<RouteSegment>): string {
  let v = node.value;
  let children = node.children.map(c => _serializeRouteSegmentTree(c)).join(", ");
  return `${v.outlet}:${v.stringifiedUrlSegments}(${stringify(v.type)}) [${children}]`;
}

export function equalSegments(a: RouteSegment, b: RouteSegment): boolean {
  if (isBlank(a) && !isBlank(b)) return false;
  if (!isBlank(a) && isBlank(b)) return false;
  if (a._type !== b._type) return false;
  if (isBlank(a.parameters) && !isBlank(b.parameters)) return false;
  if (!isBlank(a.parameters) && isBlank(b.parameters)) return false;
  if (isBlank(a.parameters) && isBlank(b.parameters)) return true;
  return StringMapWrapper.equals(a.parameters, b.parameters);
}

export function routeSegmentComponentFactory(a: RouteSegment): ComponentFactory<any> {
  return a._componentFactory;
}