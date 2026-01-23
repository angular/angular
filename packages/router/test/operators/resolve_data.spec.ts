/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {ActivatedRouteSnapshot, provideRouter, Router} from '../../index';
import {RouterTestingHarness} from '../../testing';
import {EMPTY, interval, NEVER, of} from 'rxjs';
import {useAutoTick} from '../helpers';

describe('resolveData operator', () => {
  useAutoTick();
  it('should take only the first emitted value of every resolver', async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{path: '**', children: [], resolve: {e1: () => interval()}}])],
    });
    await RouterTestingHarness.create('/');
    expect(TestBed.inject(Router).routerState.root.firstChild?.snapshot.data).toEqual({e1: 0});
  });

  it('should cancel navigation if a resolver does not complete', async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{path: '**', children: [], resolve: {e1: () => EMPTY}}])],
    });
    await RouterTestingHarness.create('/a');
    expect(TestBed.inject(Router).url).toEqual('/');
  });

  it('should cancel navigation if 1 of 2 resolvers does not emit', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{path: '**', children: [], resolve: {e0: () => of(0), e1: () => EMPTY}}]),
      ],
    });
    await RouterTestingHarness.create('/a');
    expect(TestBed.inject(Router).url).toEqual('/');
  });

  it("should complete instantly if at least one resolver doesn't emit", async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{path: '**', children: [], resolve: {e0: () => EMPTY, e1: () => NEVER}}]),
      ],
    });
    await RouterTestingHarness.create('/a');
    expect(TestBed.inject(Router).url).toEqual('/');
  });

  it('should run resolvers in different parts of the tree', async () => {
    let value = 0;
    let bValue = 0;
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'a',
            runGuardsAndResolvers: () => false,
            children: [
              {
                path: '',
                resolve: {d0: () => ++value},
                runGuardsAndResolvers: 'always',
                children: [],
              },
            ],
          },
          {
            path: 'b',
            outlet: 'aux',
            runGuardsAndResolvers: () => false,
            children: [
              {
                path: '',
                resolve: {d1: () => ++bValue},
                runGuardsAndResolvers: 'always',
                children: [],
              },
            ],
          },
        ]),
      ],
    });
    const router = TestBed.inject(Router);
    const harness = await RouterTestingHarness.create('/a(aux:b)');
    expect(router.routerState.root.children[0]?.firstChild?.snapshot.data).toEqual({d0: 1});
    expect(router.routerState.root.children[1]?.firstChild?.snapshot.data).toEqual({d1: 1});

    await harness.navigateByUrl('/a(aux:b)#new');
    expect(router.routerState.root.children[0]?.firstChild?.snapshot.data).toEqual({d0: 2});
    expect(router.routerState.root.children[1]?.firstChild?.snapshot.data).toEqual({d1: 2});
  });

  it('should update children inherited data when resolvers run', async () => {
    let value = 0;
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'a',
            children: [{path: 'b', children: []}],
            resolve: {d0: () => ++value},
            runGuardsAndResolvers: 'always',
          },
        ]),
      ],
    });
    const harness = await RouterTestingHarness.create('/a/b');
    expect(TestBed.inject(Router).routerState.root.firstChild?.snapshot.data).toEqual({d0: 1});
    expect(TestBed.inject(Router).routerState.root.firstChild?.firstChild?.snapshot.data).toEqual({
      d0: 1,
    });

    await harness.navigateByUrl('/a/b#new');
    expect(TestBed.inject(Router).routerState.root.firstChild?.snapshot.data).toEqual({d0: 2});
    expect(TestBed.inject(Router).routerState.root.firstChild?.firstChild?.snapshot.data).toEqual({
      d0: 2,
    });
  });

  it('should have correct data when parent resolver runs but data is not inherited', async () => {
    @Component({
      template: '',
      standalone: false,
    })
    class Empty {}

    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'a',
            component: Empty,
            data: {parent: 'parent'},
            resolve: {other: () => 'other'},
            children: [
              {
                path: 'b',
                data: {child: 'child'},
                component: Empty,
              },
            ],
          },
        ]),
      ],
    });
    await RouterTestingHarness.create('/a/b');
    const rootSnapshot = TestBed.inject(Router).routerState.root.firstChild!.snapshot;
    expect(rootSnapshot.data).toEqual({parent: 'parent', other: 'other'});
    expect(rootSnapshot.firstChild!.data).toEqual({child: 'child'});
  });

  it('should have static title when there is a resolver', async () => {
    @Component({
      template: '',
      standalone: false,
    })
    class Empty {}

    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'a',
            title: 'a title',
            component: Empty,
            resolve: {other: () => 'other'},
            children: [
              {
                path: 'b',
                title: 'b title',
                component: Empty,
                resolve: {otherb: () => 'other b'},
              },
            ],
          },
        ]),
      ],
    });
    await RouterTestingHarness.create('/a/b');
    const rootSnapshot = TestBed.inject(Router).routerState.root.firstChild!.snapshot;
    expect(rootSnapshot.title).toBe('a title');
    expect(rootSnapshot.firstChild!.title).toBe('b title');
  });

  it('can used parent data in child resolver', async () => {
    @Component({
      template: '',
    })
    class Empty {}

    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'a',
            resolve: {
              aResolve: () => new Promise<string>((resolve) => setTimeout(() => resolve('a'), 5)),
            },
            children: [
              {
                path: 'b',
                resolve: {
                  bResolve: (route: ActivatedRouteSnapshot) => route.data['aResolve'] + 'b',
                },
                children: [{path: 'c', component: Empty}],
              },
            ],
          },
        ]),
      ],
    });
    await RouterTestingHarness.create('/a/b/c');
    const rootSnapshot = TestBed.inject(Router).routerState.root.firstChild!.snapshot;
    expect(rootSnapshot.firstChild!.firstChild!.data).toEqual({bResolve: 'ab', aResolve: 'a'});
  });

  it('should inherit resolved data from parent of parent route', async () => {
    @Component({
      template: '',
      standalone: false,
    })
    class Empty {}

    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'a',
            resolve: {aResolve: () => 'a'},
            children: [
              {
                path: 'b',
                resolve: {bResolve: () => 'b'},
                children: [{path: 'c', component: Empty}],
              },
            ],
          },
        ]),
      ],
    });
    await RouterTestingHarness.create('/a/b/c');
    const rootSnapshot = TestBed.inject(Router).routerState.root.firstChild!.snapshot;
    expect(rootSnapshot.firstChild!.firstChild!.data).toEqual({bResolve: 'b', aResolve: 'a'});
  });
});
