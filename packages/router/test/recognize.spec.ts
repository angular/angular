/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {EnvironmentInjector} from '@angular/core';
import {TestBed} from '@angular/core/testing';

import {Routes, UrlMatcher} from '../src/models';
import {Recognizer} from '../src/recognize';
import {RouterConfigLoader} from '../src/router_config_loader';
import {ActivatedRouteSnapshot, RouterStateSnapshot} from '../src/router_state';
import {Params, PRIMARY_OUTLET} from '../src/shared';
import {DefaultUrlSerializer, UrlTree} from '../src/url_tree';
import {useAutoTick} from './helpers';

describe('recognize', () => {
  useAutoTick();
  it('should work', async () => {
    const s = await recognize([{path: 'a', component: ComponentA}], 'a');
    checkActivatedRoute(s.root, '', {}, RootComponent);
    checkActivatedRoute(s.root.firstChild!, 'a', {}, ComponentA);
  });

  it('should freeze params object', async () => {
    const s: RouterStateSnapshot = await recognize(
      [{path: 'a/:id', component: ComponentA}],
      'a/10',
    );
    checkActivatedRoute(s.root, '', {}, RootComponent);
    const child = s.root.firstChild!;
    expect(Object.isFrozen(child.params)).toBeTruthy();
  });

  it('should freeze data object (but not original route data)', async () => {
    const someData = {a: 1};
    const s: RouterStateSnapshot = await recognize(
      [{path: '**', component: ComponentA, data: someData}],
      'a',
    );
    checkActivatedRoute(s.root, '', {}, RootComponent);
    const child = s.root.firstChild!;
    expect(Object.isFrozen(child.data)).toBeTruthy();
    expect(Object.isFrozen(someData)).toBeFalsy();
  });

  it('should support secondary routes', async () => {
    const s: RouterStateSnapshot = await recognize(
      [
        {path: 'a', component: ComponentA},
        {path: 'b', component: ComponentB, outlet: 'left'},
        {path: 'c', component: ComponentC, outlet: 'right'},
      ],
      'a(left:b//right:c)',
    );
    const c = s.root.children;
    checkActivatedRoute(c[0], 'a', {}, ComponentA);
    checkActivatedRoute(c[1], 'b', {}, ComponentB, 'left');
    checkActivatedRoute(c[2], 'c', {}, ComponentC, 'right');
  });

  it('should set url segment and index properly', async () => {
    const url = tree('a(left:b//right:c)');
    const s = await recognize(
      [
        {path: 'a', component: ComponentA},
        {path: 'b', component: ComponentB, outlet: 'left'},
        {path: 'c', component: ComponentC, outlet: 'right'},
      ],
      'a(left:b//right:c)',
    );
    expect(s.root.url.toString()).toEqual(url.root.toString());

    const c = s.root.children;
    expect(c[0].url.toString()).toEqual(url.root.children[PRIMARY_OUTLET].toString());

    expect(c[1].url.toString()).toEqual(url.root.children['left'].toString());

    expect(c[2].url.toString()).toEqual(url.root.children['right'].toString());
  });

  it('should match routes in the depth first order', async () => {
    const s = await recognize(
      [
        {path: 'a', component: ComponentA, children: [{path: ':id', component: ComponentB}]},
        {path: 'a/:id', component: ComponentC},
      ],
      'a/paramA',
    );
    checkActivatedRoute(s.root, '', {}, RootComponent);
    checkActivatedRoute(s.root.firstChild!, 'a', {}, ComponentA);
    checkActivatedRoute(s.root.firstChild!.firstChild!, 'paramA', {id: 'paramA'}, ComponentB);

    const s2 = await recognize(
      [
        {path: 'a', component: ComponentA},
        {path: 'a/:id', component: ComponentC},
      ],
      'a/paramA',
    );
    checkActivatedRoute(s2.root, '', {}, RootComponent);
    checkActivatedRoute(s2.root.firstChild!, 'a/paramA', {id: 'paramA'}, ComponentC);
  });

  it('should use outlet name when matching secondary routes', async () => {
    const s = await recognize(
      [
        {path: 'a', component: ComponentA},
        {path: 'b', component: ComponentB, outlet: 'left'},
        {path: 'b', component: ComponentC, outlet: 'right'},
      ],
      'a(right:b)',
    );
    const c = s.root.children;
    checkActivatedRoute(c[0], 'a', {}, ComponentA);
    checkActivatedRoute(c[1], 'b', {}, ComponentC, 'right');
  });

  it('should handle non top-level secondary routes', async () => {
    const s = await recognize(
      [
        {
          path: 'a',
          component: ComponentA,
          children: [
            {path: 'b', component: ComponentB},
            {path: 'c', component: ComponentC, outlet: 'left'},
          ],
        },
      ],
      'a/(b//left:c)',
    );
    const c = s.root.firstChild!.children;
    checkActivatedRoute(c[0], 'b', {}, ComponentB, PRIMARY_OUTLET);
    checkActivatedRoute(c[1], 'c', {}, ComponentC, 'left');
  });

  it('should sort routes by outlet name', async () => {
    const s = await recognize(
      [
        {path: 'a', component: ComponentA},
        {path: 'c', component: ComponentC, outlet: 'c'},
        {path: 'b', component: ComponentB, outlet: 'b'},
      ],
      'a(c:c//b:b)',
    );
    const c = s.root.children;
    checkActivatedRoute(c[0], 'a', {}, ComponentA);
    checkActivatedRoute(c[1], 'b', {}, ComponentB, 'b');
    checkActivatedRoute(c[2], 'c', {}, ComponentC, 'c');
  });

  it('should support matrix parameters', async () => {
    const s = await recognize(
      [
        {path: 'a', component: ComponentA, children: [{path: 'b', component: ComponentB}]},
        {path: 'c', component: ComponentC, outlet: 'left'},
      ],
      'a;a1=11;a2=22/b;b1=111;b2=222(left:c;c1=1111;c2=2222)',
    );
    const c = s.root.children;
    checkActivatedRoute(c[0], 'a', {a1: '11', a2: '22'}, ComponentA);
    checkActivatedRoute(c[0].firstChild!, 'b', {b1: '111', b2: '222'}, ComponentB);
    checkActivatedRoute(c[1], 'c', {c1: '1111', c2: '2222'}, ComponentC, 'left');
  });

  describe('data', () => {
    it('should set static data', async () => {
      const s = await recognize([{path: 'a', data: {one: 1}, component: ComponentA}], 'a');
      const r: ActivatedRouteSnapshot = s.root.firstChild!;
      expect(r.data).toEqual({one: 1});
    });

    it("should inherit componentless route's data", async () => {
      const s = await recognize(
        [
          {
            path: 'a',
            data: {one: 1},
            children: [{path: 'b', data: {two: 2}, component: ComponentB}],
          },
        ],
        'a/b',
      );
      const r: ActivatedRouteSnapshot = s.root.firstChild!.firstChild!;
      expect(r.data).toEqual({one: 1, two: 2});
    });

    it("should not inherit route's data if it has component", async () => {
      const s = await recognize(
        [
          {
            path: 'a',
            component: ComponentA,
            data: {one: 1},
            children: [{path: 'b', data: {two: 2}, component: ComponentB}],
          },
        ],
        'a/b',
      );
      const r: ActivatedRouteSnapshot = s.root.firstChild!.firstChild!;
      expect(r.data).toEqual({two: 2});
    });

    it("should not inherit route's data if it has loadComponent", async () => {
      const s = await recognize(
        [
          {
            path: 'a',
            loadComponent: () => ComponentA,
            data: {one: 1},
            children: [{path: 'b', data: {two: 2}, component: ComponentB}],
          },
        ],
        'a/b',
      );
      const r: ActivatedRouteSnapshot = s.root.firstChild!.firstChild!;
      expect(r.data).toEqual({two: 2});
    });

    it("should inherit route's data if paramsInheritanceStrategy is 'always'", async () => {
      const s = await recognize(
        [
          {
            path: 'a',
            component: ComponentA,
            data: {one: 1},
            children: [{path: 'b', data: {two: 2}, component: ComponentB}],
          },
        ],
        'a/b',
        'always',
      );
      const r: ActivatedRouteSnapshot = s.root.firstChild!.firstChild!;
      expect(r.data).toEqual({one: 1, two: 2});
    });

    it('should set resolved data', async () => {
      const s = await recognize(
        [{path: 'a', resolve: {one: 'some-token'}, component: ComponentA}],
        'a',
      );
      const r: any = s.root.firstChild!;
      expect(r._resolve).toEqual({one: 'some-token'});
    });
  });

  describe('empty path', () => {
    describe('root', () => {
      it('should work', async () => {
        const s = await recognize([{path: '', component: ComponentA}], '');
        checkActivatedRoute(s.root.firstChild!, '', {}, ComponentA);
      });

      it('should match when terminal', async () => {
        const s = await recognize([{path: '', pathMatch: 'full', component: ComponentA}], '');
        checkActivatedRoute(s.root.firstChild!, '', {}, ComponentA);
      });

      it('should work (nested case)', async () => {
        const s = await recognize(
          [{path: '', component: ComponentA, children: [{path: '', component: ComponentB}]}],
          '',
        );
        checkActivatedRoute(s.root.firstChild!, '', {}, ComponentA);
        checkActivatedRoute(s.root.firstChild!.firstChild!, '', {}, ComponentB);
      });

      it('should inherit params', async () => {
        const s = await recognize(
          [
            {
              path: 'a',
              component: ComponentA,
              children: [
                {path: '', component: ComponentB, children: [{path: '', component: ComponentC}]},
              ],
            },
          ],
          '/a;p=1',
        );
        checkActivatedRoute(s.root.firstChild!, 'a', {p: '1'}, ComponentA);
        checkActivatedRoute(s.root.firstChild!.firstChild!, '', {p: '1'}, ComponentB);
        checkActivatedRoute(s.root.firstChild!.firstChild!.firstChild!, '', {p: '1'}, ComponentC);
      });
    });

    describe('aux split is in the middle', () => {
      it('should match (non-terminal)', async () => {
        const s = await recognize(
          [
            {
              path: 'a',
              component: ComponentA,
              children: [
                {path: 'b', component: ComponentB},
                {path: '', component: ComponentC, outlet: 'aux'},
              ],
            },
          ],
          'a/b',
        );
        checkActivatedRoute(s.root.firstChild!, 'a', {}, ComponentA);

        const c = s.root.firstChild!.children;
        checkActivatedRoute(c[0], 'b', {}, ComponentB);
        checkActivatedRoute(c[1], '', {}, ComponentC, 'aux');
      });

      it('should match (non-terminal) when both primary and secondary and primary has a child', async () => {
        const config = [
          {
            path: 'parent',
            children: [
              {
                path: '',
                component: ComponentA,
                children: [
                  {path: 'b', component: ComponentB},
                  {path: 'c', component: ComponentC},
                ],
              },
              {
                path: '',
                component: ComponentD,
                outlet: 'secondary',
              },
            ],
          },
        ];

        const s = await recognize(config, 'parent/b');
        checkActivatedRoute(s.root, '', {}, RootComponent);
        checkActivatedRoute(s.root.firstChild!, 'parent', {}, null);

        const cc = s.root.firstChild!.children;
        checkActivatedRoute(cc[0], '', {}, ComponentA);
        checkActivatedRoute(cc[1], '', {}, ComponentD, 'secondary');

        checkActivatedRoute(cc[0].firstChild!, 'b', {}, ComponentB);
      });

      it('should match (terminal)', async () => {
        const s = await recognize(
          [
            {
              path: 'a',
              component: ComponentA,
              children: [
                {path: 'b', component: ComponentB},
                {path: '', pathMatch: 'full', component: ComponentC, outlet: 'aux'},
              ],
            },
          ],
          'a/b',
        );
        checkActivatedRoute(s.root.firstChild!, 'a', {}, ComponentA);

        const c = s.root.firstChild!.children;
        expect(c.length).toEqual(1);
        checkActivatedRoute(c[0], 'b', {}, ComponentB);
      });
    });

    describe('aux split at the end (no right child)', () => {
      it('should match (non-terminal)', async () => {
        const s = await recognize(
          [
            {
              path: 'a',
              component: ComponentA,
              children: [
                {path: '', component: ComponentB},
                {path: '', component: ComponentC, outlet: 'aux'},
              ],
            },
          ],
          'a',
        );
        checkActivatedRoute(s.root.firstChild!, 'a', {}, ComponentA);

        const c = s.root.firstChild!.children;
        checkActivatedRoute(c[0], '', {}, ComponentB);
        checkActivatedRoute(c[1], '', {}, ComponentC, 'aux');
      });

      it('should match (terminal)', async () => {
        const s = await recognize(
          [
            {
              path: 'a',
              component: ComponentA,
              children: [
                {path: '', pathMatch: 'full', component: ComponentB},
                {path: '', pathMatch: 'full', component: ComponentC, outlet: 'aux'},
              ],
            },
          ],
          'a',
        );
        checkActivatedRoute(s.root.firstChild!, 'a', {}, ComponentA);

        const c = s.root.firstChild!.children;
        checkActivatedRoute(c[0], '', {}, ComponentB);
        checkActivatedRoute(c[1], '', {}, ComponentC, 'aux');
      });

      it('should work only only primary outlet', async () => {
        const s = await recognize(
          [
            {
              path: 'a',
              component: ComponentA,
              children: [
                {path: '', component: ComponentB},
                {path: 'c', component: ComponentC, outlet: 'aux'},
              ],
            },
          ],
          'a/(aux:c)',
        );
        checkActivatedRoute(s.root.firstChild!, 'a', {}, ComponentA);

        const c = s.root.firstChild!.children;
        checkActivatedRoute(c[0], '', {}, ComponentB);
        checkActivatedRoute(c[1], 'c', {}, ComponentC, 'aux');
      });

      it('should work when split is at the root level', async () => {
        const s = await recognize(
          [
            {path: '', component: ComponentA},
            {path: 'b', component: ComponentB},
            {path: 'c', component: ComponentC, outlet: 'aux'},
          ],
          '(aux:c)',
        );
        checkActivatedRoute(s.root, '', {}, RootComponent);

        const children = s.root.children;
        expect(children.length).toEqual(2);
        checkActivatedRoute(children[0], '', {}, ComponentA);
        checkActivatedRoute(children[1], 'c', {}, ComponentC, 'aux');
      });
    });

    describe('split at the end (right child)', () => {
      it('should match (non-terminal)', async () => {
        const s = await recognize(
          [
            {
              path: 'a',
              component: ComponentA,
              children: [
                {path: '', component: ComponentB, children: [{path: 'd', component: ComponentD}]},
                {
                  path: '',
                  component: ComponentC,
                  outlet: 'aux',
                  children: [{path: 'e', component: ComponentE}],
                },
              ],
            },
          ],
          'a/(d//aux:e)',
        );
        checkActivatedRoute(s.root.firstChild!, 'a', {}, ComponentA);

        const c = s.root.firstChild!.children;
        checkActivatedRoute(c[0], '', {}, ComponentB);
        checkActivatedRoute(c[0].firstChild!, 'd', {}, ComponentD);
        checkActivatedRoute(c[1], '', {}, ComponentC, 'aux');
        checkActivatedRoute(c[1].firstChild!, 'e', {}, ComponentE);
      });
    });

    describe('with outlets', () => {
      it('should work when outlet is a child of empty path parent', async () => {
        const s = await recognize(
          [
            {
              path: '',
              component: ComponentA,
              children: [{path: 'b', outlet: 'b', component: ComponentB}],
            },
          ],
          '(b:b)',
        );
        checkActivatedRoute(s.root.children[0], '', {}, ComponentA);
        checkActivatedRoute(s.root.children[0].children[0], 'b', {}, ComponentB, 'b');
      });

      it('should work for outlets adjacent to empty path', async () => {
        const s = await recognize(
          [
            {
              path: '',
              component: ComponentA,
              children: [{path: '', component: ComponentC}],
            },
            {path: 'b', outlet: 'b', component: ComponentB},
          ],
          '(b:b)',
        );
        const [primaryChild, outletChild] = s.root.children;
        checkActivatedRoute(primaryChild, '', {}, ComponentA);
        checkActivatedRoute(outletChild, 'b', {}, ComponentB, 'b');
        checkActivatedRoute(primaryChild.children[0], '', {}, ComponentC);
      });

      it('should work with named outlets both adjecent to and as a child of empty path', async () => {
        const s = await recognize(
          [
            {
              path: '',
              component: ComponentA,
              children: [{path: 'b', outlet: 'b', component: ComponentB}],
            },
            {path: 'c', outlet: 'c', component: ComponentC},
          ],
          '(b:b//c:c)',
        );
        checkActivatedRoute(s.root.children[0], '', {}, ComponentA);
        checkActivatedRoute(s.root.children[1], 'c', {}, ComponentC, 'c');
        checkActivatedRoute(s.root.children[0].children[0], 'b', {}, ComponentB, 'b');
      });

      it('should work with children outlets within two levels of empty parents', async () => {
        const s = await recognize(
          [
            {
              path: '',
              component: ComponentA,
              children: [
                {
                  path: '',
                  component: ComponentB,
                  children: [{path: 'c', outlet: 'c', component: ComponentC}],
                },
              ],
            },
          ],
          '(c:c)',
        );
        const [compAConfig] = s.root.children;
        checkActivatedRoute(compAConfig, '', {}, ComponentA);
        expect(compAConfig.children.length).toBe(1);

        const [compBConfig] = compAConfig.children;
        checkActivatedRoute(compBConfig, '', {}, ComponentB);
        expect(compBConfig.children.length).toBe(1);

        const [compCConfig] = compBConfig.children;
        checkActivatedRoute(compCConfig, 'c', {}, ComponentC, 'c');
      });

      it('should not persist a primary segment beyond the boundary of a named outlet match', async () => {
        const recognizePromise = new Recognizer(
          TestBed.inject(EnvironmentInjector),
          TestBed.inject(RouterConfigLoader),
          RootComponent,
          [
            {
              path: '',
              component: ComponentA,
              outlet: 'a',
              children: [{path: 'b', component: ComponentB}],
            },
          ],
          tree('/b'),
          'emptyOnly',
          new DefaultUrlSerializer(),
        )
          .recognize()
          .toPromise();
        await expectAsync(recognizePromise).toBeRejected();
      });
    });
  });

  describe('wildcards', () => {
    it('should support simple wildcards', async () => {
      const s = await recognize([{path: '**', component: ComponentA}], 'a/b/c/d;a1=11');
      checkActivatedRoute(s.root.firstChild!, 'a/b/c/d', {a1: '11'}, ComponentA);
    });
  });

  describe('componentless routes', () => {
    it('should work', async () => {
      const s = await recognize(
        [
          {
            path: 'p/:id',
            children: [
              {path: 'a', component: ComponentA},
              {path: 'b', component: ComponentB, outlet: 'aux'},
            ],
          },
        ],
        'p/11;pp=22/(a;pa=33//aux:b;pb=44)',
      );
      const p = s.root.firstChild!;
      checkActivatedRoute(p, 'p/11', {id: '11', pp: '22'}, null);

      const c = p.children;
      checkActivatedRoute(c[0], 'a', {id: '11', pp: '22', pa: '33'}, ComponentA);
      checkActivatedRoute(c[1], 'b', {id: '11', pp: '22', pb: '44'}, ComponentB, 'aux');
    });

    it('should inherit params until encounters a normal route', async () => {
      const s = await recognize(
        [
          {
            path: 'p/:id',
            children: [
              {
                path: 'a/:name',
                children: [
                  {
                    path: 'b',
                    component: ComponentB,
                    children: [{path: 'c', component: ComponentC}],
                  },
                ],
              },
            ],
          },
        ],
        'p/11/a/victor/b/c',
      );
      const p = s.root.firstChild!;
      checkActivatedRoute(p, 'p/11', {id: '11'}, null);

      const a = p.firstChild!;
      checkActivatedRoute(a, 'a/victor', {id: '11', name: 'victor'}, null);

      const b = a.firstChild!;
      checkActivatedRoute(b, 'b', {id: '11', name: 'victor'}, ComponentB);

      const c = b.firstChild!;
      checkActivatedRoute(c, 'c', {}, ComponentC);
    });

    it("should inherit all params if paramsInheritanceStrategy is 'always'", async () => {
      const s = await recognize(
        [
          {
            path: 'p/:id',
            children: [
              {
                path: 'a/:name',
                children: [
                  {
                    path: 'b',
                    component: ComponentB,
                    children: [{path: 'c', component: ComponentC}],
                  },
                ],
              },
            ],
          },
        ],
        'p/11/a/victor/b/c',
        'always',
      );
      const c = s.root.firstChild!.firstChild!.firstChild!.firstChild!;
      checkActivatedRoute(c, 'c', {id: '11', name: 'victor'}, ComponentC);
    });
  });

  describe('empty URL leftovers', () => {
    it('should not throw when no children matching', async () => {
      const s = await recognize(
        [{path: 'a', component: ComponentA, children: [{path: 'b', component: ComponentB}]}],
        '/a',
      );
      const a = s.root.firstChild;
      checkActivatedRoute(a!, 'a', {}, ComponentA);
    });

    it('should not throw when no children matching (aux routes)', async () => {
      const s = await recognize(
        [
          {
            path: 'a',
            component: ComponentA,
            children: [
              {path: 'b', component: ComponentB},
              {path: '', component: ComponentC, outlet: 'aux'},
            ],
          },
        ],
        '/a',
      );
      const a = s.root.firstChild!;
      checkActivatedRoute(a, 'a', {}, ComponentA);
      checkActivatedRoute(a.children[0], '', {}, ComponentC, 'aux');
    });
  });

  describe('custom path matchers', () => {
    it('should run once', async () => {
      let calls = 0;
      const matcher: UrlMatcher = (s) => {
        calls++;
        return {consumed: s};
      };

      const s = await recognize(
        [
          {
            matcher,
            component: ComponentA,
          },
        ],
        '/a/1/b',
      );
      const a = s.root.firstChild!;
      checkActivatedRoute(a, 'a/1/b', {}, ComponentA);
      expect(calls).toBe(1);
    });

    it('should use custom path matcher', async () => {
      const matcher = (s: any, g: any, r: any) => {
        if (s[0].path === 'a') {
          return {consumed: s.slice(0, 2), posParams: {id: s[1]}};
        } else {
          return null;
        }
      };

      const s = await recognize(
        [
          {
            matcher: matcher,
            component: ComponentA,
            children: [{path: 'b', component: ComponentB}],
          },
        ] as any,
        '/a/1;p=99/b',
      );
      const a = s.root.firstChild!;
      checkActivatedRoute(a, 'a/1', {id: '1', p: '99'}, ComponentA);
      checkActivatedRoute(a.firstChild!, 'b', {}, ComponentB);
    });

    it('should work with terminal route', async () => {
      const matcher = (s: any, g: any, r: any) => (s.length === 0 ? {consumed: s} : null);

      const s = await recognize([{matcher, component: ComponentA}], '');
      const a = s.root.firstChild!;
      checkActivatedRoute(a, '', {}, ComponentA);
    });

    it('should work with child terminal route', async () => {
      const matcher = (s: any, g: any, r: any) => (s.length === 0 ? {consumed: s} : null);

      const s = await recognize(
        [{path: 'a', component: ComponentA, children: [{matcher, component: ComponentB}]}],
        'a',
      );
      const a = s.root.firstChild!;
      checkActivatedRoute(a, 'a', {}, ComponentA);
    });
  });

  describe('query parameters', () => {
    it('should support query params', async () => {
      const config = [{path: 'a', component: ComponentA}];
      const s = await recognize(config, 'a?q=11');
      expect(s.root.queryParams).toEqual({q: '11'});
      expect(s.root.queryParamMap.get('q')).toEqual('11');
    });

    it('should freeze query params object', async () => {
      const s = await recognize([{path: 'a', component: ComponentA}], 'a?q=11');
      expect(Object.isFrozen(s.root.queryParams)).toBeTruthy();
    });

    it('should not freeze UrlTree query params', async () => {
      const url = tree('a?q=11');
      const s = await recognize([{path: 'a', component: ComponentA}], 'a?q=11');
      expect(Object.isFrozen(url.queryParams)).toBe(false);
    });
  });

  describe('fragment', () => {
    it('should support fragment', async () => {
      const config = [{path: 'a', component: ComponentA}];
      const s = await recognize(config, 'a#f1');
      expect(s.root.fragment).toEqual('f1');
    });
  });

  describe('guards', () => {
    it('should run canMatch guards on wildcard routes', async () => {
      const config = [
        {path: '**', component: ComponentA, data: {id: 'a'}, canMatch: [() => false]},
        {path: '**', component: ComponentB, data: {id: 'b'}},
      ];
      const s = await recognize(config, 'a');
      expect(s.root.firstChild!.data['id']).toEqual('b');
    });
  });
});

async function recognize(
  config: Routes,
  url: string,
  paramsInheritanceStrategy: 'emptyOnly' | 'always' = 'emptyOnly',
): Promise<RouterStateSnapshot> {
  const serializer = new DefaultUrlSerializer();
  const result = await new Recognizer(
    TestBed.inject(EnvironmentInjector),
    TestBed.inject(RouterConfigLoader),
    RootComponent,
    config,
    tree(url),
    paramsInheritanceStrategy,
    serializer,
  )
    .recognize()
    .toPromise();
  return result!.state;
}

function checkActivatedRoute(
  actual: ActivatedRouteSnapshot,
  url: string,
  params: Params,
  cmp: Function | null,
  outlet: string = PRIMARY_OUTLET,
): void {
  if (actual === null) {
    expect(actual).not.toBeNull();
  } else {
    expect(actual.url.map((s) => s.path).join('/')).toEqual(url);
    expect(actual.params).toEqual(params);
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
class ComponentD {}
class ComponentE {}
