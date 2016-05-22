import { Tree, TreeNode } from './tree';

export class UrlTree extends Tree<UrlSegment> {
  constructor(root: TreeNode<UrlSegment>, public queryParameters: {[key: string]: string}, public fragment: string | null) {
    super(root);
  }
}

export class UrlSegment {
  constructor(public segment: any, public parameters: {[key: string]: string}) {}
}