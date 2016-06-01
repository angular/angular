import { RouterStateCandidate, ActivatedRouteCandidate, RouterState, ActivatedRoute } from './router_state';
import { TreeNode } from './utils/tree';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export function createRouterState(curr: RouterStateCandidate, prev: RouterStateCandidate, prevState: RouterState): RouterState {
  const root = createNode(curr._root, prev ? prev._root : null, prevState ? prevState._root : null);
  const queryParams = prevState ? prevState.queryParams : new BehaviorSubject(curr.queryParams);
  const fragment = prevState ? prevState.fragment : new BehaviorSubject(curr.fragment);
  return new RouterState(root, queryParams, fragment);
}

function createNode(curr:TreeNode<ActivatedRouteCandidate>, prev?:TreeNode<ActivatedRouteCandidate>, prevState?:TreeNode<ActivatedRoute>):TreeNode<ActivatedRoute> {
  if (prev && equalRouteCandidates(prev.value, curr.value)) {
    const value = prevState.value;
    const children = createOrReuseChildren(curr, prev, prevState);
    return new TreeNode<ActivatedRoute>(value, children);

  } else {
    const value = createActivatedRoute(curr.value);
    const children = curr.children.map(c => createNode(c));
    return new TreeNode<ActivatedRoute>(value, children);
  }
}

function createOrReuseChildren(curr:TreeNode<ActivatedRouteCandidate>, prev:TreeNode<ActivatedRouteCandidate>, prevState:TreeNode<ActivatedRoute>) {
  return curr.children.map(child => {
    const index = prev.children.findIndex(p => equalRouteCandidates(p.value, child.value));
    if (index >= 0) {
      return createNode(child, prev.children[index], prevState.children[index]);
    } else {
      return createNode(child);
    }
  });
}

function createActivatedRoute(c:ActivatedRouteCandidate) {
  return new ActivatedRoute(new BehaviorSubject(c.urlSegments), new BehaviorSubject(c.params), c.outlet, c.component);
}

function equalRouteCandidates(a: ActivatedRouteCandidate, b: ActivatedRouteCandidate): boolean {
  return a._routeConfig === b._routeConfig;
}