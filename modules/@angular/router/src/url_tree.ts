import { Tree, TreeNode } from './tree';
import { shallowEqual } from './util';

/**
 * A URL in the tree form.
 */
export class UrlTree extends Tree<UrlSegment> {
  constructor(root: TreeNode<UrlSegment>, public queryParameters: {[key: string]: string}, public fragment: string | null) {
    super(root);
  }
}

export class UrlSegment {
  constructor(public path: string, public parameters: {[key: string]: string}) {}

  toString() {
    let params = [];
    for (let prop in this.parameters) {
      if (this.parameters.hasOwnProperty(prop)) {
        params.push(`${prop}=${this.parameters[prop]}`);
      }
    }
    const paramsString = params.length > 0 ? `(${params.join(',')})` : '';
    return `${this.path}${paramsString}`;
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
