/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {EnvironmentInjector} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {map} from 'rxjs/operators';

import {createRouterState} from '../src/create_router_state';
import {Routes} from '../src/models';
import {recognize} from '../src/recognize';
import {DefaultRouteReuseStrategy} from '../src/route_reuse_strategy';
import {RouterConfigLoader} from '../src/router_config_loader';
import {
  ActivatedRoute,
  advanceActivatedRoute,
  createEmptyState,
  RouterState,
  RouterStateSnapshot,
} from '../src/router_state';
import {PRIMARY_OUTLET} from '../src/shared';
import {DefaultUrlSerializer, UrlTree} from '../src/url_tree';
import {TreeNode} from '../src/utils/tree';

describe('create router state', () => {
  let reuseStrategy: DefaultRouteReuseStrategy;
  beforeEach(() => {
    reuseStrategy = new DefaultRouteReuseStrategy();
  });

  const emptyState = () => createEmptyState(RootComponent);

  it('should create new state', async () => {
    const state = createRouterState(
      reuseStrategy,
      await createState(
        [
          {path: 'a', component: ComponentA},
          {path: 'b', component: ComponentB, outlet: 'left'},
          {path: 'c', component: ComponentC, outlet: 'right'},
        ],
        'a(left:b//right:c)',
      ),
      emptyState(),
    );

    checkActivatedRoute(state.root, RootComponent);

    const c = (state as any).children(state.root);
    checkActivatedRoute(c[0], ComponentA);
    checkActivatedRoute(c[1], ComponentB, 'left');
    checkActivatedRoute(c[2], ComponentC, 'right');
  });

  it('should reuse existing nodes when it can', async () => {
    const config = [
      {path: 'a', component: ComponentA},
      {path: 'b', component: ComponentB, outlet: 'left'},
      {path: 'c', component: ComponentC, outlet: 'left'},
    ];

    const prevState = createRouterState(
      reuseStrategy,
      await createState(config, 'a(left:b)'),
      emptyState(),
    );
    advanceState(prevState);
    const state = createRouterState(
      reuseStrategy,
      await createState(config, 'a(left:c)'),
      prevState,
    );

    expect(prevState.root).toBe(state.root);
    const prevC = (prevState as any).children(prevState.root);
    const currC = (state as any).children(state.root);

    expect(prevC[0]).toBe(currC[0]);
    expect(prevC[1]).not.toBe(currC[1]);
    checkActivatedRoute(currC[1], ComponentC, 'left');
  });

  it('should handle componentless routes', async () => {
    const config = [
      {
        path: 'a/:id',
        children: [
          {path: 'b', component: ComponentA},
          {path: 'c', component: ComponentB, outlet: 'right'},
        ],
      },
    ];

    const prevState = createRouterState(
      reuseStrategy,
      await createState(config, 'a/1;p=11/(b//right:c)'),
      emptyState(),
    );
    advanceState(prevState);
    const state = createRouterState(
      reuseStrategy,
      await createState(config, 'a/2;p=22/(b//right:c)'),
      prevState,
    );

    expect(prevState.root).toBe(state.root);
    const prevP = (prevState as any).firstChild(prevState.root)!;
    const currP = (state as any).firstChild(state.root)!;
    expect(prevP).toBe(currP);

    const currC = (state as any).children(currP);

    expect(currP._futureSnapshot.params).toEqual({id: '2', p: '22'});
    expect(currP._futureSnapshot.paramMap.get('id')).toEqual('2');
    expect(currP._futureSnapshot.paramMap.get('p')).toEqual('22');
    checkActivatedRoute(currC[0], ComponentA);
    checkActivatedRoute(currC[1], ComponentB, 'right');
  });

  it('should not retrieve routes when `shouldAttach` is always false', async () => {
    const config: Routes = [
      {path: 'a', component: ComponentA},
      {path: 'b', component: ComponentB, outlet: 'left'},
      {path: 'c', component: ComponentC, outlet: 'left'},
    ];
    spyOn(reuseStrategy, 'retrieve');

    const prevState = createRouterState(
      reuseStrategy,
      await createState(config, 'a(left:b)'),
      emptyState(),
    );
    advanceState(prevState);
    createRouterState(reuseStrategy, await createState(config, 'a(left:c)'), prevState);
    expect(reuseStrategy.retrieve).not.toHaveBeenCalled();
  });

  it('should consistently represent future and current state', async () => {
    const config: Routes = [
      {path: '', pathMatch: 'full', component: ComponentA},
      {path: 'product/:id', component: ComponentB},
    ];
    spyOn(reuseStrategy, 'shouldReuseRoute').and.callThrough();
    const previousState = createRouterState(
      reuseStrategy,
      await createState(config, ''),
      emptyState(),
    );
    advanceState(previousState);
    (reuseStrategy.shouldReuseRoute as jasmine.Spy).calls.reset();

    createRouterState(reuseStrategy, await createState(config, 'product/30'), previousState);

    // One call for the root and one call for each of the children
    expect(reuseStrategy.shouldReuseRoute).toHaveBeenCalledTimes(2);
    const reuseCalls = (reuseStrategy.shouldReuseRoute as jasmine.Spy).calls;
    const future1 = reuseCalls.argsFor(0)[0];
    const current1 = reuseCalls.argsFor(0)[1];
    const future2 = reuseCalls.argsFor(1)[0];
    const current2 = reuseCalls.argsFor(1)[1];

    // Routing from '' to 'product/30'
    expect(current1._routerState.url).toEqual(tree('').toString());
    expect(future1._routerState.url).toEqual(tree('product/30').toString());
    expect(current2._routerState.url).toEqual(tree('').toString());
    expect(future2._routerState.url).toEqual(tree('product/30').toString());
  });
});

function advanceState(state: RouterState): void {
  advanceNode((state as any)._root);
}

function advanceNode(node: TreeNode<ActivatedRoute>): void {
  advanceActivatedRoute(node.value);
  node.children.forEach(advanceNode);
}

async function createState(config: Routes, url: string): Promise<RouterStateSnapshot> {
  return recognize(
    TestBed.inject(EnvironmentInjector),
    TestBed.inject(RouterConfigLoader),
    RootComponent,
    config,
    tree(url),
    new DefaultUrlSerializer(),
  )
    .pipe(map((result) => result.state))
    .toPromise() as Promise<RouterStateSnapshot>;
}

function checkActivatedRoute(
  actual: ActivatedRoute,
  cmp: Function,
  outlet: string = PRIMARY_OUTLET,
): void {
  if (actual === null) {
    expect(actual).toBeDefined();
  } else {
    expect(actual.component as any).toBe(cmp);
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
