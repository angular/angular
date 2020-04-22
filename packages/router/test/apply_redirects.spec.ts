/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModuleRef} from '@angular/core';
import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {ActivatedRouteSnapshot} from '@angular/router';
import {TreeNode} from '@angular/router/src/utils/tree';
import {Observable, of} from 'rxjs';
import {delay, tap} from 'rxjs/operators';

import {applyRedirects} from '../src/apply_redirects';
import {LoadedRouterConfig, Route, Routes} from '../src/config';
import {DefaultUrlSerializer, equalSegments, UrlSegment, UrlSegmentGroup, UrlTree} from '../src/url_tree';

describe('applyRedirects', () => {
  const serializer = new DefaultUrlSerializer();
  let testModule: NgModuleRef<any>;

  beforeEach(() => {
    testModule = TestBed.inject(NgModuleRef);
  });

  it('should return the same url tree when no redirects', () => {
    checkRedirect(
        [
          {
            path: 'a',
            component: ComponentA,
            children: [
              {path: 'b', component: ComponentB},
            ],
          },
        ],
        '/a/b', (t: UrlTree) => {
          expectTreeToBe(t, '/a/b');
        });
  });

  it('should add new segments when needed', () => {
    checkRedirect(
        [{path: 'a/b', redirectTo: 'a/b/c'}, {path: '**', component: ComponentC}], '/a/b',
        (t: UrlTree) => {
          expectTreeToBe(t, '/a/b/c');
        });
  });

  it('should support redirecting with to an URL with query parameters', () => {
    const config: Routes = [
      {path: 'single_value', redirectTo: '/dst?k=v1'},
      {path: 'multiple_values', redirectTo: '/dst?k=v1&k=v2'},
      {path: '**', component: ComponentA},
    ];

    checkRedirect(config, 'single_value', (t: UrlTree) => expectTreeToBe(t, '/dst?k=v1'));
    checkRedirect(config, 'multiple_values', (t: UrlTree) => expectTreeToBe(t, '/dst?k=v1&k=v2'));
  });

  it('should handle positional parameters', () => {
    checkRedirect(
        [
          {path: 'a/:aid/b/:bid', redirectTo: 'newa/:aid/newb/:bid'},
          {path: '**', component: ComponentC}
        ],
        '/a/1/b/2', (t: UrlTree) => {
          expectTreeToBe(t, '/newa/1/newb/2');
        });
  });

  it('should throw when cannot handle a positional parameter', () => {
    applyRedirects(testModule.injector, null!, serializer, tree('/a/1'), [
      {path: 'a/:id', redirectTo: 'a/:other'}
    ]).subscribe(() => {}, (e) => {
      expect(e.message).toEqual('Cannot redirect to \'a/:other\'. Cannot find \':other\'.');
    });
  });

  it('should pass matrix parameters', () => {
    checkRedirect(
        [{path: 'a/:id', redirectTo: 'd/a/:id/e'}, {path: '**', component: ComponentC}],
        '/a;p1=1/1;p2=2', (t: UrlTree) => {
          expectTreeToBe(t, '/d/a;p1=1/1;p2=2/e');
        });
  });

  it('should handle preserve secondary routes', () => {
    checkRedirect(
        [
          {path: 'a/:id', redirectTo: 'd/a/:id/e'},
          {path: 'c/d', component: ComponentA, outlet: 'aux'}, {path: '**', component: ComponentC}
        ],
        '/a/1(aux:c/d)', (t: UrlTree) => {
          expectTreeToBe(t, '/d/a/1/e(aux:c/d)');
        });
  });

  it('should redirect secondary routes', () => {
    checkRedirect(
        [
          {path: 'a/:id', component: ComponentA},
          {path: 'c/d', redirectTo: 'f/c/d/e', outlet: 'aux'},
          {path: '**', component: ComponentC, outlet: 'aux'}
        ],
        '/a/1(aux:c/d)', (t: UrlTree) => {
          expectTreeToBe(t, '/a/1(aux:f/c/d/e)');
        });
  });

  it('should use the configuration of the route redirected to', () => {
    checkRedirect(
        [
          {
            path: 'a',
            component: ComponentA,
            children: [
              {path: 'b', component: ComponentB},
            ]
          },
          {path: 'c', redirectTo: 'a'}
        ],
        'c/b', (t: UrlTree) => {
          expectTreeToBe(t, 'a/b');
        });
  });

  it('should support redirects with both main and aux', () => {
    checkRedirect(
        [{
          path: 'a',
          children: [
            {path: 'bb', component: ComponentB}, {path: 'b', redirectTo: 'bb'},

            {path: 'cc', component: ComponentC, outlet: 'aux'},
            {path: 'b', redirectTo: 'cc', outlet: 'aux'}
          ]
        }],
        'a/(b//aux:b)', (t: UrlTree) => {
          expectTreeToBe(t, 'a/(bb//aux:cc)');
        });
  });

  it('should support redirects with both main and aux (with a nested redirect)', () => {
    checkRedirect(
        [{
          path: 'a',
          children: [
            {path: 'bb', component: ComponentB}, {path: 'b', redirectTo: 'bb'},

            {
              path: 'cc',
              component: ComponentC,
              outlet: 'aux',
              children: [{path: 'dd', component: ComponentC}, {path: 'd', redirectTo: 'dd'}]
            },
            {path: 'b', redirectTo: 'cc/d', outlet: 'aux'}
          ]
        }],
        'a/(b//aux:b)', (t: UrlTree) => {
          expectTreeToBe(t, 'a/(bb//aux:cc/dd)');
        });
  });

  it('should redirect wild cards', () => {
    checkRedirect(
        [
          {path: '404', component: ComponentA},
          {path: '**', redirectTo: '/404'},
        ],
        '/a/1(aux:c/d)', (t: UrlTree) => {
          expectTreeToBe(t, '/404');
        });
  });

  it('should support absolute redirects', () => {
    checkRedirect(
        [
          {
            path: 'a',
            component: ComponentA,
            children: [{path: 'b/:id', redirectTo: '/absolute/:id?a=1&b=:b#f1'}]
          },
          {path: '**', component: ComponentC}
        ],
        '/a/b/1?b=2', (t: UrlTree) => {
          expectTreeToBe(t, '/absolute/1?a=1&b=2#f1');
        });
  });

  describe('lazy loading', () => {
    it('should load config on demand', () => {
      const loadedConfig = new LoadedRouterConfig([{path: 'b', component: ComponentB}], testModule);
      const loader = {
        load: (injector: any, p: any) => {
          if (injector !== testModule.injector) throw 'Invalid Injector';
          return of(loadedConfig);
        }
      };
      const config: Routes = [{path: 'a', component: ComponentA, loadChildren: 'children'}];

      applyRedirects(testModule.injector, <any>loader, serializer, tree('a/b'), config)
          .forEach(r => {
            expectTreeToBe(r, '/a/b');
            expect((config[0] as any)._loadedConfig).toBe(loadedConfig);
          });
    });

    it('should handle the case when the loader errors', () => {
      const loader = {
        load: (p: any) => new Observable<any>((obs: any) => obs.error(new Error('Loading Error')))
      };
      const config = [{path: 'a', component: ComponentA, loadChildren: 'children'}];

      applyRedirects(testModule.injector, <any>loader, serializer, tree('a/b'), config)
          .subscribe(() => {}, (e) => {
            expect(e.message).toEqual('Loading Error');
          });
    });

    it('should load when all canLoad guards return true', () => {
      const loadedConfig = new LoadedRouterConfig([{path: 'b', component: ComponentB}], testModule);
      const loader = {load: (injector: any, p: any) => of(loadedConfig)};

      const guard = () => true;
      const injector = {
        get: (token: any) => token === 'guard1' || token === 'guard2' ? guard : {injector}
      };

      const config = [
        {path: 'a', component: ComponentA, canLoad: ['guard1', 'guard2'], loadChildren: 'children'}
      ];

      applyRedirects(<any>injector, <any>loader, serializer, tree('a/b'), config).forEach(r => {
        expectTreeToBe(r, '/a/b');
      });
    });

    it('should not load when any canLoad guards return false', () => {
      const loadedConfig = new LoadedRouterConfig([{path: 'b', component: ComponentB}], testModule);
      const loader = {load: (injector: any, p: any) => of(loadedConfig)};

      const trueGuard = () => true;
      const falseGuard = () => false;
      const injector = {
        get: (token: any) => {
          switch (token) {
            case 'guard1':
              return trueGuard;
            case 'guard2':
              return falseGuard;
            case NgModuleRef:
              return {injector};
          }
        }
      };

      const config = [
        {path: 'a', component: ComponentA, canLoad: ['guard1', 'guard2'], loadChildren: 'children'}
      ];

      applyRedirects(<any>injector, <any>loader, serializer, tree('a/b'), config)
          .subscribe(
              () => {
                throw 'Should not reach';
              },
              (e) => {
                expect(e.message).toEqual(
                    `NavigationCancelingError: Cannot load children because the guard of the route "path: 'a'" returned false`);
              });
    });

    it('should not load when any canLoad guards is rejected (promises)', () => {
      const loadedConfig = new LoadedRouterConfig([{path: 'b', component: ComponentB}], testModule);
      const loader = {load: (injector: any, p: any) => of(loadedConfig)};

      const trueGuard = () => Promise.resolve(true);
      const falseGuard = () => Promise.reject('someError');
      const injector = {
        get: (token: any) => {
          switch (token) {
            case 'guard1':
              return trueGuard;
            case 'guard2':
              return falseGuard;
            case NgModuleRef:
              return {injector};
          }
        }
      };

      const config = [
        {path: 'a', component: ComponentA, canLoad: ['guard1', 'guard2'], loadChildren: 'children'}
      ];

      applyRedirects(<any>injector, <any>loader, serializer, tree('a/b'), config)
          .subscribe(
              () => {
                throw 'Should not reach';
              },
              (e) => {
                expect(e).toEqual('someError');
              });
    });

    it('should work with objects implementing the CanLoad interface', () => {
      const loadedConfig = new LoadedRouterConfig([{path: 'b', component: ComponentB}], testModule);
      const loader = {load: (injector: any, p: any) => of(loadedConfig)};

      const guard = {canLoad: () => Promise.resolve(true)};
      const injector = {get: (token: any) => token === 'guard' ? guard : {injector}};

      const config =
          [{path: 'a', component: ComponentA, canLoad: ['guard'], loadChildren: 'children'}];

      applyRedirects(<any>injector, <any>loader, serializer, tree('a/b'), config)
          .subscribe(
              (r) => {
                expectTreeToBe(r, '/a/b');
              },
              (e) => {
                throw 'Should not reach';
              });
    });

    it('should pass UrlSegments to functions implementing the canLoad guard interface', () => {
      const loadedConfig = new LoadedRouterConfig([{path: 'b', component: ComponentB}], testModule);
      const loader = {load: (injector: any, p: any) => of(loadedConfig)};

      let passedUrlSegments: UrlSegment[];

      const guard = (route: Route, urlSegments: UrlSegment[]) => {
        passedUrlSegments = urlSegments;
        return true;
      };
      const injector = {get: (token: any) => token === 'guard' ? guard : {injector}};

      const config =
          [{path: 'a', component: ComponentA, canLoad: ['guard'], loadChildren: 'children'}];

      applyRedirects(<any>injector, <any>loader, serializer, tree('a/b'), config)
          .subscribe(
              (r) => {
                expectTreeToBe(r, '/a/b');
                expect(passedUrlSegments.length).toBe(2);
                expect(passedUrlSegments[0].path).toBe('a');
                expect(passedUrlSegments[1].path).toBe('b');
              },
              (e) => {
                throw 'Should not reach';
              });
    });

    it('should pass UrlSegments to objects implementing the canLoad guard interface', () => {
      const loadedConfig = new LoadedRouterConfig([{path: 'b', component: ComponentB}], testModule);
      const loader = {load: (injector: any, p: any) => of(loadedConfig)};

      let passedUrlSegments: UrlSegment[];

      const guard = {
        canLoad: (route: Route, urlSegments: UrlSegment[]) => {
          passedUrlSegments = urlSegments;
          return true;
        }
      };
      const injector = {get: (token: any) => token === 'guard' ? guard : {injector}};

      const config =
          [{path: 'a', component: ComponentA, canLoad: ['guard'], loadChildren: 'children'}];

      applyRedirects(<any>injector, <any>loader, serializer, tree('a/b'), config)
          .subscribe(
              (r) => {
                expectTreeToBe(r, '/a/b');
                expect(passedUrlSegments.length).toBe(2);
                expect(passedUrlSegments[0].path).toBe('a');
                expect(passedUrlSegments[1].path).toBe('b');
              },
              (e) => {
                throw 'Should not reach';
              });
    });

    it('should work with absolute redirects', () => {
      const loadedConfig = new LoadedRouterConfig([{path: '', component: ComponentB}], testModule);

      const loader = {load: (injector: any, p: any) => of(loadedConfig)};

      const config: Routes =
          [{path: '', pathMatch: 'full', redirectTo: '/a'}, {path: 'a', loadChildren: 'children'}];

      applyRedirects(testModule.injector, <any>loader, serializer, tree(''), config).forEach(r => {
        expectTreeToBe(r, 'a');
        expect((config[1] as any)._loadedConfig).toBe(loadedConfig);
      });
    });

    it('should load the configuration only once', () => {
      const loadedConfig = new LoadedRouterConfig([{path: '', component: ComponentB}], testModule);

      let called = false;
      const loader = {
        load: (injector: any, p: any) => {
          if (called) throw new Error('Should not be called twice');
          called = true;
          return of(loadedConfig);
        }
      };

      const config: Routes = [{path: 'a', loadChildren: 'children'}];

      applyRedirects(testModule.injector, <any>loader, serializer, tree('a?k1'), config)
          .subscribe(r => {});

      applyRedirects(testModule.injector, <any>loader, serializer, tree('a?k2'), config)
          .subscribe(
              r => {
                expectTreeToBe(r, 'a?k2');
                expect((config[0] as any)._loadedConfig).toBe(loadedConfig);
              },
              (e) => {
                throw 'Should not reach';
              });
    });

    it('should load the configuration of a wildcard route', () => {
      const loadedConfig = new LoadedRouterConfig([{path: '', component: ComponentB}], testModule);

      const loader = {load: (injector: any, p: any) => of(loadedConfig)};

      const config: Routes = [{path: '**', loadChildren: 'children'}];

      applyRedirects(testModule.injector, <any>loader, serializer, tree('xyz'), config)
          .forEach(r => {
            expect((config[0] as any)._loadedConfig).toBe(loadedConfig);
          });
    });

    it('should not load the configuration of a wildcard route if there is a match', () => {
      const loadedConfig = new LoadedRouterConfig([{path: '', component: ComponentB}], testModule);

      const loader = jasmine.createSpyObj('loader', ['load']);
      loader.load.and.returnValue(of(loadedConfig).pipe(delay(0)));

      const config: Routes = [
        {path: '', loadChildren: 'matchChildren'},
        {path: '**', loadChildren: 'children'},
      ];

      applyRedirects(testModule.injector, <any>loader, serializer, tree(''), config).forEach(r => {
        expect(loader.load.calls.count()).toEqual(1);
        expect(loader.load.calls.first().args).not.toContain(jasmine.objectContaining({
          loadChildren: 'children'
        }));
      });
    });

    it('should load the configuration after a local redirect from a wildcard route', () => {
      const loadedConfig = new LoadedRouterConfig([{path: '', component: ComponentB}], testModule);

      const loader = {load: (injector: any, p: any) => of(loadedConfig)};

      const config: Routes =
          [{path: 'not-found', loadChildren: 'children'}, {path: '**', redirectTo: 'not-found'}];

      applyRedirects(testModule.injector, <any>loader, serializer, tree('xyz'), config)
          .forEach(r => {
            expect((config[0] as any)._loadedConfig).toBe(loadedConfig);
          });
    });

    it('should load the configuration after an absolute redirect from a wildcard route', () => {
      const loadedConfig = new LoadedRouterConfig([{path: '', component: ComponentB}], testModule);

      const loader = {load: (injector: any, p: any) => of(loadedConfig)};

      const config: Routes =
          [{path: 'not-found', loadChildren: 'children'}, {path: '**', redirectTo: '/not-found'}];

      applyRedirects(testModule.injector, <any>loader, serializer, tree('xyz'), config)
          .forEach(r => {
            expect((config[0] as any)._loadedConfig).toBe(loadedConfig);
          });
    });

    it('should load all matching configurations of empty path, including an auxiliary outlets',
       fakeAsync(() => {
         const loadedConfig =
             new LoadedRouterConfig([{path: '', component: ComponentA}], testModule);
         let loadCalls = 0;
         let loaded: string[] = [];
         const loader = {
           load: (injector: any, p: Route) => {
             loadCalls++;
             return of(loadedConfig)
                 .pipe(
                     delay(100 * loadCalls),
                     tap(() => loaded.push(p.loadChildren! as string)),
                 );
           }
         };

         const config: Routes =
             [{path: '', loadChildren: 'root'}, {path: '', loadChildren: 'aux', outlet: 'popup'}];

         applyRedirects(testModule.injector, <any>loader, serializer, tree(''), config).subscribe();
         expect(loadCalls).toBe(1);
         tick(100);
         expect(loaded).toEqual(['root']);
         expect(loadCalls).toBe(2);
         tick(200);
         expect(loaded).toEqual(['root', 'aux']);
       }));

    it('should not try to load any matching configuration if previous load completed',
       fakeAsync(() => {
         const loadedConfig =
             new LoadedRouterConfig([{path: 'a', component: ComponentA}], testModule);
         let loadCalls = 0;
         let loaded: string[] = [];
         const loader = {
           load: (injector: any, p: Route) => {
             loadCalls++;
             return of(loadedConfig)
                 .pipe(
                     delay(100 * loadCalls),
                     tap(() => loaded.push(p.loadChildren! as string)),
                 );
           }
         };

         const config: Routes = [
           {path: '**', loadChildren: 'children'},
         ];

         applyRedirects(testModule.injector, <any>loader, serializer, tree('xyz/a'), config)
             .subscribe();
         expect(loadCalls).toBe(1);
         tick(50);
         expect(loaded).toEqual([]);
         applyRedirects(testModule.injector, <any>loader, serializer, tree('xyz/b'), config)
             .subscribe();
         tick(50);
         expect(loaded).toEqual(['children']);
         expect(loadCalls).toBe(2);
         tick(200);
         applyRedirects(testModule.injector, <any>loader, serializer, tree('xyz/c'), config)
             .subscribe();
         tick(50);
         expect(loadCalls).toBe(2);
         tick(300);
       }));

    it('loads only the first match when two Routes with the same outlet have the same path', () => {
      const loadedConfig = new LoadedRouterConfig([{path: '', component: ComponentA}], testModule);
      let loadCalls = 0;
      let loaded: string[] = [];
      const loader = {
        load: (injector: any, p: Route) => {
          loadCalls++;
          return of(loadedConfig)
              .pipe(
                  tap(() => loaded.push(p.loadChildren! as string)),
              );
        }
      };

      const config: Routes =
          [{path: 'a', loadChildren: 'first'}, {path: 'a', loadChildren: 'second'}];

      applyRedirects(testModule.injector, <any>loader, serializer, tree('a'), config).subscribe();
      expect(loadCalls).toBe(1);
      expect(loaded).toEqual(['first']);
    });

    it('should load the configuration of empty root path if the entry is an aux outlet',
       fakeAsync(() => {
         const loadedConfig =
             new LoadedRouterConfig([{path: '', component: ComponentA}], testModule);
         let loaded: string[] = [];
         const rootDelay = 100;
         const auxDelay = 1;
         const loader = {
           load: (injector: any, p: Route) => {
             const delayMs = p.loadChildren! as string === 'aux' ? auxDelay : rootDelay;
             return of(loadedConfig)
                 .pipe(
                     delay(delayMs),
                     tap(() => loaded.push(p.loadChildren! as string)),
                 );
           }
         };

         const config: Routes = [
           // Define aux route first so it matches before the primary outlet
           {path: 'modal', loadChildren: 'aux', outlet: 'popup'},
           {path: '', loadChildren: 'root'},
         ];

         applyRedirects(testModule.injector, <any>loader, serializer, tree('(popup:modal)'), config)
             .subscribe();
         tick(auxDelay);
         tick(rootDelay);
         expect(loaded.sort()).toEqual(['aux', 'root'].sort());
       }));
  });

  describe('empty paths', () => {
    it('redirect from an empty path should work (local redirect)', () => {
      checkRedirect(
          [
            {
              path: 'a',
              component: ComponentA,
              children: [
                {path: 'b', component: ComponentB},
              ]
            },
            {path: '', redirectTo: 'a'}
          ],
          'b', (t: UrlTree) => {
            expectTreeToBe(t, 'a/b');
          });
    });

    it('redirect from an empty path should work (absolute redirect)', () => {
      checkRedirect(
          [
            {
              path: 'a',
              component: ComponentA,
              children: [
                {path: 'b', component: ComponentB},
              ]
            },
            {path: '', redirectTo: '/a/b'}
          ],
          '', (t: UrlTree) => {
            expectTreeToBe(t, 'a/b');
          });
    });

    it('should redirect empty path route only when terminal', () => {
      const config: Routes = [
        {
          path: 'a',
          component: ComponentA,
          children: [
            {path: 'b', component: ComponentB},
          ]
        },
        {path: '', redirectTo: 'a', pathMatch: 'full'}
      ];

      applyRedirects(testModule.injector, null!, serializer, tree('b'), config)
          .subscribe(
              (_) => {
                throw 'Should not be reached';
              },
              e => {
                expect(e.message).toEqual('Cannot match any routes. URL Segment: \'b\'');
              });
    });

    it('redirect from an empty path should work (nested case)', () => {
      checkRedirect(
          [
            {
              path: 'a',
              component: ComponentA,
              children: [{path: 'b', component: ComponentB}, {path: '', redirectTo: 'b'}]
            },
            {path: '', redirectTo: 'a'}
          ],
          '', (t: UrlTree) => {
            expectTreeToBe(t, 'a/b');
          });
    });

    it('redirect to an empty path should work', () => {
      checkRedirect(
          [
            {path: '', component: ComponentA, children: [{path: 'b', component: ComponentB}]},
            {path: 'a', redirectTo: ''}
          ],
          'a/b', (t: UrlTree) => {
            expectTreeToBe(t, 'b');
          });
    });

    describe('aux split is in the middle', () => {
      it('should create a new url segment (non-terminal)', () => {
        checkRedirect(
            [{
              path: 'a',
              children: [
                {path: 'b', component: ComponentB},
                {path: 'c', component: ComponentC, outlet: 'aux'},
                {path: '', redirectTo: 'c', outlet: 'aux'}
              ]
            }],
            'a/b', (t: UrlTree) => {
              expectTreeToBe(t, 'a/(b//aux:c)');
            });
      });

      it('should create a new url segment (terminal)', () => {
        checkRedirect(
            [{
              path: 'a',
              children: [
                {path: 'b', component: ComponentB},
                {path: 'c', component: ComponentC, outlet: 'aux'},
                {path: '', pathMatch: 'full', redirectTo: 'c', outlet: 'aux'}
              ]
            }],
            'a/b', (t: UrlTree) => {
              expectTreeToBe(t, 'a/b');
            });
      });
    });

    describe('aux split after empty path parent', () => {
      it('should work with non-empty auxiliary path', () => {
        checkRedirect(
            [{
              path: '',
              children: [
                {path: 'a', component: ComponentA},
                {path: 'c', component: ComponentC, outlet: 'aux'},
                {path: 'b', redirectTo: 'c', outlet: 'aux'}
              ]
            }],
            '(aux:b)', (t: UrlTree) => {
              expectTreeToBe(t, '(aux:c)');
            });
      });

      it('should work with empty auxiliary path', () => {
        checkRedirect(
            [{
              path: '',
              children: [
                {path: 'a', component: ComponentA},
                {path: 'c', component: ComponentC, outlet: 'aux'},
                {path: '', redirectTo: 'c', outlet: 'aux'}
              ]
            }],
            '', (t: UrlTree) => {
              expectTreeToBe(t, '(aux:c)');
            });
      });

      it('should work with empty auxiliary path and matching primary', () => {
        checkRedirect(
            [{
              path: '',
              children: [
                {path: 'a', component: ComponentA},
                {path: 'c', component: ComponentC, outlet: 'aux'},
                {path: '', redirectTo: 'c', outlet: 'aux'}
              ]
            }],
            'a', (t: UrlTree) => {
              expect(t.toString()).toEqual('/a(aux:c)');
            });
      });

      it('should work with aux outlets adjacent to and children of empty path at once', () => {
        checkRedirect(
            [
              {
                path: '',
                component: ComponentA,
                children: [{path: 'b', outlet: 'b', component: ComponentB}]
              },
              {path: 'c', outlet: 'c', component: ComponentC}
            ],
            '(b:b//c:c)', (t: UrlTree) => {
              expect(t.toString()).toEqual('/(b:b//c:c)');
            });
      });


      it('should work with children outlets within two levels of empty parents', () => {
        checkRedirect(
            [{
              path: '',
              component: ComponentA,
              children: [{
                path: '',
                component: ComponentB,
                children: [
                  {path: 'd', outlet: 'aux', redirectTo: 'c'},
                  {path: 'c', outlet: 'aux', component: ComponentC}
                ]
              }]
            }],
            '(aux:d)', (t: UrlTree) => {
              expect(t.toString()).toEqual('/(aux:c)');
            });
      });

      it('does not persist a primary segment beyond the boundary of a named outlet match', () => {
        const config: Routes = [
          {
            path: '',
            component: ComponentA,
            outlet: 'aux',
            children: [{path: 'b', component: ComponentB, redirectTo: '/c'}]
          },
          {path: 'c', component: ComponentC}
        ];
        applyRedirects(testModule.injector, null!, serializer, tree('/b'), config)
            .subscribe(
                (_) => {
                  throw 'Should not be reached';
                },
                e => {
                  expect(e.message).toEqual(`Cannot match any routes. URL Segment: 'b'`);
                });
      });
    });

    describe('split at the end (no right child)', () => {
      it('should create a new child (non-terminal)', () => {
        checkRedirect(
            [{
              path: 'a',
              children: [
                {path: 'b', component: ComponentB}, {path: '', redirectTo: 'b'},
                {path: 'c', component: ComponentC, outlet: 'aux'},
                {path: '', redirectTo: 'c', outlet: 'aux'}
              ]
            }],
            'a', (t: UrlTree) => {
              expectTreeToBe(t, 'a/(b//aux:c)');
            });
      });

      it('should create a new child (terminal)', () => {
        checkRedirect(
            [{
              path: 'a',
              children: [
                {path: 'b', component: ComponentB}, {path: '', redirectTo: 'b'},
                {path: 'c', component: ComponentC, outlet: 'aux'},
                {path: '', pathMatch: 'full', redirectTo: 'c', outlet: 'aux'}
              ]
            }],
            'a', (t: UrlTree) => {
              expectTreeToBe(t, 'a/(b//aux:c)');
            });
      });

      it('should work only only primary outlet', () => {
        checkRedirect(
            [{
              path: 'a',
              children: [
                {path: 'b', component: ComponentB}, {path: '', redirectTo: 'b'},
                {path: 'c', component: ComponentC, outlet: 'aux'}
              ]
            }],
            'a/(aux:c)', (t: UrlTree) => {
              expectTreeToBe(t, 'a/(b//aux:c)');
            });
      });
    });

    describe('split at the end (right child)', () => {
      it('should create a new child (non-terminal)', () => {
        checkRedirect(
            [{
              path: 'a',
              children: [
                {path: 'b', component: ComponentB, children: [{path: 'd', component: ComponentB}]},
                {path: '', redirectTo: 'b'}, {
                  path: 'c',
                  component: ComponentC,
                  outlet: 'aux',
                  children: [{path: 'e', component: ComponentC}]
                },
                {path: '', redirectTo: 'c', outlet: 'aux'}
              ]
            }],
            'a/(d//aux:e)', (t: UrlTree) => {
              expectTreeToBe(t, 'a/(b/d//aux:c/e)');
            });
      });

      it('should not create a new child (terminal)', () => {
        const config: Routes = [{
          path: 'a',
          children: [
            {path: 'b', component: ComponentB, children: [{path: 'd', component: ComponentB}]},
            {path: '', redirectTo: 'b'}, {
              path: 'c',
              component: ComponentC,
              outlet: 'aux',
              children: [{path: 'e', component: ComponentC}]
            },
            {path: '', pathMatch: 'full', redirectTo: 'c', outlet: 'aux'}
          ]
        }];

        applyRedirects(testModule.injector, null!, serializer, tree('a/(d//aux:e)'), config)
            .subscribe(
                (_) => {
                  throw 'Should not be reached';
                },
                e => {
                  expect(e.message).toEqual('Cannot match any routes. URL Segment: \'a\'');
                });
      });
    });
  });

  describe('empty URL leftovers', () => {
    it('should not error when no children matching and no url is left', () => {
      checkRedirect(
          [{path: 'a', component: ComponentA, children: [{path: 'b', component: ComponentB}]}],
          '/a', (t: UrlTree) => {
            expectTreeToBe(t, 'a');
          });
    });

    it('should not error when no children matching and no url is left (aux routes)', () => {
      checkRedirect(
          [{
            path: 'a',
            component: ComponentA,
            children: [
              {path: 'b', component: ComponentB},
              {path: '', redirectTo: 'c', outlet: 'aux'},
              {path: 'c', component: ComponentC, outlet: 'aux'},
            ]
          }],
          '/a', (t: UrlTree) => {
            expectTreeToBe(t, 'a/(aux:c)');
          });
    });

    it('should error when no children matching and some url is left', () => {
      applyRedirects(
          testModule.injector, null!, serializer, tree('/a/c'),
          [{path: 'a', component: ComponentA, children: [{path: 'b', component: ComponentB}]}])
          .subscribe(
              (_) => {
                throw 'Should not be reached';
              },
              e => {
                expect(e.message).toEqual('Cannot match any routes. URL Segment: \'a/c\'');
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

      checkRedirect(
          [{
            matcher: matcher,
            component: ComponentA,
            children: [{path: 'b', component: ComponentB}]
          }] as any,
          '/a/1/b', (t: UrlTree) => {
            expectTreeToBe(t, 'a/1/b');
          });
    });
  });

  describe('multiple matches with empty path named outlets', () => {
    it('should work with redirects when other outlet comes before the one being activated', () => {
      applyRedirects(
          testModule.injector, null!, serializer, tree(''),
          [
            {
              path: '',
              children: [
                {path: '', outlet: 'aux', redirectTo: 'b'},
                {path: 'b', component: ComponentA, outlet: 'aux'},
                {path: '', redirectTo: 'b', pathMatch: 'full'},
                {path: 'b', component: ComponentB},
              ],
            },
          ])
          .subscribe(
              (tree: UrlTree) => {
                expect(tree.toString()).toEqual('/b(aux:b)');
                expect(tree.root.children['primary'].toString()).toEqual('b');
                expect(tree.root.children['aux']).toBeDefined();
                expect(tree.root.children['aux'].toString()).toEqual('b');
              },
              () => {
                fail('should not be reached');
              });
    });

    it('should prevent empty named outlets from appearing in leaves, resulting in odd tree url',
       () => {
         applyRedirects(
             testModule.injector, null!, serializer, tree(''),
             [
               {
                 path: '',
                 children: [
                   {path: '', component: ComponentA, outlet: 'aux'},
                   {path: '', redirectTo: 'b', pathMatch: 'full'},
                   {path: 'b', component: ComponentB},
                 ],
               },
             ])
             .subscribe(
                 (tree: UrlTree) => {
                   expect(tree.toString()).toEqual('/b');
                 },
                 () => {
                   fail('should not be reached');
                 });
       });


    it('should work when entry point is named outlet', () => {
      applyRedirects(
          testModule.injector, null!, serializer, tree('(popup:modal)'),
          [
            {path: '', component: ComponentA},
            {path: 'modal', component: ComponentB, outlet: 'popup'},
          ])
          .subscribe(
              (tree: UrlTree) => {
                expect(tree.toString()).toEqual('/(popup:modal)');
              },
              (e) => {
                fail('should not be reached' + e.message);
              });
    });
  });

  describe('redirecting to named outlets', () => {
    it('should work when using absolute redirects', () => {
      checkRedirect(
          [
            {path: 'a/:id', redirectTo: '/b/:id(aux:c/:id)'},
            {path: 'b/:id', component: ComponentB},
            {path: 'c/:id', component: ComponentC, outlet: 'aux'}
          ],
          'a/1;p=99', (t: UrlTree) => {
            expectTreeToBe(t, '/b/1;p=99(aux:c/1;p=99)');
          });
    });

    it('should work when using absolute redirects (wildcard)', () => {
      checkRedirect(
          [
            {path: '**', redirectTo: '/b(aux:c)'}, {path: 'b', component: ComponentB},
            {path: 'c', component: ComponentC, outlet: 'aux'}
          ],
          'a/1', (t: UrlTree) => {
            expectTreeToBe(t, '/b(aux:c)');
          });
    });

    it('should throw when using non-absolute redirects', () => {
      applyRedirects(
          testModule.injector, null!, serializer, tree('a'),
          [
            {path: 'a', redirectTo: 'b(aux:c)'},
          ])
          .subscribe(
              () => {
                throw new Error('should not be reached');
              },
              (e) => {
                expect(e.message).toEqual(
                    'Only absolute redirects can have named outlets. redirectTo: \'b(aux:c)\'');
              });
    });
  });

  // internal failure b/165719418
  it('does not fail with large configs', () => {
    const config: Routes = [];
    for (let i = 0; i < 400; i++) {
      config.push({path: 'no_match', component: ComponentB});
    }
    config.push({path: 'match', component: ComponentA});
    applyRedirects(testModule.injector, null!, serializer, tree('match'), config).forEach(r => {
      expectTreeToBe(r, 'match');
    });
  });
});

function checkRedirect(config: Routes, url: string, callback: any): void {
  applyRedirects(TestBed, null!, new DefaultUrlSerializer(), tree(url), config)
      .subscribe(callback, e => {
        throw e;
      });
}

function tree(url: string): UrlTree {
  return new DefaultUrlSerializer().parse(url);
}

function expectTreeToBe(actual: UrlTree, expectedUrl: string): void {
  const expected = tree(expectedUrl);
  const serializer = new DefaultUrlSerializer();
  const error =
      `"${serializer.serialize(actual)}" is not equal to "${serializer.serialize(expected)}"`;
  compareSegments(actual.root, expected.root, error);
  expect(actual.queryParams).toEqual(expected.queryParams);
  expect(actual.fragment).toEqual(expected.fragment);
}

function compareSegments(actual: UrlSegmentGroup, expected: UrlSegmentGroup, error: string): void {
  expect(actual).toBeDefined(error);
  expect(equalSegments(actual.segments, expected.segments)).toEqual(true, error);

  expect(Object.keys(actual.children).length).toEqual(Object.keys(expected.children).length, error);

  Object.keys(expected.children).forEach(key => {
    compareSegments(actual.children[key], expected.children[key], error);
  });
}

class ComponentA {}
class ComponentB {}
class ComponentC {}
