import {PRIMARY_OUTLET} from './shared';
import {DefaultUrlSerializer, serializePath, serializePaths} from './url_serializer';
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
