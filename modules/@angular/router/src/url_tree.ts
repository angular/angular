import {PRIMARY_OUTLET} from './shared';
import {DefaultUrlSerializer, serializePath, serializePaths} from './url_serializer';
import {forEach, shallowEqual} from './utils/collection';

export function createEmptyUrlTree() {
  return new UrlTree(new UrlSegment([], {}), {}, null);
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
    forEach(children, (v, k) => v.parent = this);
  }

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

export function mapChildren(segment: UrlSegment, fn: (v: UrlSegment, k: string) => UrlSegment):
    {[name: string]: UrlSegment} {
  const newChildren: {[name: string]: UrlSegment} = {};
  forEach(segment.children, (child, childOutlet) => {
    if (childOutlet === PRIMARY_OUTLET) {
      newChildren[childOutlet] = fn(child, childOutlet);
    }
  });
  forEach(segment.children, (child, childOutlet) => {
    if (childOutlet !== PRIMARY_OUTLET) {
      newChildren[childOutlet] = fn(child, childOutlet);
    }
  });
  return newChildren;
}

export function mapChildrenIntoArray<T>(
    segment: UrlSegment, fn: (v: UrlSegment, k: string) => T[]): T[] {
  let res = [];
  forEach(segment.children, (child, childOutlet) => {
    if (childOutlet === PRIMARY_OUTLET) {
      res = res.concat(fn(child, childOutlet));
    }
  });
  forEach(segment.children, (child, childOutlet) => {
    if (childOutlet !== PRIMARY_OUTLET) {
      res = res.concat(fn(child, childOutlet));
    }
  });
  return res;
}
