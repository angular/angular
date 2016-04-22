import {ComponentFactory} from 'angular2/core';
import {StringMapWrapper, ListWrapper} from 'angular2/src/facade/collection';
import {Type, isBlank} from 'angular2/src/facade/lang';

export class Tree<T> {
  constructor(private _nodes: T[]) {}

  get root(): T { return this._nodes[0]; }

  parent(t: T): T {
    let index = this._nodes.indexOf(t);
    return index > 0 ? this._nodes[index - 1] : null;
  }

  children(t: T): T[] {
    let index = this._nodes.indexOf(t);
    return index > -1 && index < this._nodes.length - 1 ? [this._nodes[index + 1]] : [];
  }

  firstChild(t: T): T {
    let index = this._nodes.indexOf(t);
    return index > -1 && index < this._nodes.length - 1 ? this._nodes[index + 1] : null;
  }

  pathToRoot(t: T): T[] {
    let index = this._nodes.indexOf(t);
    return index > -1 ? this._nodes.slice(0, index + 1) : null;
  }
}

export class UrlSegment {
  constructor(public segment: string, public parameters: {[key: string]: string},
              public outlet: string) {}
}

export class RouteSegment {
  /** @internal */
  _type: Type;

  /** @internal */
  _componentFactory: ComponentFactory;

  /** @internal */
  _parameters: {[key: string]: string};

  constructor(public urlSegments: UrlSegment[], parameters: {[key: string]: string},
              public outlet: string, type: Type, componentFactory: ComponentFactory) {
    this._type = type;
    this._componentFactory = componentFactory;
    this._parameters = parameters;
  }

  getParam(param: string): string { return this._parameters[param]; }

  get type(): Type { return this._type; }
}

export function equalSegments(a: RouteSegment, b: RouteSegment): boolean {
  if (isBlank(a) && !isBlank(b)) return false;
  if (!isBlank(a) && isBlank(b)) return false;
  return a._type === b._type && StringMapWrapper.equals(a._parameters, b._parameters);
}

export function routeSegmentComponentFactory(a: RouteSegment): ComponentFactory {
  return a._componentFactory;
}