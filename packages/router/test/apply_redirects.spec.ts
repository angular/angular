/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {EnvironmentInjector, inject, Injectable} from '@angular/core';
import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {Observable, of} from 'rxjs';
import {delay, tap, timeout} from 'rxjs/operators';

import {Route, Routes} from '../src/models';
import {recognize} from '../src/recognize';
import {Router} from '../src/router';
import {RouterConfigLoader} from '../src/router_config_loader';
import {ParamsInheritanceStrategy, RouterStateSnapshot} from '../src/router_state';
import {
  DefaultUrlSerializer,
  equalSegments,
  UrlSegment,
  UrlSegmentGroup,
  UrlTree,
} from '../src/url_tree';
import {getLoadedRoutes, getProvidersInjector} from '../src/utils/config';

describe('redirects', () => {
  const serializer = new DefaultUrlSerializer();

  it('should return the same url tree when no redirects', () => {
    checkRedirect(
      [
        {
          path: 'a',
          component: ComponentA,
          children: [{path: 'b', component: ComponentB}],
        },
      ],
      '/a/b',
      (t: UrlTree) => {
        expectTreeToBe(t, '/a/b');
      },
    );
  });

  it('should add new segments when needed', () => {
    checkRedirect(
      [
        {path: 'a/b', redirectTo: 'a/b/c'},
        {path: '**', component: ComponentC},
      ],
      '/a/b',
      (t: UrlTree) => {
        expectTreeToBe(t, '/a/b/c');
      },
    );
  });

  it('should support redirecting with to an URL with query parameters', () => {
    const config: Routes = [
      {path: 'single_value', redirectTo: '/dst?k=v1'},
      {path: 'multiple_values', redirectTo: '/dst?k=v1&k=v2'},
      {path: '**', component: ComponentA},
    ];

    checkRedirect(config, 'single_value', (t: UrlTree, state: RouterStateSnapshot) => {
      expectTreeToBe(t, '/dst?k=v1');
      expect(state.root.queryParams).toEqual({k: 'v1'});
    });
    checkRedirect(config, 'multiple_values', (t: UrlTree) => expectTreeToBe(t, '/dst?k=v1&k=v2'));
  });

  it('should handle positional parameters', () => {
    checkRedirect(
      [
        {path: 'a/:aid/b/:bid', redirectTo: 'newa/:aid/newb/:bid'},
        {path: '**', component: ComponentC},
      ],
      '/a/1/b/2',
      (t: UrlTree) => {
        expectTreeToBe(t, '/newa/1/newb/2');
      },
    );
  });

  it('should throw when cannot handle a positional parameter', () => {
    recognize(
      TestBed.inject(EnvironmentInjector),
      null!,
      null,
      [{path: 'a/:id', redirectTo: 'a/:other'}],
      tree('/a/1'),
      serializer,
    ).subscribe(
      () => {},
      (e) => {
        expect(e.message).toContain("Cannot redirect to 'a/:other'. Cannot find ':other'.");
      },
    );
  });

  it('should pass matrix parameters', () => {
    checkRedirect(
      [
        {path: 'a/:id', redirectTo: 'd/a/:id/e'},
        {path: '**', component: ComponentC},
      ],
      '/a;p1=1/1;p2=2',
      (t: UrlTree) => {
        expectTreeToBe(t, '/d/a;p1=1/1;p2=2/e');
      },
    );
  });

  it('should handle preserve secondary routes', () => {
    checkRedirect(
      [
        {path: 'a/:id', redirectTo: 'd/a/:id/e'},
        {path: 'c/d', component: ComponentA, outlet: 'aux'},
        {path: '**', component: ComponentC},
      ],
      '/a/1(aux:c/d)',
      (t: UrlTree) => {
        expectTreeToBe(t, '/d/a/1/e(aux:c/d)');
      },
    );
  });

  it('should redirect secondary routes', () => {
    checkRedirect(
      [
        {path: 'a/:id', component: ComponentA},
        {path: 'c/d', redirectTo: 'f/c/d/e', outlet: 'aux'},
        {path: '**', component: ComponentC, outlet: 'aux'},
      ],
      '/a/1(aux:c/d)',
      (t: UrlTree) => {
        expectTreeToBe(t, '/a/1(aux:f/c/d/e)');
      },
    );
  });

  it('should use the configuration of the route redirected to', () => {
    checkRedirect(
      [
        {
          path: 'a',
          component: ComponentA,
          children: [{path: 'b', component: ComponentB}],
        },
        {path: 'c', redirectTo: 'a'},
      ],
      'c/b',
      (t: UrlTree) => {
        expectTreeToBe(t, 'a/b');
      },
    );
  });

  it('should support redirects with both main and aux', () => {
    checkRedirect(
      [
        {
          path: 'a',
          children: [
            {path: 'bb', component: ComponentB},
            {path: 'b', redirectTo: 'bb'},
            {path: 'cc', component: ComponentC, outlet: 'aux'},
            {path: 'b', redirectTo: 'cc', outlet: 'aux'},
          ],
        },
      ],
      'a/(b//aux:b)',
      (t: UrlTree) => {
        expectTreeToBe(t, 'a/(bb//aux:cc)');
      },
    );
  });

  it('should support redirects with both main and aux (with a nested redirect)', () => {
    checkRedirect(
      [
        {
          path: 'a',
          children: [
            {path: 'bb', component: ComponentB},
            {path: 'b', redirectTo: 'bb'},
            {
              path: 'cc',
              component: ComponentC,
              outlet: 'aux',
              children: [
                {path: 'dd', component: ComponentC},
                {path: 'd', redirectTo: 'dd'},
              ],
            },
            {path: 'b', redirectTo: 'cc/d', outlet: 'aux'},
          ],
        },
      ],
      'a/(b//aux:b)',
      (t: UrlTree) => {
        expectTreeToBe(t, 'a/(bb//aux:cc/dd)');
      },
    );
  });

  it('should redirect wild cards', () => {
    checkRedirect(
      [
        {path: '404', component: ComponentA},
        {path: '**', redirectTo: '/404'},
      ],
      '/a/1(aux:c/d)',
      (t: UrlTree) => {
        expectTreeToBe(t, '/404');
      },
    );
  });

  it('should throw an error on infinite absolute redirect', () => {
    recognize(
      TestBed.inject(EnvironmentInjector),
      TestBed.inject(RouterConfigLoader),
      null,
      [{path: '**', redirectTo: '/404'}],
      tree('/'),
      new DefaultUrlSerializer(),
    ).subscribe({
      next: () => fail('expected infinite redirect error'),
      error: (e) => {
        expect((e as Error).message).toMatch(/infinite redirect/);
      },
    });
  });

  it('should support absolute redirects', () => {
    checkRedirect(
      [
        {
          path: 'a',
          component: ComponentA,
          children: [{path: 'b/:id', redirectTo: '/absolute/:id?a=1&b=:b#f1'}],
        },
        {path: '**', component: ComponentC},
      ],
      '/a/b/1?b=2',
      (t: UrlTree) => {
        expectTreeToBe(t, '/absolute/1?a=1&b=2#f1');
      },
    );
  });

  it('should not create injector for Route if the route does not match', () => {
    const routes = [
      {path: '', pathMatch: 'full' as const, providers: []},
      {
        path: 'a',
        component: ComponentA,
        children: [{path: 'b', component: ComponentB}],
      },
    ];
    checkRedirect(routes, '/a/b', (t: UrlTree) => {
      expectTreeToBe(t, '/a/b');
      expect(getProvidersInjector(routes[0])).not.toBeDefined();
    });
  });

  it('should create injectors for partial Route route matches', () => {
    const routes = [
      {
        path: 'a',
        component: ComponentA,
        providers: [],
      },
      {path: 'doesNotMatch', providers: []},
    ];
    recognize(
      TestBed.inject(EnvironmentInjector),
      null!,
      null,
      routes,
      tree('a/b/c'),
      serializer,
    ).subscribe({
      next: () => {
        throw 'Should not be reached';
      },
      error: () => {
        // The 'a' segment matched, so we needed to create the injector for the `Route`
        expect(getProvidersInjector(routes[0])).toBeDefined();
        // The second `Route` did not match at all so we should not create an injector for it
        expect(getProvidersInjector(routes[1])).not.toBeDefined();
      },
    });
  });

  it('should support CanMatch providers on the route', () => {
    @Injectable({providedIn: 'root'})
    class CanMatchGuard {
      canMatch() {
        return true;
      }
    }

    const routes = [
      {
        path: 'a',
        component: ComponentA,
        canMatch: [CanMatchGuard],
        providers: [CanMatchGuard],
      },
      {
        path: 'a',
        component: ComponentA,
        providers: [],
      },
    ];
    recognize(
      TestBed.inject(EnvironmentInjector),
      null!,
      null,
      routes,
      tree('a'),
      serializer,
    ).subscribe({
      next: () => {
        // The 'a' segment matched, so we needed to create the injector for the `Route`
        expect(getProvidersInjector(routes[0])).toBeDefined();
        // The second `Route` did not match because the first did so we should not create an
        // injector for it
        expect(getProvidersInjector(routes[1])).not.toBeDefined();
      },
      error: () => {
        throw 'Should not be reached';
      },
    });
  });

  describe('lazy loading', () => {
    it('should load config on demand', () => {
      const loadedConfig = {
        routes: [{path: 'b', component: ComponentB}],
        injector: TestBed.inject(EnvironmentInjector),
      };
      const loader: Pick<RouterConfigLoader, 'loadChildren'> = {
        loadChildren: (injector: any, p: any) => {
          if (injector !== TestBed.inject(EnvironmentInjector)) throw 'Invalid Injector';
          return of(loadedConfig);
        },
      };
      const config: Routes = [
        {path: 'a', component: ComponentA, loadChildren: jasmine.createSpy('children')},
      ];

      recognize(
        TestBed.inject(EnvironmentInjector),
        <any>loader,
        null,
        config,
        tree('a/b'),
        serializer,
      ).forEach(({tree}) => {
        expectTreeToBe(tree, '/a/b');
        expect(getLoadedRoutes(config[0])).toBe(loadedConfig.routes);
      });
    });

    it('should handle the case when the loader errors', () => {
      const loader: Pick<RouterConfigLoader, 'loadChildren'> = {
        loadChildren: (p: any) => new Observable((obs) => obs.error(new Error('Loading Error'))),
      };
      const config = [
        {path: 'a', component: ComponentA, loadChildren: jasmine.createSpy('children')},
      ];

      recognize(
        TestBed.inject(EnvironmentInjector),
        <any>loader,
        null,
        config,
        tree('a/b'),
        serializer,
      ).subscribe(
        () => {},
        (e) => {
          expect(e.message).toEqual('Loading Error');
        },
      );
    });

    it('should load when all canLoad guards return true', () => {
      const loadedConfig = {
        routes: [{path: 'b', component: ComponentB}],
        injector: TestBed.inject(EnvironmentInjector),
      };
      const loader: Pick<RouterConfigLoader, 'loadChildren'> = {
        loadChildren: (injector: any, p: any) => of(loadedConfig),
      };

      const config = [
        {
          path: 'a',
          component: ComponentA,
          canLoad: [() => true, () => true],
          loadChildren: jasmine.createSpy('children'),
        },
      ];

      recognize(
        TestBed.inject(EnvironmentInjector),
        <any>loader,
        null,
        config,
        tree('a/b'),
        serializer,
      ).forEach(({tree: r}) => {
        expectTreeToBe(r, '/a/b');
      });
    });

    it('should not load when any canLoad guards return false', () => {
      const loadedConfig = {
        routes: [{path: 'b', component: ComponentB}],
        injector: TestBed.inject(EnvironmentInjector),
      };
      const loader: Pick<RouterConfigLoader, 'loadChildren'> = {
        loadChildren: (injector: any, p: any) => of(loadedConfig),
      };

      const config = [
        {
          path: 'a',
          component: ComponentA,
          canLoad: [() => true, () => false],
          loadChildren: jasmine.createSpy('children'),
        },
      ];

      recognize(
        TestBed.inject(EnvironmentInjector),
        <any>loader,
        null,
        config,
        tree('a/b'),
        serializer,
      ).subscribe(
        () => {
          throw 'Should not reach';
        },
        (e) => {
          expect(e.message).toEqual(
            `NavigationCancelingError: Cannot load children because the guard of the route "path: 'a'" returned false`,
          );
        },
      );
    });

    it('should not load when any canLoad guards is rejected (promises)', () => {
      const loadedConfig = {
        routes: [{path: 'b', component: ComponentB}],
        injector: TestBed.inject(EnvironmentInjector),
      };
      const loader: Pick<RouterConfigLoader, 'loadChildren'> = {
        loadChildren: (injector: any, p: any) => of(loadedConfig),
      };

      const config = [
        {
          path: 'a',
          component: ComponentA,
          canLoad: [() => Promise.resolve(true), () => Promise.reject('someError')],
          loadChildren: jasmine.createSpy('children'),
        },
      ];

      recognize(
        TestBed.inject(EnvironmentInjector),
        <any>loader,
        null,
        config,
        tree('a/b'),
        serializer,
      ).subscribe(
        () => {
          throw 'Should not reach';
        },
        (e) => {
          expect(e).toEqual('someError');
        },
      );
    });

    it('should work with objects implementing the CanLoad interface', () => {
      const loadedConfig = {
        routes: [{path: 'b', component: ComponentB}],
        injector: TestBed.inject(EnvironmentInjector),
      };
      const loader: Pick<RouterConfigLoader, 'loadChildren'> = {
        loadChildren: (injector: any, p: any) => of(loadedConfig),
      };

      const config = [
        {
          path: 'a',
          component: ComponentA,
          canLoad: [() => Promise.resolve(true)],
          loadChildren: jasmine.createSpy('children'),
        },
      ];

      recognize(
        TestBed.inject(EnvironmentInjector),
        <any>loader,
        null,
        config,
        tree('a/b'),
        serializer,
      ).subscribe(
        ({tree: r}) => {
          expectTreeToBe(r, '/a/b');
        },
        (e) => {
          throw 'Should not reach';
        },
      );
    });

    it('should pass UrlSegments to functions implementing the canLoad guard interface', () => {
      const loadedConfig = {
        routes: [{path: 'b', component: ComponentB}],
        injector: TestBed.inject(EnvironmentInjector),
      };
      const loader: Pick<RouterConfigLoader, 'loadChildren'> = {
        loadChildren: (injector: any, p: any) => of(loadedConfig),
      };

      let passedUrlSegments: UrlSegment[];

      const guard = (route: Route, urlSegments: UrlSegment[]) => {
        passedUrlSegments = urlSegments;
        return true;
      };

      const config = [
        {
          path: 'a',
          component: ComponentA,
          canLoad: [guard],
          loadChildren: jasmine.createSpy('children'),
        },
      ];

      recognize(
        TestBed.inject(EnvironmentInjector),
        <any>loader,
        null,
        config,
        tree('a/b'),
        serializer,
      ).subscribe(
        ({tree: r}) => {
          expectTreeToBe(r, '/a/b');
          expect(passedUrlSegments.length).toBe(2);
          expect(passedUrlSegments[0].path).toBe('a');
          expect(passedUrlSegments[1].path).toBe('b');
        },
        (e) => {
          throw 'Should not reach';
        },
      );
    });

    it('should pass UrlSegments to objects implementing the canLoad guard interface', () => {
      const loadedConfig = {
        routes: [{path: 'b', component: ComponentB}],
        injector: TestBed.inject(EnvironmentInjector),
      };
      const loader: Pick<RouterConfigLoader, 'loadChildren'> = {
        loadChildren: (injector: any, p: any) => of(loadedConfig),
      };

      let passedUrlSegments: UrlSegment[];

      const config = [
        {
          path: 'a',
          component: ComponentA,
          canLoad: [
            (route: Route, urlSegments: UrlSegment[]) => {
              passedUrlSegments = urlSegments;
              return true;
            },
          ],
          loadChildren: jasmine.createSpy('children'),
        },
      ];

      recognize(
        TestBed.inject(EnvironmentInjector),
        <any>loader,
        null,
        config,
        tree('a/b'),
        serializer,
      ).subscribe(
        ({tree: r}) => {
          expectTreeToBe(r, '/a/b');
          expect(passedUrlSegments.length).toBe(2);
          expect(passedUrlSegments[0].path).toBe('a');
          expect(passedUrlSegments[1].path).toBe('b');
        },
        (e) => {
          throw 'Should not reach';
        },
      );
    });

    it('should work with absolute redirects', () => {
      const loadedConfig = {
        routes: [{path: '', component: ComponentB}],
        injector: TestBed.inject(EnvironmentInjector),
      };

      const loader: Pick<RouterConfigLoader, 'loadChildren'> = {
        loadChildren: (injector: any, p: any) => of(loadedConfig),
      };

      const config: Routes = [
        {path: '', pathMatch: 'full', redirectTo: '/a'},
        {path: 'a', loadChildren: jasmine.createSpy('children')},
      ];

      recognize(
        TestBed.inject(EnvironmentInjector),
        <any>loader,
        null,
        config,
        tree(''),
        serializer,
      ).forEach(({tree: r}) => {
        expectTreeToBe(r, 'a');
        expect(getLoadedRoutes(config[1])).toBe(loadedConfig.routes);
      });
    });

    it('should load the configuration only once', () => {
      const loadedConfig = {
        routes: [{path: '', component: ComponentB}],
        injector: TestBed.inject(EnvironmentInjector),
      };

      let called = false;
      const loader: Pick<RouterConfigLoader, 'loadChildren'> = {
        loadChildren: (injector: any, p: any) => {
          if (called) throw new Error('Should not be called twice');
          called = true;
          return of(loadedConfig);
        },
      };

      const config: Routes = [{path: 'a', loadChildren: jasmine.createSpy('children')}];

      recognize(
        TestBed.inject(EnvironmentInjector),
        <any>loader,
        null,
        config,
        tree('a?k1'),
        serializer,
      ).subscribe((r) => {});

      recognize(
        TestBed.inject(EnvironmentInjector),
        <any>loader,
        null,
        config,
        tree('a?k2'),
        serializer,
      ).subscribe(
        ({tree: r}) => {
          expectTreeToBe(r, 'a?k2');
          expect(getLoadedRoutes(config[0])).toBe(loadedConfig.routes);
        },
        (e) => {
          throw 'Should not reach';
        },
      );
    });

    it('should load the configuration of a wildcard route', () => {
      const loadedConfig = {
        routes: [{path: '', component: ComponentB}],
        injector: TestBed.inject(EnvironmentInjector),
      };

      const loader: Pick<RouterConfigLoader, 'loadChildren'> = {
        loadChildren: (injector: any, p: any) => of(loadedConfig),
      };

      const config: Routes = [{path: '**', loadChildren: jasmine.createSpy('children')}];

      recognize(
        TestBed.inject(EnvironmentInjector),
        <any>loader,
        null,
        config,
        tree('xyz'),
        serializer,
      ).forEach(({tree: r}) => {
        expect(getLoadedRoutes(config[0])).toBe(loadedConfig.routes);
      });
    });

    it('should not load the configuration of a wildcard route if there is a match', async () => {
      const loadedConfig = {
        routes: [{path: '', component: ComponentB}],
        injector: TestBed.inject(EnvironmentInjector),
      };

      const loader: jasmine.SpyObj<Pick<RouterConfigLoader, 'loadChildren'>> = jasmine.createSpyObj(
        'loader',
        ['loadChildren'],
      );
      loader.loadChildren.and.returnValue(of(loadedConfig).pipe(delay(0)));

      const config: Routes = [
        {path: '', loadChildren: jasmine.createSpy('matchChildren')},
        {path: '**', loadChildren: jasmine.createSpy('children')},
      ];

      await new Promise<void>((resolve) => {
        recognize(
          TestBed.inject(EnvironmentInjector),
          <any>loader,
          null,
          config,
          tree(''),
          serializer,
        ).forEach(({tree: r}) => {
          expect(loader.loadChildren.calls.count()).toEqual(1);
          expect(loader.loadChildren.calls.first().args).not.toContain(
            jasmine.objectContaining({
              loadChildren: jasmine.createSpy('children'),
            }),
          );
          resolve();
        });
      });
    });

    it('should load the configuration after a local redirect from a wildcard route', () => {
      const loadedConfig = {
        routes: [{path: '', component: ComponentB}],
        injector: TestBed.inject(EnvironmentInjector),
      };

      const loader: Pick<RouterConfigLoader, 'loadChildren'> = {
        loadChildren: (injector: any, p: any) => of(loadedConfig),
      };

      const config: Routes = [
        {path: 'not-found', loadChildren: jasmine.createSpy('children')},
        {path: '**', redirectTo: 'not-found'},
      ];

      recognize(
        TestBed.inject(EnvironmentInjector),
        <any>loader,
        null,
        config,
        tree('xyz'),
        serializer,
      ).forEach(({tree: r}) => {
        expect(getLoadedRoutes(config[0])).toBe(loadedConfig.routes);
      });
    });

    it('should load the configuration after an absolute redirect from a wildcard route', () => {
      const loadedConfig = {
        routes: [{path: '', component: ComponentB}],
        injector: TestBed.inject(EnvironmentInjector),
      };

      const loader: Pick<RouterConfigLoader, 'loadChildren'> = {
        loadChildren: (injector: any, p: any) => of(loadedConfig),
      };

      const config: Routes = [
        {path: 'not-found', loadChildren: jasmine.createSpy('children')},
        {path: '**', redirectTo: '/not-found'},
      ];

      recognize(
        TestBed.inject(EnvironmentInjector),
        <any>loader,
        null,
        config,
        tree('xyz'),
        serializer,
      ).forEach(({tree: r}) => {
        expect(getLoadedRoutes(config[0])).toBe(loadedConfig.routes);
      });
    });

    it('should load all matching configurations of empty path, including an auxiliary outlets', () =>
      fakeAsync(() => {
        const loadedConfig = {
          routes: [{path: '', component: ComponentA}],
          injector: TestBed.inject(EnvironmentInjector),
        };
        let loadCalls = 0;
        let loaded: string[] = [];
        const loader: Pick<RouterConfigLoader, 'loadChildren'> = {
          loadChildren: (injector: any, p: Route) => {
            loadCalls++;
            return of(loadedConfig).pipe(
              delay(100 * loadCalls),
              tap(() => loaded.push((p.loadChildren as jasmine.Spy).and.identity)),
            );
          },
        };

        const config: Routes = [
          {path: '', loadChildren: jasmine.createSpy('root')},
          {path: '', loadChildren: jasmine.createSpy('aux'), outlet: 'popup'},
        ];

        recognize(
          TestBed.inject(EnvironmentInjector),
          <any>loader,
          null,
          config,
          tree(''),
          serializer,
        ).subscribe();
        expect(loadCalls).toBe(1);
        tick(100);
        expect(loaded).toEqual(['root']);
        expect(loadCalls).toBe(2);
        tick(200);
        expect(loaded).toEqual(['root', 'aux']);
      }));

    it('should not try to load any matching configuration if previous load completed', () =>
      fakeAsync(() => {
        const loadedConfig = {
          routes: [{path: 'a', component: ComponentA}],
          injector: TestBed.inject(EnvironmentInjector),
        };
        let loadCalls = 0;
        let loaded: string[] = [];
        const loader: Pick<RouterConfigLoader, 'loadChildren'> = {
          loadChildren: (injector: any, p: Route) => {
            loadCalls++;
            return of(loadedConfig).pipe(
              delay(100 * loadCalls),
              tap(() => loaded.push((p.loadChildren as jasmine.Spy).and.identity)),
            );
          },
        };

        const config: Routes = [{path: '**', loadChildren: jasmine.createSpy('children')}];

        recognize(
          TestBed.inject(EnvironmentInjector),
          <any>loader,
          null,
          config,
          tree('xyz/a'),
          serializer,
        ).subscribe();
        expect(loadCalls).toBe(1);
        tick(50);
        expect(loaded).toEqual([]);
        recognize(
          TestBed.inject(EnvironmentInjector),
          <any>loader,
          null,
          config,
          tree('xyz/b'),
          serializer,
        ).subscribe();
        tick(50);
        expect(loaded).toEqual(['children']);
        expect(loadCalls).toBe(2);
        tick(200);
        recognize(
          TestBed.inject(EnvironmentInjector),
          <any>loader,
          null,
          config,
          tree('xyz/c'),
          serializer,
        ).subscribe();
        tick(50);
        expect(loadCalls).toBe(2);
        tick(300);
      }));

    it('loads only the first match when two Routes with the same outlet have the same path', () => {
      const loadedConfig = {
        routes: [{path: '', component: ComponentA}],
        injector: TestBed.inject(EnvironmentInjector),
      };
      let loadCalls = 0;
      let loaded: string[] = [];
      const loader: Pick<RouterConfigLoader, 'loadChildren'> = {
        loadChildren: (injector: any, p: Route) => {
          loadCalls++;
          return of(loadedConfig).pipe(
            tap(() => loaded.push((p.loadChildren as jasmine.Spy).and.identity)),
          );
        },
      };

      const config: Routes = [
        {path: 'a', loadChildren: jasmine.createSpy('first')},
        {path: 'a', loadChildren: jasmine.createSpy('second')},
      ];

      recognize(
        TestBed.inject(EnvironmentInjector),
        <any>loader,
        null,
        config,
        tree('a'),
        serializer,
      ).subscribe();
      expect(loadCalls).toBe(1);
      expect(loaded).toEqual(['first']);
    });

    it('should load the configuration of empty root path if the entry is an aux outlet', () =>
      fakeAsync(() => {
        const loadedConfig = {
          routes: [{path: '', component: ComponentA}],
          injector: TestBed.inject(EnvironmentInjector),
        };
        let loaded: string[] = [];
        const rootDelay = 100;
        const auxDelay = 1;
        const loader: Pick<RouterConfigLoader, 'loadChildren'> = {
          loadChildren: (injector: any, p: Route) => {
            const delayMs =
              (p.loadChildren! as jasmine.Spy).and.identity === 'aux' ? auxDelay : rootDelay;
            return of(loadedConfig).pipe(
              delay(delayMs),
              tap(() => loaded.push((p.loadChildren as jasmine.Spy).and.identity)),
            );
          },
        };

        const config: Routes = [
          // Define aux route first so it matches before the primary outlet
          {path: 'modal', loadChildren: jasmine.createSpy('aux'), outlet: 'popup'},
          {path: '', loadChildren: jasmine.createSpy('root')},
        ];

        recognize(
          TestBed.inject(EnvironmentInjector),
          <any>loader,
          null,
          config,
          tree('(popup:modal)'),
          serializer,
        ).subscribe();
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
            children: [{path: 'b', component: ComponentB}],
          },
          {path: '', redirectTo: 'a'},
        ],
        'b',
        (t: UrlTree) => {
          expectTreeToBe(t, 'a/b');
        },
      );
    });

    it('redirect from an empty path should work (absolute redirect)', () => {
      checkRedirect(
        [
          {
            path: 'a',
            component: ComponentA,
            children: [{path: 'b', component: ComponentB}],
          },
          {path: '', redirectTo: '/a/b'},
        ],
        '',
        (t: UrlTree) => {
          expectTreeToBe(t, 'a/b');
        },
      );
    });

    it('should redirect empty path route only when terminal', () => {
      const config: Routes = [
        {
          path: 'a',
          component: ComponentA,
          children: [{path: 'b', component: ComponentB}],
        },
        {path: '', redirectTo: 'a', pathMatch: 'full'},
      ];

      recognize(
        TestBed.inject(EnvironmentInjector),
        null!,
        null,
        config,
        tree('b'),
        serializer,
      ).subscribe(
        (_) => {
          throw 'Should not be reached';
        },
        (e) => {
          expect(e.message).toContain("Cannot match any routes. URL Segment: 'b'");
        },
      );
    });

    it('redirect from an empty path should work (nested case)', () => {
      checkRedirect(
        [
          {
            path: 'a',
            component: ComponentA,
            children: [
              {path: 'b', component: ComponentB},
              {path: '', redirectTo: 'b'},
            ],
          },
          {path: '', redirectTo: 'a'},
        ],
        '',
        (t: UrlTree) => {
          expectTreeToBe(t, 'a/b');
        },
      );
    });

    it('redirect to an empty path should work', () => {
      checkRedirect(
        [
          {path: '', component: ComponentA, children: [{path: 'b', component: ComponentB}]},
          {path: 'a', redirectTo: ''},
        ],
        'a/b',
        (t: UrlTree) => {
          expectTreeToBe(t, 'b');
        },
      );
    });

    describe('aux split is in the middle', () => {
      it('should create a new url segment (non-terminal)', () => {
        checkRedirect(
          [
            {
              path: 'a',
              children: [
                {path: 'b', component: ComponentB},
                {path: 'c', component: ComponentC, outlet: 'aux'},
                {path: '', redirectTo: 'c', outlet: 'aux'},
              ],
            },
          ],
          'a/b',
          (t: UrlTree) => {
            expectTreeToBe(t, 'a/(b//aux:c)');
          },
        );
      });

      it('should create a new url segment (terminal)', () => {
        checkRedirect(
          [
            {
              path: 'a',
              children: [
                {path: 'b', component: ComponentB},
                {path: 'c', component: ComponentC, outlet: 'aux'},
                {path: '', pathMatch: 'full', redirectTo: 'c', outlet: 'aux'},
              ],
            },
          ],
          'a/b',
          (t: UrlTree) => {
            expectTreeToBe(t, 'a/b');
          },
        );
      });
    });

    describe('aux split after empty path parent', () => {
      it('should work with non-empty auxiliary path', () => {
        checkRedirect(
          [
            {
              path: '',
              children: [
                {path: 'a', component: ComponentA},
                {path: 'c', component: ComponentC, outlet: 'aux'},
                {path: 'b', redirectTo: 'c', outlet: 'aux'},
              ],
            },
          ],
          '(aux:b)',
          (t: UrlTree) => {
            expectTreeToBe(t, '(aux:c)');
          },
        );
      });

      it('should work with empty auxiliary path', () => {
        checkRedirect(
          [
            {
              path: '',
              children: [
                {path: 'a', component: ComponentA},
                {path: 'c', component: ComponentC, outlet: 'aux'},
                {path: '', redirectTo: 'c', outlet: 'aux'},
              ],
            },
          ],
          '',
          (t: UrlTree) => {
            expectTreeToBe(t, '(aux:c)');
          },
        );
      });

      it('should work with empty auxiliary path and matching primary', () => {
        checkRedirect(
          [
            {
              path: '',
              children: [
                {path: 'a', component: ComponentA},
                {path: 'c', component: ComponentC, outlet: 'aux'},
                {path: '', redirectTo: 'c', outlet: 'aux'},
              ],
            },
          ],
          'a',
          (t: UrlTree) => {
            expect(t.toString()).toEqual('/a(aux:c)');
          },
        );
      });

      it('should work with aux outlets adjacent to and children of empty path at once', () => {
        checkRedirect(
          [
            {
              path: '',
              component: ComponentA,
              children: [{path: 'b', outlet: 'b', component: ComponentB}],
            },
            {path: 'c', outlet: 'c', component: ComponentC},
          ],
          '(b:b//c:c)',
          (t: UrlTree) => {
            expect(t.toString()).toEqual('/(b:b//c:c)');
          },
        );
      });

      it('should work with children outlets within two levels of empty parents', () => {
        checkRedirect(
          [
            {
              path: '',
              component: ComponentA,
              children: [
                {
                  path: '',
                  component: ComponentB,
                  children: [
                    {path: 'd', outlet: 'aux', redirectTo: 'c'},
                    {path: 'c', outlet: 'aux', component: ComponentC},
                  ],
                },
              ],
            },
          ],
          '(aux:d)',
          (t: UrlTree) => {
            expect(t.toString()).toEqual('/(aux:c)');
          },
        );
      });

      it('does not persist a primary segment beyond the boundary of a named outlet match', () => {
        const config: Routes = [
          {
            path: '',
            component: ComponentA,
            outlet: 'aux',
            children: [{path: 'b', component: ComponentB, redirectTo: '/c'}],
          },
          {path: 'c', component: ComponentC},
        ];
        recognize(
          TestBed.inject(EnvironmentInjector),
          null!,
          null,
          config,
          tree('/b'),
          serializer,
        ).subscribe(
          (_) => {
            throw 'Should not be reached';
          },
          (e) => {
            expect(e.message).toContain(`Cannot match any routes. URL Segment: 'b'`);
          },
        );
      });
    });

    describe('split at the end (no right child)', () => {
      it('should create a new child (non-terminal)', () => {
        checkRedirect(
          [
            {
              path: 'a',
              children: [
                {path: 'b', component: ComponentB},
                {path: '', redirectTo: 'b'},
                {path: 'c', component: ComponentC, outlet: 'aux'},
                {path: '', redirectTo: 'c', outlet: 'aux'},
              ],
            },
          ],
          'a',
          (t: UrlTree) => {
            expectTreeToBe(t, 'a/(b//aux:c)');
          },
        );
      });

      it('should create a new child (terminal)', () => {
        checkRedirect(
          [
            {
              path: 'a',
              children: [
                {path: 'b', component: ComponentB},
                {path: '', redirectTo: 'b'},
                {path: 'c', component: ComponentC, outlet: 'aux'},
                {path: '', pathMatch: 'full', redirectTo: 'c', outlet: 'aux'},
              ],
            },
          ],
          'a',
          (t: UrlTree) => {
            expectTreeToBe(t, 'a/(b//aux:c)');
          },
        );
      });

      it('should work only only primary outlet', () => {
        checkRedirect(
          [
            {
              path: 'a',
              children: [
                {path: 'b', component: ComponentB},
                {path: '', redirectTo: 'b'},
                {path: 'c', component: ComponentC, outlet: 'aux'},
              ],
            },
          ],
          'a/(aux:c)',
          (t: UrlTree) => {
            expectTreeToBe(t, 'a/(b//aux:c)');
          },
        );
      });
    });

    describe('split at the end (right child)', () => {
      it('should create a new child (non-terminal)', () => {
        checkRedirect(
          [
            {
              path: 'a',
              children: [
                {path: 'b', component: ComponentB, children: [{path: 'd', component: ComponentB}]},
                {path: '', redirectTo: 'b'},
                {
                  path: 'c',
                  component: ComponentC,
                  outlet: 'aux',
                  children: [{path: 'e', component: ComponentC}],
                },
                {path: '', redirectTo: 'c', outlet: 'aux'},
              ],
            },
          ],
          'a/(d//aux:e)',
          (t: UrlTree) => {
            expectTreeToBe(t, 'a/(b/d//aux:c/e)');
          },
        );
      });

      it('should not create a new child (terminal)', () => {
        const config: Routes = [
          {
            path: 'a',
            children: [
              {path: 'b', component: ComponentB, children: [{path: 'd', component: ComponentB}]},
              {path: '', redirectTo: 'b'},
              {
                path: 'c',
                component: ComponentC,
                outlet: 'aux',
                children: [{path: 'e', component: ComponentC}],
              },
              {path: '', pathMatch: 'full', redirectTo: 'c', outlet: 'aux'},
            ],
          },
        ];

        recognize(
          TestBed.inject(EnvironmentInjector),
          null!,
          null,
          config,
          tree('a/(d//aux:e)'),
          serializer,
        ).subscribe(
          (_) => {
            throw 'Should not be reached';
          },
          (e) => {
            expect(e.message).toContain("Cannot match any routes. URL Segment: 'a'");
          },
        );
      });
    });
  });

  describe('empty URL leftovers', () => {
    it('should not error when no children matching and no url is left', () => {
      checkRedirect(
        [{path: 'a', component: ComponentA, children: [{path: 'b', component: ComponentB}]}],
        '/a',
        (t: UrlTree) => {
          expectTreeToBe(t, 'a');
        },
      );
    });

    it('should not error when no children matching and no url is left (aux routes)', () => {
      checkRedirect(
        [
          {
            path: 'a',
            component: ComponentA,
            children: [
              {path: 'b', component: ComponentB},
              {path: '', redirectTo: 'c', outlet: 'aux'},
              {path: 'c', component: ComponentC, outlet: 'aux'},
            ],
          },
        ],
        '/a',
        (t: UrlTree) => {
          expectTreeToBe(t, 'a/(aux:c)');
        },
      );
    });

    it('should error when no children matching and some url is left', () => {
      recognize(
        TestBed.inject(EnvironmentInjector),
        null!,
        null,
        [{path: 'a', component: ComponentA, children: [{path: 'b', component: ComponentB}]}],
        tree('/a/c'),
        serializer,
      ).subscribe(
        (_) => {
          throw 'Should not be reached';
        },
        (e) => {
          expect(e.message).toContain("Cannot match any routes. URL Segment: 'a/c'");
        },
      );
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
        [
          {
            matcher: matcher,
            component: ComponentA,
            children: [{path: 'b', component: ComponentB}],
          },
        ],
        '/a/1/b',
        (t: UrlTree) => {
          expectTreeToBe(t, 'a/1/b');
        },
      );
    });
  });

  describe('multiple matches with empty path named outlets', () => {
    it('should work with redirects when other outlet comes before the one being activated', () => {
      recognize(
        TestBed.inject(EnvironmentInjector),
        null!,
        null,
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
        ],
        tree(''),
        serializer,
      ).subscribe(
        ({tree}) => {
          expect(tree.toString()).toEqual('/b(aux:b)');
          expect(tree.root.children['primary'].toString()).toEqual('b');
          expect(tree.root.children['aux']).toBeDefined();
          expect(tree.root.children['aux'].toString()).toEqual('b');
        },
        () => {
          fail('should not be reached');
        },
      );
    });

    it('should prevent empty named outlets from appearing in leaves, resulting in odd tree url', () => {
      recognize(
        TestBed.inject(EnvironmentInjector),
        null!,
        null,
        [
          {
            path: '',
            children: [
              {path: '', component: ComponentA, outlet: 'aux'},
              {path: '', redirectTo: 'b', pathMatch: 'full'},
              {path: 'b', component: ComponentB},
            ],
          },
        ],
        tree(''),
        serializer,
      ).subscribe(
        ({tree}) => {
          expect(tree.toString()).toEqual('/b');
        },
        () => {
          fail('should not be reached');
        },
      );
    });

    it('should work when entry point is named outlet', () => {
      recognize(
        TestBed.inject(EnvironmentInjector),
        null!,
        null,
        [
          {path: '', component: ComponentA},
          {path: 'modal', component: ComponentB, outlet: 'popup'},
        ],
        tree('(popup:modal)'),
        serializer,
      ).subscribe(
        ({tree}) => {
          expect(tree.toString()).toEqual('/(popup:modal)');
        },
        (e) => {
          fail('should not be reached' + e.message);
        },
      );
    });
  });

  describe('redirecting to named outlets', () => {
    it('should work when using absolute redirects', () => {
      checkRedirect(
        [
          {path: 'a/:id', redirectTo: '/b/:id(aux:c/:id)'},
          {path: 'b/:id', component: ComponentB},
          {path: 'c/:id', component: ComponentC, outlet: 'aux'},
        ],
        'a/1;p=99',
        (t: UrlTree) => {
          expectTreeToBe(t, '/b/1;p=99(aux:c/1;p=99)');
        },
      );
    });

    it('should work when using absolute redirects (wildcard)', () => {
      checkRedirect(
        [
          {path: 'b', component: ComponentB},
          {path: 'c', component: ComponentC, outlet: 'aux'},
          {path: '**', redirectTo: '/b(aux:c)'},
        ],
        'a/1',
        (t: UrlTree) => {
          expectTreeToBe(t, '/b(aux:c)');
        },
      );
    });

    it('should throw when using non-absolute redirects', () => {
      recognize(
        TestBed.inject(EnvironmentInjector),
        null!,
        null,
        [{path: 'a', redirectTo: 'b(aux:c)'}],
        tree('a'),
        serializer,
      ).subscribe(
        () => {
          throw new Error('should not be reached');
        },
        (e) => {
          expect(e.message).toContain(
            "Only absolute redirects can have named outlets. redirectTo: 'b(aux:c)'",
          );
        },
      );
    });
  });

  describe('can use redirectTo as a function', () => {
    it('with a simple function returning a string', () => {
      checkRedirect(
        [
          {path: 'a/b', redirectTo: () => 'other'},
          {path: '**', component: ComponentC},
        ],
        '/a/b',
        (t: UrlTree) => {
          expectTreeToBe(t, '/other');
        },
      );
    });

    it('but it would cause an infinit loop if redirect route is sub route of the path containing the redirectTo', () => {
      checkRedirect(
        [
          {
            path: 'a/b',
            redirectTo: () =>
              new UrlTree(
                new UrlSegmentGroup([], {
                  'primary': new UrlSegmentGroup(
                    [new UrlSegment('a', {}), new UrlSegment('b', {}), new UrlSegment('d', {})],
                    {},
                  ),
                }),
              ),
          },
          {path: '**', component: ComponentC},
        ],
        '/a/b',
        (t: UrlTree) => {
          throw 'Should not reach';
        },
        undefined,
        (e) => {
          expect(e).toBeDefined();
        },
      );
    });

    it('with a simple function returning a UrlTree', () => {
      checkRedirect(
        [
          {
            path: 'a/b',
            redirectTo: () =>
              new UrlTree(
                new UrlSegmentGroup([], {
                  'primary': new UrlSegmentGroup(
                    [new UrlSegment('c', {}), new UrlSegment('d', {}), new UrlSegment('e', {})],
                    {},
                  ),
                }),
              ),
          },
          {path: '**', component: ComponentC},
        ],
        '/a/b',
        (t: UrlTree) => {
          expectTreeToBe(t, '/c/d/e');
        },
      );
    });

    it('with a function using inject and returning a UrlTree', () => {
      checkRedirect(
        [
          {path: 'a/b', redirectTo: () => inject(Router).parseUrl('/c/d/e')},
          {path: '**', component: ComponentC},
        ],
        '/a/b',
        (t: UrlTree) => {
          expectTreeToBe(t, '/c/d/e');
        },
      );
    });

    it('can access query params and redirect using them', () => {
      checkRedirect(
        [
          {
            path: 'a/b',
            redirectTo: ({queryParams}) => {
              const tree = inject(Router).parseUrl('other');
              tree.queryParams = queryParams;
              return tree;
            },
          },
          {path: '**', component: ComponentC},
        ],
        '/a/b?hl=en&q=hello',
        (t: UrlTree) => {
          expectTreeToBe(t, 'other?hl=en&q=hello');
        },
      );
    });

    it('with a function using inject and returning a UrlTree with params', () => {
      checkRedirect(
        [
          {path: 'a/b', redirectTo: () => inject(Router).parseUrl('/c;a1=1,a2=2/d/e?qp=123')},
          {path: '**', component: ComponentC},
        ],
        '/a/b',
        (t: UrlTree) => {
          expectTreeToBe(t, '/c;a1=1,a2=2/d/e?qp=123');
        },
      );
    });

    it('receives positional params from the current route', () => {
      checkRedirect(
        [
          {
            path: ':id1/:id2',
            redirectTo: ({params}) =>
              inject(Router).parseUrl(`/redirect?id1=${params['id1']}&id2=${params['id2']}`),
          },
          {path: '**', component: ComponentC},
        ],
        '/a/b',
        (t: UrlTree) => {
          expectTreeToBe(t, 'redirect?id1=a&id2=b');
        },
      );
    });

    it('receives params from the parent route', () => {
      checkRedirect(
        [
          {
            path: ':id1/:id2',
            children: [
              {
                path: 'c',
                redirectTo: ({params}) =>
                  inject(Router).parseUrl(`/redirect?id1=${params['id1']}&id2=${params['id2']}`),
              },
            ],
          },
          {path: '**', component: ComponentC},
        ],
        '/a/b/c',
        (t: UrlTree) => {
          expectTreeToBe(t, 'redirect?id1=a&id2=b');
        },
      );
    });

    it('receives data from the parent componentless route', () => {
      checkRedirect(
        [
          {
            path: 'a/b',
            data: {data1: 'hello', data2: 'world'},
            children: [
              {
                path: 'c',
                redirectTo: ({data}) => `/redirect?id1=${data['data1']}&id2=${data['data2']}`,
              },
            ],
          },
          {path: '**', component: ComponentC},
        ],
        '/a/b/c',
        (t: UrlTree) => {
          expectTreeToBe(t, 'redirect?id1=hello&id2=world');
        },
      );
    });

    it('does not receive data from the parent route with component (default paramsInheritanceStrategy is emptyOnly)', () => {
      checkRedirect(
        [
          {
            path: 'a/b',
            data: {data1: 'hello', data2: 'world'},
            component: ComponentA,
            children: [
              {
                path: 'c',
                redirectTo: ({data}) => {
                  expect(data['data1']).toBeUndefined();
                  expect(data['data2']).toBeUndefined();
                  return `/redirect`;
                },
              },
            ],
          },
          {path: '**', component: ComponentC},
        ],
        '/a/b/c',
        (t: UrlTree) => {
          expectTreeToBe(t, 'redirect');
        },
      );
    });

    it('has access to inherited data from all ancestor routes with paramsInheritanceStrategy always', () => {
      checkRedirect(
        [
          {
            path: 'a',
            data: {data1: 'hello'},
            component: ComponentA,
            children: [
              {
                path: 'b',
                data: {data2: 'world'},
                component: ComponentB,
                children: [
                  {
                    path: 'c',
                    redirectTo: ({data}) => {
                      expect(data['data1']).toBe('hello');
                      expect(data['data2']).toBe('world');
                      return `/redirect`;
                    },
                  },
                ],
              },
            ],
          },
          {path: '**', component: ComponentC},
        ],
        '/a/b/c',
        (t: UrlTree) => {
          expectTreeToBe(t, 'redirect');
        },
        'always',
      );
    });

    it('has access to path params', () => {
      checkRedirect(
        [
          {
            path: 'a',
            children: [
              {
                path: 'b',
                redirectTo: ({params}) =>
                  `/redirect?k1=${params['k1']}&k2=${params['k2']}&k3=${params['k3']}&k4=${params['k4']}`,
              },
            ],
          },
          {path: '**', component: ComponentC},
        ],
        '/a;k1=v1;k2=v2/b;k3=v3;k4=v4',
        (t: UrlTree) => {
          expectTreeToBe(t, 'redirect?k1=v1&k2=v2&k3=v3&k4=v4');
        },
      );
    });
  });

  describe('can use redirectTo as an observable', () => {
    it('with a simple function returning an observable that emits a string', () => {
      checkRedirect(
        [
          {path: 'a/b', redirectTo: () => of('other')},
          {path: '**', component: ComponentC},
        ],
        '/a/b',
        (t: UrlTree) => {
          expectTreeToBe(t, '/other');
        },
      );
    });

    it('but it would cause an infinit loop if redirect route is sub route of the path containing the redirectTo', () => {
      checkRedirect(
        [
          {
            path: 'a/b',
            redirectTo: () =>
              of(
                new UrlTree(
                  new UrlSegmentGroup([], {
                    'primary': new UrlSegmentGroup(
                      [new UrlSegment('a', {}), new UrlSegment('b', {}), new UrlSegment('d', {})],
                      {},
                    ),
                  }),
                ),
              ),
          },
          {path: '**', component: ComponentC},
        ],
        '/a/b',
        (t: UrlTree) => {
          throw 'Should not reach';
        },
        undefined,
        (e) => {
          expect(e).toBeDefined();
        },
      );
    });

    it('with a simple function returning an observable that emits a UrlTree', () => {
      checkRedirect(
        [
          {
            path: 'a/b',
            redirectTo: () =>
              of(
                new UrlTree(
                  new UrlSegmentGroup([], {
                    'primary': new UrlSegmentGroup(
                      [new UrlSegment('c', {}), new UrlSegment('d', {}), new UrlSegment('e', {})],
                      {},
                    ),
                  }),
                ),
              ),
          },
          {path: '**', component: ComponentC},
        ],
        '/a/b',
        (t: UrlTree) => {
          expectTreeToBe(t, '/c/d/e');
        },
      );
    });

    it('with a function using inject and returning an observable that emits a UrlTree', () => {
      checkRedirect(
        [
          {
            path: 'a/b',
            redirectTo: () => {
              const tree = inject(Router).parseUrl('/c/d/e');
              return of(tree);
            },
          },
          {path: '**', component: ComponentC},
        ],
        '/a/b',
        (t: UrlTree) => {
          expectTreeToBe(t, '/c/d/e');
        },
      );
    });

    it('can access query params and redirect using them', () => {
      checkRedirect(
        [
          {
            path: 'a/b',
            redirectTo: ({queryParams}) => {
              const tree = inject(Router).parseUrl('other');
              tree.queryParams = queryParams;
              return of(tree);
            },
          },
          {path: '**', component: ComponentC},
        ],
        '/a/b?hl=en&q=hello',
        (t: UrlTree) => {
          expectTreeToBe(t, 'other?hl=en&q=hello');
        },
      );
    });

    it('with a function using inject and returning a UrlTree with params', () => {
      checkRedirect(
        [
          {
            path: 'a/b',
            redirectTo: () => {
              const tree = inject(Router).parseUrl('/c;a1=1,a2=2/d/e?qp=123');
              return of(tree);
            },
          },
          {path: '**', component: ComponentC},
        ],
        '/a/b',
        (t: UrlTree) => {
          expectTreeToBe(t, '/c;a1=1,a2=2/d/e?qp=123');
        },
      );
    });

    it('receives positional params from the current route', () => {
      checkRedirect(
        [
          {
            path: ':id1/:id2',
            redirectTo: ({params}) => {
              const tree = inject(Router).parseUrl(
                `/redirect?id1=${params['id1']}&id2=${params['id2']}`,
              );
              return of(tree);
            },
          },
          {path: '**', component: ComponentC},
        ],
        '/a/b',
        (t: UrlTree) => {
          expectTreeToBe(t, 'redirect?id1=a&id2=b');
        },
      );
    });

    it('receives params from the parent route', () => {
      checkRedirect(
        [
          {
            path: ':id1/:id2',
            children: [
              {
                path: 'c',
                redirectTo: ({params}) => {
                  const tree = inject(Router).parseUrl(
                    `/redirect?id1=${params['id1']}&id2=${params['id2']}`,
                  );
                  return of(tree);
                },
              },
            ],
          },
          {path: '**', component: ComponentC},
        ],
        '/a/b/c',
        (t: UrlTree) => {
          expectTreeToBe(t, 'redirect?id1=a&id2=b');
        },
      );
    });

    it('receives data from the parent componentless route', () => {
      checkRedirect(
        [
          {
            path: 'a/b',
            data: {data1: 'hello', data2: 'world'},
            children: [
              {
                path: 'c',
                redirectTo: ({data}) => of(`/redirect?id1=${data['data1']}&id2=${data['data2']}`),
              },
            ],
          },
          {path: '**', component: ComponentC},
        ],
        '/a/b/c',
        (t: UrlTree) => {
          expectTreeToBe(t, 'redirect?id1=hello&id2=world');
        },
      );
    });

    it('does not receive data from the parent route with component (default paramsInheritanceStrategy is emptyOnly)', () => {
      checkRedirect(
        [
          {
            path: 'a/b',
            data: {data1: 'hello', data2: 'world'},
            component: ComponentA,
            children: [
              {
                path: 'c',
                redirectTo: ({data}) => {
                  expect(data['data1']).toBeUndefined();
                  expect(data['data2']).toBeUndefined();
                  return of(`/redirect`);
                },
              },
            ],
          },
          {path: '**', component: ComponentC},
        ],
        '/a/b/c',
        (t: UrlTree) => {
          expectTreeToBe(t, 'redirect');
        },
      );
    });

    it('has access to inherited data from all ancestor routes with paramsInheritanceStrategy always', () => {
      checkRedirect(
        [
          {
            path: 'a',
            data: {data1: 'hello'},
            component: ComponentA,
            children: [
              {
                path: 'b',
                data: {data2: 'world'},
                component: ComponentB,
                children: [
                  {
                    path: 'c',
                    redirectTo: ({data}) => {
                      expect(data['data1']).toBe('hello');
                      expect(data['data2']).toBe('world');
                      return of(`/redirect`);
                    },
                  },
                ],
              },
            ],
          },
          {path: '**', component: ComponentC},
        ],
        '/a/b/c',
        (t: UrlTree) => {
          expectTreeToBe(t, 'redirect');
        },
        'always',
      );
    });

    it('has access to path params', () => {
      checkRedirect(
        [
          {
            path: 'a',
            children: [
              {
                path: 'b',
                redirectTo: ({params}) =>
                  of(
                    `/redirect?k1=${params['k1']}&k2=${params['k2']}&k3=${params['k3']}&k4=${params['k4']}`,
                  ),
              },
            ],
          },
          {path: '**', component: ComponentC},
        ],
        '/a;k1=v1;k2=v2/b;k3=v3;k4=v4',
        (t: UrlTree) => {
          expectTreeToBe(t, 'redirect?k1=v1&k2=v2&k3=v3&k4=v4');
        },
      );
    });
  });

  describe('can use redirectTo as a promise', () => {
    it('with a simple function returning a promise that emits a string', () => {
      checkRedirect(
        [
          {path: 'a/b', redirectTo: async () => Promise.resolve('other')},
          {path: '**', component: ComponentC},
        ],
        '/a/b',
        (t: UrlTree) => {
          expectTreeToBe(t, '/other');
        },
      );
    });

    it('but it would cause an infinit loop if redirect route is sub route of the path containing the redirectTo', () => {
      checkRedirect(
        [
          {
            path: 'a/b',
            redirectTo: async () =>
              Promise.resolve(
                new UrlTree(
                  new UrlSegmentGroup([], {
                    'primary': new UrlSegmentGroup(
                      [new UrlSegment('a', {}), new UrlSegment('b', {}), new UrlSegment('d', {})],
                      {},
                    ),
                  }),
                ),
              ),
          },
          {path: '**', component: ComponentC},
        ],
        '/a/b',
        (t: UrlTree) => {
          throw 'Should not reach';
        },
        undefined,
        (e) => {
          expect(e).toBeDefined();
        },
      );
    });

    it('with a simple function returning an observable that emits a UrlTree', () => {
      checkRedirect(
        [
          {
            path: 'a/b',
            redirectTo: async () =>
              Promise.resolve(
                new UrlTree(
                  new UrlSegmentGroup([], {
                    'primary': new UrlSegmentGroup(
                      [new UrlSegment('c', {}), new UrlSegment('d', {}), new UrlSegment('e', {})],
                      {},
                    ),
                  }),
                ),
              ),
          },
          {path: '**', component: ComponentC},
        ],
        '/a/b',
        (t: UrlTree) => {
          expectTreeToBe(t, '/c/d/e');
        },
      );
    });

    it('with a function using inject and returning an observable that emits a UrlTree', () => {
      checkRedirect(
        [
          {
            path: 'a/b',
            redirectTo: async () => {
              const tree = inject(Router).parseUrl('/c/d/e');
              return Promise.resolve(tree);
            },
          },
          {path: '**', component: ComponentC},
        ],
        '/a/b',
        (t: UrlTree) => {
          expectTreeToBe(t, '/c/d/e');
        },
      );
    });

    it('can access query params and redirect using them', () => {
      checkRedirect(
        [
          {
            path: 'a/b',
            redirectTo: async ({queryParams}) => {
              const tree = inject(Router).parseUrl('other');
              tree.queryParams = queryParams;
              return Promise.resolve(tree);
            },
          },
          {path: '**', component: ComponentC},
        ],
        '/a/b?hl=en&q=hello',
        (t: UrlTree) => {
          expectTreeToBe(t, 'other?hl=en&q=hello');
        },
      );
    });

    it('with a function using inject and returning a UrlTree with params', () => {
      checkRedirect(
        [
          {
            path: 'a/b',
            redirectTo: async () => {
              const tree = inject(Router).parseUrl('/c;a1=1,a2=2/d/e?qp=123');
              return Promise.resolve(tree);
            },
          },
          {path: '**', component: ComponentC},
        ],
        '/a/b',
        (t: UrlTree) => {
          expectTreeToBe(t, '/c;a1=1,a2=2/d/e?qp=123');
        },
      );
    });

    it('receives positional params from the current route', () => {
      checkRedirect(
        [
          {
            path: ':id1/:id2',
            redirectTo: async ({params}) => {
              const tree = inject(Router).parseUrl(
                `/redirect?id1=${params['id1']}&id2=${params['id2']}`,
              );
              return Promise.resolve(tree);
            },
          },
          {path: '**', component: ComponentC},
        ],
        '/a/b',
        (t: UrlTree) => {
          expectTreeToBe(t, 'redirect?id1=a&id2=b');
        },
      );
    });

    it('receives params from the parent route', () => {
      checkRedirect(
        [
          {
            path: ':id1/:id2',
            children: [
              {
                path: 'c',
                redirectTo: async ({params}) => {
                  const tree = inject(Router).parseUrl(
                    `/redirect?id1=${params['id1']}&id2=${params['id2']}`,
                  );
                  return Promise.resolve(tree);
                },
              },
            ],
          },
          {path: '**', component: ComponentC},
        ],
        '/a/b/c',
        (t: UrlTree) => {
          expectTreeToBe(t, 'redirect?id1=a&id2=b');
        },
      );
    });

    it('receives data from the parent componentless route', () => {
      checkRedirect(
        [
          {
            path: 'a/b',
            data: {data1: 'hello', data2: 'world'},
            children: [
              {
                path: 'c',
                redirectTo: async ({data}) =>
                  Promise.resolve(`/redirect?id1=${data['data1']}&id2=${data['data2']}`),
              },
            ],
          },
          {path: '**', component: ComponentC},
        ],
        '/a/b/c',
        (t: UrlTree) => {
          expectTreeToBe(t, 'redirect?id1=hello&id2=world');
        },
      );
    });

    it('does not receive data from the parent route with component (default paramsInheritanceStrategy is emptyOnly)', () => {
      checkRedirect(
        [
          {
            path: 'a/b',
            data: {data1: 'hello', data2: 'world'},
            component: ComponentA,
            children: [
              {
                path: 'c',
                redirectTo: async ({data}) => {
                  expect(data['data1']).toBeUndefined();
                  expect(data['data2']).toBeUndefined();
                  return Promise.resolve(`/redirect`);
                },
              },
            ],
          },
          {path: '**', component: ComponentC},
        ],
        '/a/b/c',
        (t: UrlTree) => {
          expectTreeToBe(t, 'redirect');
        },
      );
    });

    it('has access to inherited data from all ancestor routes with paramsInheritanceStrategy always', () => {
      checkRedirect(
        [
          {
            path: 'a',
            data: {data1: 'hello'},
            component: ComponentA,
            children: [
              {
                path: 'b',
                data: {data2: 'world'},
                component: ComponentB,
                children: [
                  {
                    path: 'c',
                    redirectTo: async ({data}) => {
                      expect(data['data1']).toBe('hello');
                      expect(data['data2']).toBe('world');
                      return Promise.resolve(`/redirect`);
                    },
                  },
                ],
              },
            ],
          },
          {path: '**', component: ComponentC},
        ],
        '/a/b/c',
        (t: UrlTree) => {
          expectTreeToBe(t, 'redirect');
        },
        'always',
      );
    });

    it('has access to path params', () => {
      checkRedirect(
        [
          {
            path: 'a',
            children: [
              {
                path: 'b',
                redirectTo: async ({params}) =>
                  Promise.resolve(
                    `/redirect?k1=${params['k1']}&k2=${params['k2']}&k3=${params['k3']}&k4=${params['k4']}`,
                  ),
              },
            ],
          },
          {path: '**', component: ComponentC},
        ],
        '/a;k1=v1;k2=v2/b;k3=v3;k4=v4',
        (t: UrlTree) => {
          expectTreeToBe(t, 'redirect?k1=v1&k2=v2&k3=v3&k4=v4');
        },
      );
    });
  });

  // internal failure b/165719418
  it('does not fail with large configs', () => {
    const config: Routes = [];
    for (let i = 0; i < 400; i++) {
      config.push({path: 'no_match', component: ComponentB});
    }
    config.push({path: 'match', component: ComponentA});
    recognize(
      TestBed.inject(EnvironmentInjector),
      null!,
      null,
      config,
      tree('match'),
      serializer,
    ).forEach(({tree: r}) => {
      expectTreeToBe(r, 'match');
    });
  });
});

function checkRedirect(
  config: Routes,
  url: string,
  callback: (t: UrlTree, state: RouterStateSnapshot) => void,
  paramsInheritanceStrategy?: ParamsInheritanceStrategy,
  errorCallback?: (e: unknown) => void,
): void {
  const redirectionTimeout = 10;
  recognize(
    TestBed.inject(EnvironmentInjector),
    TestBed.inject(RouterConfigLoader),
    null,
    config,
    tree(url),
    new DefaultUrlSerializer(),
    paramsInheritanceStrategy,
  )
    .pipe(timeout(redirectionTimeout))
    .subscribe({
      next: (v) => callback(v.tree, v.state),
      error: (e) => {
        if (!errorCallback) {
          throw e;
        }
        errorCallback(e);
      },
    });
}

function tree(url: string): UrlTree {
  return new DefaultUrlSerializer().parse(url);
}

function expectTreeToBe(actual: UrlTree, expectedUrl: string): void {
  const expected = tree(expectedUrl);
  const serializer = new DefaultUrlSerializer();
  const error = `"${serializer.serialize(actual)}" is not equal to "${serializer.serialize(
    expected,
  )}"`;
  compareSegments(actual.root, expected.root, error);
  expect(actual.queryParams).toEqual(expected.queryParams);
  expect(actual.fragment).toEqual(expected.fragment);
}

function compareSegments(actual: UrlSegmentGroup, expected: UrlSegmentGroup, error: string): void {
  expect(actual).toBeDefined(error);
  expect(equalSegments(actual.segments, expected.segments)).toEqual(true, error);

  expect(Object.keys(actual.children).length).toEqual(Object.keys(expected.children).length, error);

  Object.keys(expected.children).forEach((key) => {
    compareSegments(actual.children[key], expected.children[key], error);
  });
}

class ComponentA {}
class ComponentB {}
class ComponentC {}
