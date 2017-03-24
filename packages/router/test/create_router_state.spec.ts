/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Routes} from '../src/config';
import {createRouterState} from '../src/create_router_state';
import {recognize} from '../src/recognize';
import {DefaultRouteReuseStrategy} from '../src/router';
import {ActivatedRoute, RouterState, RouterStateSnapshot, advanceActivatedRoute, createEmptyState} from '../src/router_state';
import {PRIMARY_OUTLET} from '../src/shared';
import {DefaultUrlSerializer, UrlSegmentGroup, UrlTree} from '../src/url_tree';
import {TreeNode} from '../src/utils/tree';

describe('create router state', () => {
  const reuseStrategy = new DefaultRouteReuseStrategy();

  const emptyState = () =>
      createEmptyState(new UrlTree(new UrlSegmentGroup([], {}), {}, null !), RootComponent);

  it('should work create new state', () => {
    const state = createRouterState(
        reuseStrategy, createState(
                           [
                             {path: 'a', component: ComponentA},
                             {path: 'b', component: ComponentB, outlet: 'left'},
                             {path: 'c', component: ComponentC, outlet: 'right'}
                           ],
                           'a(left:b//right:c)'),
        emptyState());

    checkActivatedRoute(state.root, RootComponent);

    const c = state.children(state.root);
    checkActivatedRoute(c[0], ComponentA);
    checkActivatedRoute(c[1], ComponentB, 'left');
    checkActivatedRoute(c[2], ComponentC, 'right');
  });

  it('should reuse existing nodes when it can', () => {
    const config = [
      {path: 'a', component: ComponentA}, {path: 'b', component: ComponentB, outlet: 'left'},
      {path: 'c', component: ComponentC, outlet: 'left'}
    ];

    const prevState =
        createRouterState(reuseStrategy, createState(config, 'a(left:b)'), emptyState());
    advanceState(prevState);
    const state = createRouterState(reuseStrategy, createState(config, 'a(left:c)'), prevState);

    expect(prevState.root).toBe(state.root);
    const prevC = prevState.children(prevState.root);
    const currC = state.children(state.root);

    expect(prevC[0]).toBe(currC[0]);
    expect(prevC[1]).not.toBe(currC[1]);
    checkActivatedRoute(currC[1], ComponentC, 'left');
  });

  it('should handle componentless routes', () => {
    const config = [{
      path: 'a/:id',
      children: [
        {path: 'b', component: ComponentA}, {path: 'c', component: ComponentB, outlet: 'right'}
      ]
    }];


    const prevState = createRouterState(
        reuseStrategy, createState(config, 'a/1;p=11/(b//right:c)'), emptyState());
    advanceState(prevState);
    const state =
        createRouterState(reuseStrategy, createState(config, 'a/2;p=22/(b//right:c)'), prevState);

    expect(prevState.root).toBe(state.root);
    const prevP = prevState.firstChild(prevState.root) !;
    const currP = state.firstChild(state.root) !;
    expect(prevP).toBe(currP);

    const prevC = prevState.children(prevP);
    const currC = state.children(currP);

    expect(currP._futureSnapshot.params).toEqual({id: '2', p: '22'});
    expect(currP._futureSnapshot.paramMap.get('id')).toEqual('2');
    expect(currP._futureSnapshot.paramMap.get('p')).toEqual('22');
    checkActivatedRoute(currC[0], ComponentA);
    checkActivatedRoute(currC[1], ComponentB, 'right');
  });
});

function advanceState(state: RouterState): void {
  advanceNode(state._root);
}

function advanceNode(node: TreeNode<ActivatedRoute>): void {
  advanceActivatedRoute(node.value);
  node.children.forEach(advanceNode);
}

function createState(config: Routes, url: string): RouterStateSnapshot {
  let res: RouterStateSnapshot = undefined !;
  recognize(RootComponent, config, tree(url), url).forEach(s => res = s);
  return res;
}

function checkActivatedRoute(
    actual: ActivatedRoute, cmp: Function, outlet: string = PRIMARY_OUTLET): void {
  if (actual === null) {
    expect(actual).toBeDefined();
  } else {
    expect(actual.component).toBe(cmp);
    expect(actual.outlet).toEqual(outlet);
  }
}

function tree(url: string): UrlTree {
  return new DefaultUrlSerializer().parse(url);
}

class RootComponent {}
class ComponentA {}
class ComponentB {}
class ComponentC {}
