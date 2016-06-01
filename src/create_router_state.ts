import { RouterStateCandidate, ActivatedRouteCandidate, RouterState, ActivatedRoute } from './router_state';
import { TreeNode } from './utils/tree';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export function createRouterState(curr: RouterStateCandidate, prevState: RouterState): RouterState {
  const root = createNode(curr._root, prevState ? prevState._root : null);
  const queryParams = prevState ? prevState.queryParams : new BehaviorSubject(curr.queryParams);
  const fragment = prevState ? prevState.fragment : new BehaviorSubject(curr.fragment);
  return new RouterState(root, queryParams, fragment, curr);
}

function createNode(curr:TreeNode<ActivatedRouteCandidate>, prevState?:TreeNode<ActivatedRoute>):TreeNode<ActivatedRoute> {
  if (prevState && equalRouteCandidates(prevState.value.candidate, curr.value)) {
    const value = prevState.value;
    value.candidate = curr.value;
    
    const children = createOrReuseChildren(curr, prevState);
    return new TreeNode<ActivatedRoute>(value, children);

  } else {
    const value = createActivatedRoute(curr.value);
    const children = curr.children.map(c => createNode(c));
    return new TreeNode<ActivatedRoute>(value, children);
  }
}

function createOrReuseChildren(curr:TreeNode<ActivatedRouteCandidate>, prevState:TreeNode<ActivatedRoute>) {
  return curr.children.map(child => {
    const index = prevState.children.findIndex(p => equalRouteCandidates(p.value.candidate, child.value));
    if (index >= 0) {
      return createNode(child, prevState.children[index]);
    } else {
      return createNode(child);
    }
  });
}

function createActivatedRoute(c:ActivatedRouteCandidate) {
  return new ActivatedRoute(new BehaviorSubject(c.urlSegments), new BehaviorSubject(c.params), c.outlet, c.component, c);
}

function equalRouteCandidates(a: ActivatedRouteCandidate, b: ActivatedRouteCandidate): boolean {
  return a._routeConfig === b._routeConfig;
}