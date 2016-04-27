import {Tree, TreeNode, UrlSegment, RouteSegment, rootNode} from './segments';
import {isBlank, isString, isStringMap} from 'angular2/src/facade/lang';
import {ListWrapper} from 'angular2/src/facade/collection';

export function link(segment: RouteSegment, tree: Tree<UrlSegment>,
                     change: any[]): Tree<UrlSegment> {
  if (change.length === 0) return tree;
  let normalizedChange = (change.length === 1 && change[0] == "/") ? change : ["/"].concat(change);
  return new Tree<UrlSegment>(_update(rootNode(tree), normalizedChange));
}

function _update(node: TreeNode<UrlSegment>, changes: any[]): TreeNode<UrlSegment> {
  let rest = changes.slice(1);
  let outlet = _outlet(changes);
  let segment = _segment(changes);
  if (isString(segment) && segment[0] == "/") segment = segment.substring(1);

  // reach the end of the tree => create new tree nodes.
  if (isBlank(node)) {
    let urlSegment = new UrlSegment(segment, null, outlet);
    let children = rest.length === 0 ? [] : [_update(null, rest)];
    return new TreeNode<UrlSegment>(urlSegment, children);

    // different outlet => preserve the subtree
  } else if (outlet != node.value.outlet) {
    return node;

    // same outlet => modify the subtree
  } else {
    let urlSegment = isStringMap(segment) ? new UrlSegment(null, segment, null) :
                                            new UrlSegment(segment, null, outlet);
    if (rest.length === 0) {
      return new TreeNode<UrlSegment>(urlSegment, []);
    }

    return new TreeNode<UrlSegment>(urlSegment,
                                    _updateMany(ListWrapper.clone(node.children), rest));
  }
}

function _updateMany(nodes: TreeNode<UrlSegment>[], changes: any[]): TreeNode<UrlSegment>[] {
  let outlet = _outlet(changes);
  let nodesInRightOutlet = nodes.filter(c => c.value.outlet == outlet);
  if (nodesInRightOutlet.length > 0) {
    let nodeRightOutlet = nodesInRightOutlet[0];  // there can be only one
    nodes[nodes.indexOf(nodeRightOutlet)] = _update(nodeRightOutlet, changes);
  } else {
    nodes.push(_update(null, changes));
  }

  return nodes;
}

function _segment(changes: any[]): any {
  if (!isString(changes[0])) return changes[0];
  let parts = changes[0].toString().split(":");
  return parts.length > 1 ? parts[1] : changes[0];
}

function _outlet(changes: any[]): string {
  if (!isString(changes[0])) return null;
  let parts = changes[0].toString().split(":");
  return parts.length > 1 ? parts[0] : null;
}
