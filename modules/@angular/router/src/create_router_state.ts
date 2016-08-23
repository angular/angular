/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BehaviorSubject} from 'rxjs/BehaviorSubject';

import {ActivatedRoute, ActivatedRouteSnapshot, RouterState, RouterStateSnapshot} from './router_state';
import {TreeNode} from './utils/tree';

export function createRouterState(curr: RouterStateSnapshot, prevState: RouterState): RouterState {
  const root = createNode(curr._root, prevState ? prevState._root : undefined);
  return new RouterState(root, curr);
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
    for (const p of prevState.children) {
      if (equalRouteSnapshots(p.value.snapshot, child.value)) {
        return createNode(child, p);
      }
    }
    return createNode(child);
  });
}

function createActivatedRoute(c: ActivatedRouteSnapshot) {
  return new ActivatedRoute(
      new BehaviorSubject(c.url), new BehaviorSubject(c.params), new BehaviorSubject(c.queryParams),
      new BehaviorSubject(c.fragment), new BehaviorSubject(c.data), c.outlet, c.component, c);
}

function equalRouteSnapshots(a: ActivatedRouteSnapshot, b: ActivatedRouteSnapshot): boolean {
  return a._routeConfig === b._routeConfig;
}