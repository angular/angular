import { Tree, TreeNode } from './utils/tree';
import { shallowEqual } from './utils/collection';
import { PRIMARY_OUTLET } from './shared';

export function createEmptyUrlTree() {
  return new UrlTree(new TreeNode<UrlSegment>(new UrlSegment("", {}, PRIMARY_OUTLET), []), {}, null);
}

/**
 * A URL in the tree form.
 */
export class UrlTree extends Tree<UrlSegment> {
  constructor(root: TreeNode<UrlSegment>, public queryParameters: {[key: string]: string}, public fragment: string | null) {
    super(root);
  }
}

export class UrlSegment {
  constructor(public path: string, public parameters: {[key: string]: string}, public outlet: string) {}

  toString() {
    const params = [];
    for (let prop in this.parameters) {
      if (this.parameters.hasOwnProperty(prop)) {
        params.push(`${prop}=${this.parameters[prop]}`);
      }
    }
    const paramsString = params.length > 0 ? `(${params.join(',')})` : '';
    const outlet = this.outlet === PRIMARY_OUTLET ? '' : `${this.outlet}:`;
    return `${outlet}${this.path}${paramsString}`;
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
