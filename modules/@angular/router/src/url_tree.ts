import {PRIMARY_OUTLET} from './shared';
import {shallowEqual} from './utils/collection';
import {Tree, TreeNode} from './utils/tree';
import {DefaultUrlSerializer, serializeSegment} from './url_serializer';

export function createEmptyUrlTree() {
  return new UrlTree(
      new TreeNode<UrlSegment>(new UrlSegment('', {}, PRIMARY_OUTLET), []), {}, null);
}

/**
 * A URL in the tree form.
 */
export class UrlTree extends Tree<UrlSegment> {
  /**
   * @internal
   */
  constructor(
      root: TreeNode<UrlSegment>, public queryParams: {[key: string]: string},
      public fragment: string|null) {
    super(root);
  }

  toString(): string {
    return new DefaultUrlSerializer().serialize(this);
  }
}

export class UrlSegment {
  /**
   * @internal
   */
  constructor(
      public path: string, public parameters: {[key: string]: string}, public outlet: string) {}

  toString(): string {
    return serializeSegment(this);
  }
}

export function equalUrlSegments(a: UrlSegment[], b: UrlSegment[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; ++i) {
    if (a[i].path !== b[i].path) return false;
    if (!shallowEqual(a[i].parameters, b[i].parameters)) return false;
  }
  return true;
}
