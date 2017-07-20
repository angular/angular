/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Routes} from '../src/config';
import {recognize} from '../src/recognize';
import {ActivatedRouteSnapshot, RouterStateSnapshot} from '../src/router_state';
import {PRIMARY_OUTLET, Params} from '../src/shared';
import {DefaultUrlSerializer, UrlTree} from '../src/url_tree';

describe('recognize', () => {
  it('should work', () => {
    checkRecognize([{path: 'a', component: ComponentA}], 'a', (s: RouterStateSnapshot) => {
      checkActivatedRoute(s.root, '', {}, RootComponent);
      checkActivatedRoute(s.firstChild(s.root) !, 'a', {}, ComponentA);
    });
  });

  it('should freeze params object', () => {
    checkRecognize([{path: 'a/:id', component: ComponentA}], 'a/10', (s: RouterStateSnapshot) => {
      checkActivatedRoute(s.root, '', {}, RootComponent);
      const child = s.firstChild(s.root) !;
      expect(Object.isFrozen(child.params)).toBeTruthy();
    });
  });

  it('should support secondary routes', () => {
    checkRecognize(
        [
          {path: 'a', component: ComponentA}, {path: 'b', component: ComponentB, outlet: 'left'},
          {path: 'c', component: ComponentC, outlet: 'right'}
        ],
        'a(left:b//right:c)', (s: RouterStateSnapshot) => {
          const c = s.children(s.root);
          checkActivatedRoute(c[0], 'a', {}, ComponentA);
          checkActivatedRoute(c[1], 'b', {}, ComponentB, 'left');
          checkActivatedRoute(c[2], 'c', {}, ComponentC, 'right');
        });
  });

  it('should set url segment and index properly', () => {
    const url = tree('a(left:b//right:c)');
    recognize(
        RootComponent,
        [
          {path: 'a', component: ComponentA}, {path: 'b', component: ComponentB, outlet: 'left'},
          {path: 'c', component: ComponentC, outlet: 'right'}
        ],
        url, 'a(left:b//right:c)')
        .subscribe((s) => {
          expect(s.root._urlSegment).toBe(url.root);
          expect(s.root._lastPathIndex).toBe(-1);

          const c = s.children(s.root);
          expect(c[0]._urlSegment).toBe(url.root.children[PRIMARY_OUTLET]);
          expect(c[0]._lastPathIndex).toBe(0);

          expect(c[1]._urlSegment).toBe(url.root.children['left']);
          expect(c[1]._lastPathIndex).toBe(0);

          expect(c[2]._urlSegment).toBe(url.root.children['right']);
          expect(c[2]._lastPathIndex).toBe(0);
        });
  });

  it('should set url segment and index properly (nested case)', () => {
    const url = tree('a/b/c');
    recognize(
        RootComponent,
        [
          {path: 'a/b', component: ComponentA, children: [{path: 'c', component: ComponentC}]},
        ],
        url, 'a/b/c')
        .subscribe((s: RouterStateSnapshot) => {
          expect(s.root._urlSegment).toBe(url.root);
          expect(s.root._lastPathIndex).toBe(-1);

          const compA = s.firstChild(s.root) !;
          expect(compA._urlSegment).toBe(url.root.children[PRIMARY_OUTLET]);
          expect(compA._lastPathIndex).toBe(1);

          const compC = s.firstChild(<any>compA) !;
          expect(compC._urlSegment).toBe(url.root.children[PRIMARY_OUTLET]);
          expect(compC._lastPathIndex).toBe(2);
        });
  });

  it('should set url segment and index properly (wildcard)', () => {
    const url = tree('a/b/c');
    recognize(
        RootComponent,
        [
          {path: 'a', component: ComponentA, children: [{path: '**', component: ComponentB}]},
        ],
        url, 'a/b/c')
        .subscribe((s: RouterStateSnapshot) => {
          expect(s.root._urlSegment).toBe(url.root);
          expect(s.root._lastPathIndex).toBe(-1);

          const compA = s.firstChild(s.root) !;
          expect(compA._urlSegment).toBe(url.root.children[PRIMARY_OUTLET]);
          expect(compA._lastPathIndex).toBe(0);

          const compC = s.firstChild(<any>compA) !;
          expect(compC._urlSegment).toBe(url.root.children[PRIMARY_OUTLET]);
          expect(compC._lastPathIndex).toBe(2);
        });
  });

  it('should match routes in the depth first order', () => {
    checkRecognize(
        [
          {path: 'a', component: ComponentA, children: [{path: ':id', component: ComponentB}]},
          {path: 'a/:id', component: ComponentC}
        ],
        'a/paramA', (s: RouterStateSnapshot) => {
          checkActivatedRoute(s.root, '', {}, RootComponent);
          checkActivatedRoute(s.firstChild(s.root) !, 'a', {}, ComponentA);
          checkActivatedRoute(
              s.firstChild(<any>s.firstChild(s.root)) !, 'paramA', {id: 'paramA'}, ComponentB);
        });

    checkRecognize(
        [{path: 'a', component: ComponentA}, {path: 'a/:id', component: ComponentC}], 'a/paramA',
        (s: RouterStateSnapshot) => {
          checkActivatedRoute(s.root, '', {}, RootComponent);
          checkActivatedRoute(s.firstChild(s.root) !, 'a/paramA', {id: 'paramA'}, ComponentC);
        });
  });

  it('should use outlet name when matching secondary routes', () => {
    checkRecognize(
        [
          {path: 'a', component: ComponentA}, {path: 'b', component: ComponentB, outlet: 'left'},
          {path: 'b', component: ComponentC, outlet: 'right'}
        ],
        'a(right:b)', (s: RouterStateSnapshot) => {
          const c = s.children(s.root);
          checkActivatedRoute(c[0], 'a', {}, ComponentA);
          checkActivatedRoute(c[1], 'b', {}, ComponentC, 'right');
        });
  });

  it('should handle non top-level secondary routes', () => {
    checkRecognize(
        [
          {
            path: 'a',
            component: ComponentA,
            children: [
              {path: 'b', component: ComponentB},
              {path: 'c', component: ComponentC, outlet: 'left'}
            ]
          },
        ],
        'a/(b//left:c)', (s: RouterStateSnapshot) => {
          const c = s.children(<any>s.firstChild(s.root));
          checkActivatedRoute(c[0], 'b', {}, ComponentB, PRIMARY_OUTLET);
          checkActivatedRoute(c[1], 'c', {}, ComponentC, 'left');
        });
  });

  it('should sort routes by outlet name', () => {
    checkRecognize(
        [
          {path: 'a', component: ComponentA}, {path: 'c', component: ComponentC, outlet: 'c'},
          {path: 'b', component: ComponentB, outlet: 'b'}
        ],
        'a(c:c//b:b)', (s: RouterStateSnapshot) => {
          const c = s.children(s.root);
          checkActivatedRoute(c[0], 'a', {}, ComponentA);
          checkActivatedRoute(c[1], 'b', {}, ComponentB, 'b');
          checkActivatedRoute(c[2], 'c', {}, ComponentC, 'c');
        });
  });

  it('should support matrix parameters', () => {
    checkRecognize(
        [
          {path: 'a', component: ComponentA, children: [{path: 'b', component: ComponentB}]},
          {path: 'c', component: ComponentC, outlet: 'left'}
        ],
        'a;a1=11;a2=22/b;b1=111;b2=222(left:c;c1=1111;c2=2222)', (s: RouterStateSnapshot) => {
          const c = s.children(s.root);
          checkActivatedRoute(c[0], 'a', {a1: '11', a2: '22'}, ComponentA);
          checkActivatedRoute(s.firstChild(<any>c[0]) !, 'b', {b1: '111', b2: '222'}, ComponentB);
          checkActivatedRoute(c[1], 'c', {c1: '1111', c2: '2222'}, ComponentC, 'left');
        });
  });

  describe('data', () => {
    it('should set static data', () => {
      checkRecognize(
          [{path: 'a', data: {one: 1}, component: ComponentA}], 'a', (s: RouterStateSnapshot) => {
            const r: ActivatedRouteSnapshot = s.firstChild(s.root) !;
            expect(r.data).toEqual({one: 1});
          });
    });

    it('should merge componentless route\'s data', () => {
      checkRecognize(
          [{
            path: 'a',
            data: {one: 1},
            children: [{path: 'b', data: {two: 2}, component: ComponentB}]
          }],
          'a/b', (s: RouterStateSnapshot) => {
            const r: ActivatedRouteSnapshot = s.firstChild(<any>s.firstChild(s.root)) !;
            expect(r.data).toEqual({one: 1, two: 2});
          });
    });

    it('should set resolved data', () => {
      checkRecognize(
          [{path: 'a', resolve: {one: 'some-token'}, component: ComponentA}], 'a',
          (s: RouterStateSnapshot) => {
            const r: ActivatedRouteSnapshot = s.firstChild(s.root) !;
            expect(r._resolve).toEqual({one: 'some-token'});
          });
    });
  });

  describe('empty path', () => {
    describe('root', () => {
      it('should work', () => {
        checkRecognize([{path: '', component: ComponentA}], '', (s: RouterStateSnapshot) => {
          checkActivatedRoute(s.firstChild(s.root) !, '', {}, ComponentA);
        });
      });

      it('should match when terminal', () => {
        checkRecognize(
            [{path: '', pathMatch: 'full', component: ComponentA}], '',
            (s: RouterStateSnapshot) => {
              checkActivatedRoute(s.firstChild(s.root) !, '', {}, ComponentA);
            });
      });

      it('should work (nested case)', () => {
        checkRecognize(
            [{path: '', component: ComponentA, children: [{path: '', component: ComponentB}]}], '',
            (s: RouterStateSnapshot) => {
              checkActivatedRoute(s.firstChild(s.root) !, '', {}, ComponentA);
              checkActivatedRoute(s.firstChild(<any>s.firstChild(s.root)) !, '', {}, ComponentB);
            });
      });

      it('should set url segment and index properly', () => {
        const url = tree('');
        recognize(
            RootComponent,
            [{path: '', component: ComponentA, children: [{path: '', component: ComponentB}]}], url,
            '')
            .forEach((s: RouterStateSnapshot) => {
              expect(s.root._urlSegment).toBe(url.root);
              expect(s.root._lastPathIndex).toBe(-1);

              const c = s.firstChild(s.root) !;
              expect(c._urlSegment).toBe(url.root);
              expect(c._lastPathIndex).toBe(-1);

              const c2 = s.firstChild(<any>s.firstChild(s.root)) !;
              expect(c2._urlSegment).toBe(url.root);
              expect(c2._lastPathIndex).toBe(-1);
            });
      });

      it('should inherit params', () => {
        checkRecognize(
            [{
              path: 'a',
              component: ComponentA,
              children: [
                {path: '', component: ComponentB, children: [{path: '', component: ComponentC}]}
              ]
            }],
            '/a;p=1', (s: RouterStateSnapshot) => {
              checkActivatedRoute(s.firstChild(s.root) !, 'a', {p: '1'}, ComponentA);
              checkActivatedRoute(s.firstChild(s.firstChild(s.root) !) !, '', {p: '1'}, ComponentB);
              checkActivatedRoute(
                  s.firstChild(s.firstChild(s.firstChild(s.root) !) !) !, '', {p: '1'}, ComponentC);
            });
      });
    });

    describe('aux split is in the middle', () => {
      it('should match (non-terminal)', () => {
        checkRecognize(
            [{
              path: 'a',
              component: ComponentA,
              children: [
                {path: 'b', component: ComponentB},
                {path: '', component: ComponentC, outlet: 'aux'}
              ]
            }],
            'a/b', (s: RouterStateSnapshot) => {
              checkActivatedRoute(s.firstChild(s.root) !, 'a', {}, ComponentA);

              const c = s.children(s.firstChild(s.root) !);
              checkActivatedRoute(c[0], 'b', {}, ComponentB);
              checkActivatedRoute(c[1], '', {}, ComponentC, 'aux');
            });
      });

      it('should match (non-termianl) when both primary and secondary and primary has a child',
         () => {
           const config = [{
             path: 'parent',
             children: [
               {
                 path: '',
                 component: ComponentA,
                 children: [
                   {path: 'b', component: ComponentB},
                   {path: 'c', component: ComponentC},
                 ]
               },
               {
                 path: '',
                 component: ComponentD,
                 outlet: 'secondary',
               }
             ]
           }];

           checkRecognize(config, 'parent/b', (s: RouterStateSnapshot) => {
             checkActivatedRoute(s.root, '', {}, RootComponent);
             checkActivatedRoute(s.firstChild(s.root) !, 'parent', {}, undefined !);

             const cc = s.children(s.firstChild(s.root) !);
             checkActivatedRoute(cc[0], '', {}, ComponentA);
             checkActivatedRoute(cc[1], '', {}, ComponentD, 'secondary');

             checkActivatedRoute(s.firstChild(cc[0]) !, 'b', {}, ComponentB);
           });
         });

      it('should match (terminal)', () => {
        checkRecognize(
            [{
              path: 'a',
              component: ComponentA,
              children: [
                {path: 'b', component: ComponentB},
                {path: '', pathMatch: 'full', component: ComponentC, outlet: 'aux'}
              ]
            }],
            'a/b', (s: RouterStateSnapshot) => {
              checkActivatedRoute(s.firstChild(s.root) !, 'a', {}, ComponentA);

              const c = s.children(s.firstChild(s.root) !);
              expect(c.length).toEqual(1);
              checkActivatedRoute(c[0], 'b', {}, ComponentB);
            });
      });

      it('should set url segment and index properly', () => {
        const url = tree('a/b');
        recognize(
            RootComponent, [{
              path: 'a',
              component: ComponentA,
              children: [
                {path: 'b', component: ComponentB},
                {path: '', component: ComponentC, outlet: 'aux'}
              ]
            }],
            url, 'a/b')
            .forEach((s: RouterStateSnapshot) => {
              expect(s.root._urlSegment).toBe(url.root);
              expect(s.root._lastPathIndex).toBe(-1);

              const a = s.firstChild(s.root) !;
              expect(a._urlSegment).toBe(url.root.children[PRIMARY_OUTLET]);
              expect(a._lastPathIndex).toBe(0);

              const b = s.firstChild(a) !;
              expect(b._urlSegment).toBe(url.root.children[PRIMARY_OUTLET]);
              expect(b._lastPathIndex).toBe(1);

              const c = s.children(a)[1];
              expect(c._urlSegment).toBe(url.root.children[PRIMARY_OUTLET]);
              expect(c._lastPathIndex).toBe(0);
            });
      });

      it('should set url segment and index properly when nested empty-path segments', () => {
        const url = tree('a');
        recognize(
            RootComponent, [{
              path: 'a',
              children: [
                {path: '', component: ComponentB, children: [{path: '', component: ComponentC}]}
              ]
            }],
            url, 'a')
            .forEach((s: RouterStateSnapshot) => {
              expect(s.root._urlSegment).toBe(url.root);
              expect(s.root._lastPathIndex).toBe(-1);

              const a = s.firstChild(s.root) !;
              expect(a._urlSegment).toBe(url.root.children[PRIMARY_OUTLET]);
              expect(a._lastPathIndex).toBe(0);

              const b = s.firstChild(a) !;
              expect(b._urlSegment).toBe(url.root.children[PRIMARY_OUTLET]);
              expect(b._lastPathIndex).toBe(0);

              const c = s.firstChild(b) !;
              expect(c._urlSegment).toBe(url.root.children[PRIMARY_OUTLET]);
              expect(c._lastPathIndex).toBe(0);
            });
      });

      it('should set url segment and index properly when nested empty-path segments (2)', () => {
        const url = tree('');
        recognize(
            RootComponent, [{
              path: '',
              children: [
                {path: '', component: ComponentB, children: [{path: '', component: ComponentC}]}
              ]
            }],
            url, '')
            .forEach((s: RouterStateSnapshot) => {
              expect(s.root._urlSegment).toBe(url.root);
              expect(s.root._lastPathIndex).toBe(-1);

              const a = s.firstChild(s.root) !;
              expect(a._urlSegment).toBe(url.root);
              expect(a._lastPathIndex).toBe(-1);

              const b = s.firstChild(a) !;
              expect(b._urlSegment).toBe(url.root);
              expect(b._lastPathIndex).toBe(-1);

              const c = s.firstChild(b) !;
              expect(c._urlSegment).toBe(url.root);
              expect(c._lastPathIndex).toBe(-1);
            });
      });
    });

    describe('aux split at the end (no right child)', () => {
      it('should match (non-terminal)', () => {
        checkRecognize(
            [{
              path: 'a',
              component: ComponentA,
              children: [
                {path: '', component: ComponentB},
                {path: '', component: ComponentC, outlet: 'aux'},
              ]
            }],
            'a', (s: RouterStateSnapshot) => {
              checkActivatedRoute(s.firstChild(s.root) !, 'a', {}, ComponentA);

              const c = s.children(s.firstChild(s.root) !);
              checkActivatedRoute(c[0], '', {}, ComponentB);
              checkActivatedRoute(c[1], '', {}, ComponentC, 'aux');
            });
      });

      it('should match (terminal)', () => {
        checkRecognize(
            [{
              path: 'a',
              component: ComponentA,
              children: [
                {path: '', pathMatch: 'full', component: ComponentB},
                {path: '', pathMatch: 'full', component: ComponentC, outlet: 'aux'},
              ]
            }],
            'a', (s: RouterStateSnapshot) => {
              checkActivatedRoute(s.firstChild(s.root) !, 'a', {}, ComponentA);

              const c = s.children(s.firstChild(s.root) !);
              checkActivatedRoute(c[0], '', {}, ComponentB);
              checkActivatedRoute(c[1], '', {}, ComponentC, 'aux');
            });
      });

      it('should work only only primary outlet', () => {
        checkRecognize(
            [{
              path: 'a',
              component: ComponentA,
              children: [
                {path: '', component: ComponentB},
                {path: 'c', component: ComponentC, outlet: 'aux'},
              ]
            }],
            'a/(aux:c)', (s: RouterStateSnapshot) => {
              checkActivatedRoute(s.firstChild(s.root) !, 'a', {}, ComponentA);

              const c = s.children(s.firstChild(s.root) !);
              checkActivatedRoute(c[0], '', {}, ComponentB);
              checkActivatedRoute(c[1], 'c', {}, ComponentC, 'aux');
            });
      });

      it('should work when split is at the root level', () => {
        checkRecognize(
            [
              {path: '', component: ComponentA}, {path: 'b', component: ComponentB},
              {path: 'c', component: ComponentC, outlet: 'aux'}
            ],
            '(aux:c)', (s: RouterStateSnapshot) => {
              checkActivatedRoute(s.root, '', {}, RootComponent);

              const children = s.children(s.root);
              expect(children.length).toEqual(2);
              checkActivatedRoute(children[0], '', {}, ComponentA);
              checkActivatedRoute(children[1], 'c', {}, ComponentC, 'aux');
            });
      });
    });

    describe('split at the end (right child)', () => {
      it('should match (non-terminal)', () => {
        checkRecognize(
            [{
              path: 'a',
              component: ComponentA,
              children: [
                {path: '', component: ComponentB, children: [{path: 'd', component: ComponentD}]},
                {
                  path: '',
                  component: ComponentC,
                  outlet: 'aux',
                  children: [{path: 'e', component: ComponentE}]
                },
              ]
            }],
            'a/(d//aux:e)', (s: RouterStateSnapshot) => {
              checkActivatedRoute(s.firstChild(s.root) !, 'a', {}, ComponentA);

              const c = s.children(s.firstChild(s.root) !);
              checkActivatedRoute(c[0], '', {}, ComponentB);
              checkActivatedRoute(s.firstChild(c[0]) !, 'd', {}, ComponentD);
              checkActivatedRoute(c[1], '', {}, ComponentC, 'aux');
              checkActivatedRoute(s.firstChild(c[1]) !, 'e', {}, ComponentE);
            });
      });
    });
  });

  describe('wildcards', () => {
    it('should support simple wildcards', () => {
      checkRecognize(
          [{path: '**', component: ComponentA}], 'a/b/c/d;a1=11', (s: RouterStateSnapshot) => {
            checkActivatedRoute(s.firstChild(s.root) !, 'a/b/c/d', {a1: '11'}, ComponentA);
          });
    });
  });

  describe('componentless routes', () => {
    it('should work', () => {
      checkRecognize(
          [{
            path: 'p/:id',
            children: [
              {path: 'a', component: ComponentA},
              {path: 'b', component: ComponentB, outlet: 'aux'}
            ]
          }],
          'p/11;pp=22/(a;pa=33//aux:b;pb=44)', (s: RouterStateSnapshot) => {
            const p = s.firstChild(s.root) !;
            checkActivatedRoute(p, 'p/11', {id: '11', pp: '22'}, undefined !);

            const c = s.children(p);
            checkActivatedRoute(c[0], 'a', {id: '11', pp: '22', pa: '33'}, ComponentA);
            checkActivatedRoute(c[1], 'b', {id: '11', pp: '22', pb: '44'}, ComponentB, 'aux');
          });
    });

    it('should merge params until encounters a normal route', () => {
      checkRecognize(
          [{
            path: 'p/:id',
            children: [{
              path: 'a/:name',
              children: [{
                path: 'b',
                component: ComponentB,
                children: [{path: 'c', component: ComponentC}]
              }]
            }]
          }],
          'p/11/a/victor/b/c', (s: RouterStateSnapshot) => {
            const p = s.firstChild(s.root) !;
            checkActivatedRoute(p, 'p/11', {id: '11'}, undefined !);

            const a = s.firstChild(p) !;
            checkActivatedRoute(a, 'a/victor', {id: '11', name: 'victor'}, undefined !);

            const b = s.firstChild(a) !;
            checkActivatedRoute(b, 'b', {id: '11', name: 'victor'}, ComponentB);

            const c = s.firstChild(b) !;
            checkActivatedRoute(c, 'c', {}, ComponentC);
          });
    });
  });

  describe('empty URL leftovers', () => {
    it('should not throw when no children matching', () => {
      checkRecognize(
          [{path: 'a', component: ComponentA, children: [{path: 'b', component: ComponentB}]}],
          '/a', (s: RouterStateSnapshot) => {
            const a = s.firstChild(s.root);
            checkActivatedRoute(a !, 'a', {}, ComponentA);
          });
    });

    it('should not throw when no children matching (aux routes)', () => {
      checkRecognize(
          [{
            path: 'a',
            component: ComponentA,
            children: [
              {path: 'b', component: ComponentB},
              {path: '', component: ComponentC, outlet: 'aux'},
            ]
          }],
          '/a', (s: RouterStateSnapshot) => {
            const a = s.firstChild(s.root) !;
            checkActivatedRoute(a, 'a', {}, ComponentA);
            checkActivatedRoute(a.children[0], '', {}, ComponentC, 'aux');
          });
    });
  });

  describe('custom path matchers', () => {
    it('should use custom path matcher', () => {
      const matcher = (s: any, g: any, r: any) => {
        if (s[0].path === 'a') {
          return {consumed: s.slice(0, 2), posParams: {id: s[1]}};
        } else {
          return null;
        }
      };

      checkRecognize(
          [{
            matcher: matcher,
            component: ComponentA,
            children: [{path: 'b', component: ComponentB}]
          }] as any,
          '/a/1;p=99/b', (s: RouterStateSnapshot) => {
            const a = s.root.firstChild !;
            checkActivatedRoute(a, 'a/1', {id: '1', p: '99'}, ComponentA);
            checkActivatedRoute(a.firstChild !, 'b', {}, ComponentB);
          });
    });
  });

  describe('query parameters', () => {
    it('should support query params', () => {
      const config = [{path: 'a', component: ComponentA}];
      checkRecognize(config, 'a?q=11', (s: RouterStateSnapshot) => {
        expect(s.root.queryParams).toEqual({q: '11'});
        expect(s.root.queryParamMap.get('q')).toEqual('11');
      });
    });

    it('should freeze query params object', () => {
      checkRecognize([{path: 'a', component: ComponentA}], 'a?q=11', (s: RouterStateSnapshot) => {
        expect(Object.isFrozen(s.root.queryParams)).toBeTruthy();
      });
    });
  });

  describe('fragment', () => {
    it('should support fragment', () => {
      const config = [{path: 'a', component: ComponentA}];
      checkRecognize(
          config, 'a#f1', (s: RouterStateSnapshot) => { expect(s.root.fragment).toEqual('f1'); });
    });
  });

  describe('error handling', () => {
    it('should error when two routes with the same outlet name got matched', () => {
      recognize(
          RootComponent,
          [
            {path: 'a', component: ComponentA}, {path: 'b', component: ComponentB, outlet: 'aux'},
            {path: 'c', component: ComponentC, outlet: 'aux'}
          ],
          tree('a(aux:b//aux:c)'), 'a(aux:b//aux:c)')
          .subscribe((_) => {}, (s: RouterStateSnapshot) => {
            expect(s.toString())
                .toContain(
                    'Two segments cannot have the same outlet name: \'aux:b\' and \'aux:c\'.');
          });
    });
  });
});

function checkRecognize(config: Routes, url: string, callback: any): void {
  recognize(RootComponent, config, tree(url), url).subscribe(callback, e => { throw e; });
}

function checkActivatedRoute(
    actual: ActivatedRouteSnapshot, url: string, params: Params, cmp: Function,
    outlet: string = PRIMARY_OUTLET): void {
  if (actual === null) {
    expect(actual).not.toBeNull();
  } else {
    expect(actual.url.map(s => s.path).join('/')).toEqual(url);
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
