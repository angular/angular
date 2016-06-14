import {BehaviorSubject} from 'rxjs/BehaviorSubject';

import {ActivatedRoute, ActivatedRouteSnapshot, RouterState, RouterStateSnapshot} from './router_state';
import {TreeNode} from './utils/tree';

export function createRouterState(curr: RouterStateSnapshot, prevState: RouterState): RouterState {
  const root = createNode(curr._root, prevState ? prevState._root : undefined);
  const queryParams = prevState ? prevState.queryParams : new BehaviorSubject(curr.queryParams);
  const fragment = prevState ? prevState.fragment : new BehaviorSubject(curr.fragment);
  return new RouterState(root, queryParams, fragment, curr);
}

function createNode(curr: TreeNode<ActivatedRouteSnapshot>, prevState?: TreeNode<ActivatedRoute>):
    TreeNode<ActivatedRoute> {
  if (prevState && equalRouteSnapshots(prevState.value.snapshot, curr.value)) {
    const value = prevState.value;
    value._futureSnapshot = curr.value;

    const children = createOrReuseChildren(curr, prevState);
    return new TreeNode<ActivatedRoute>(value, children);

  } else {
    const value = createActivatedRoute(curr.value);
    const children = curr.children.map(c => createNode(c));
    return new TreeNode<ActivatedRoute>(value, children);
  }
}

function createOrReuseChildren(
    curr: TreeNode<ActivatedRouteSnapshot>, prevState: TreeNode<ActivatedRoute>) {
  return curr.children.map(child => {
    const index =
        prevState.children.findIndex(p => equalRouteSnapshots(p.value.snapshot, child.value));
    if (index >= 0) {
      return createNode(child, prevState.children[index]);
    } else {
      return createNode(child);
    }
  });
}

function createActivatedRoute(c: ActivatedRouteSnapshot) {
  return new ActivatedRoute(
      new BehaviorSubject(c.url), new BehaviorSubject(c.params), c.outlet, c.component, c);
}

function equalRouteSnapshots(a: ActivatedRouteSnapshot, b: ActivatedRouteSnapshot): boolean {
  return a._routeConfig === b._routeConfig;
}