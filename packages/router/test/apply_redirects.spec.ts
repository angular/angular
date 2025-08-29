/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {EnvironmentInjector, inject, Injectable, Type} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {firstValueFrom, interval, Observable, of} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';

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
import {useAutoTick} from './helpers';

describe('redirects', () => {
  useAutoTick();
  const serializer = new DefaultUrlSerializer();

  it('should return the same url tree when no redirects', async () => {
    await checkRedirect(
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

  it('should add new segments when needed', async () => {
    await checkRedirect(
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

  it('should support redirecting with to an URL with query parameters', async () => {
    const config: Routes = [
      {path: 'single_value', redirectTo: '/dst?k=v1'},
      {path: 'multiple_values', redirectTo: '/dst?k=v1&k=v2'},
      {path: '**', component: ComponentA},
    ];

    await checkRedirect(config, 'single_value', (t: UrlTree, state: RouterStateSnapshot) => {
      expectTreeToBe(t, '/dst?k=v1');
      expect(state.root.queryParams).toEqual({k: 'v1'});
    });
    await checkRedirect(config, 'multiple_values', (t: UrlTree) =>
      expectTreeToBe(t, '/dst?k=v1&k=v2'),
    );
  });

  it('should handle positional parameters', async () => {
    await checkRedirect(
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

  it('should throw when cannot handle a positional parameter', async () => {
    try {
      await recognize(
        TestBed.inject(EnvironmentInjector),
        null!,
        null,
        [{path: 'a/:id', redirectTo: 'a/:other'}],
        createUrlTree('/a/1'),
        serializer,
        'emptyOnly',
        new AbortController().signal,
      );
      fail();
    } catch (e: any) {
      expect(e.message).toContain("Cannot redirect to 'a/:other'. Cannot find ':other'.");
    }
  });

  it('should pass matrix parameters', async () => {
    await checkRedirect(
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

  it('should handle preserve secondary routes', async () => {
    await checkRedirect(
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

  it('should redirect secondary routes', async () => {
    await checkRedirect(
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

  it('should use the configuration of the route redirected to', async () => {
    await checkRedirect(
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

  it('should support redirects with both main and aux', async () => {
    await checkRedirect(
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

  it('should support redirects with both main and aux (with a nested redirect)', async () => {
    await checkRedirect(
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

  it('should redirect wild cards', async () => {
    await checkRedirect(
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

  it('should throw an error on infinite absolute redirect', async () => {
    try {
      await recognize(
        TestBed.inject(EnvironmentInjector),
        TestBed.inject(RouterConfigLoader),
        null,
        [{path: '**', redirectTo: '/404'}],
        createUrlTree('/'),
        new DefaultUrlSerializer(),
        'emptyOnly',
        new AbortController().signal,
      );
      fail('expected infinite redirect error');
    } catch (e) {
      expect((e as Error).message).toMatch(/infinite redirect/);
    }
  });

  it('should support absolute redirects', async () => {
    await checkRedirect(
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

  it('should not create injector for Route if the route does not match', async () => {
    const routes = [
      {path: '', pathMatch: 'full' as const, providers: []},
      {
        path: 'a',
        component: ComponentA,
        children: [{path: 'b', component: ComponentB}],
      },
    ];
    await checkRedirect(routes, '/a/b', (t: UrlTree) => {
      expectTreeToBe(t, '/a/b');
      expect(getProvidersInjector(routes[0])).not.toBeDefined();
    });
  });

  it('should create injectors for partial Route route matches', async () => {
    const routes = [
      {
        path: 'a',
        component: ComponentA,
        providers: [],
      },
      {path: 'doesNotMatch', providers: []},
    ];
    try {
      await recognize(
        TestBed.inject(EnvironmentInjector),
        null!,
        null,
        routes,
        createUrlTree('a/b/c'),
        serializer,
        'emptyOnly',
        new AbortController().signal,
      );
      fail('Should not be reached');
    } catch (e) {
      // The 'a' segment matched, so we needed to create the injector for the `Route`
      expect(getProvidersInjector(routes[0])).toBeDefined();
      // The second `Route` did not match at all so we should not create an injector for it
      expect(getProvidersInjector(routes[1])).not.toBeDefined();
    }
  });

  it('should support CanMatch providers on the route', async () => {
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
    await recognize(
      TestBed.inject(EnvironmentInjector),
      null!,
      null,
      routes,
      createUrlTree('a'),
      serializer,
      'emptyOnly',
      new AbortController().signal,
    );
    // The 'a' segment matched, so we needed to create the injector for the `Route`
    expect(getProvidersInjector(routes[0])).toBeDefined();
    // The second `Route` did not match because the first did so we should not create an
    // injector for it
    expect(getProvidersInjector(routes[1])).not.toBeDefined();
  });

  describe('lazy loading', () => {
    it('should load config on demand', async () => {
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

      const {tree: result} = await recognize(
        TestBed.inject(EnvironmentInjector),
        <any>loader,
        null,
        config,
        createUrlTree('a/b'),
        serializer,
        'emptyOnly',
        new AbortController().signal,
      );
      expectTreeToBe(result, '/a/b');
      expect(getLoadedRoutes(config[0])).toBe(loadedConfig.routes);
    });

    it('should handle the case when the loader errors', async () => {
      const loader: Pick<RouterConfigLoader, 'loadChildren'> = {
        loadChildren: (p: any) => new Observable((obs) => obs.error(new Error('Loading Error'))),
      };
      const config = [
        {path: 'a', component: ComponentA, loadChildren: jasmine.createSpy('children')},
      ];

      try {
        await recognize(
          TestBed.inject(EnvironmentInjector),
          <any>loader,
          null,
          config,
          createUrlTree('a/b'),
          serializer,
          'emptyOnly',
          new AbortController().signal,
        );
        fail();
      } catch (e: any) {
        expect(e.message).toEqual('Loading Error');
      }
    });

    it('should load when all canLoad guards return true', async () => {
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

      const {tree: r} = await recognize(
        TestBed.inject(EnvironmentInjector),
        <any>loader,
        null,
        config,
        createUrlTree('a/b'),
        serializer,
        'emptyOnly',
        new AbortController().signal,
      );
      expectTreeToBe(r, '/a/b');
    });

    it('should not load when any canLoad guards return false', async () => {
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

      try {
        await recognize(
          TestBed.inject(EnvironmentInjector),
          <any>loader,
          null,
          config,
          createUrlTree('a/b'),
          serializer,
          'emptyOnly',
          new AbortController().signal,
        );
        fail('Should not reach');
      } catch (e: any) {
        expect(e.message).toEqual(
          `NavigationCancelingError: Cannot load children because the guard of the route "path: 'a'" returned false`,
        );
      }
    });

    it('should not load when any canLoad guards is rejected (promises)', async () => {
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

      try {
        await recognize(
          TestBed.inject(EnvironmentInjector),
          <any>loader,
          null,
          config,
          createUrlTree('a/b'),
          serializer,
          'emptyOnly',
          new AbortController().signal,
        );
        fail('Should not reach');
      } catch (e: any) {
        expect(e).toEqual('someError');
      }
    });

    it('should work with objects implementing the CanLoad interface', async () => {
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

      const {tree: r} = await recognize(
        TestBed.inject(EnvironmentInjector),
        <any>loader,
        null,
        config,
        createUrlTree('a/b'),
        serializer,
        'emptyOnly',
        new AbortController().signal,
      );
      expectTreeToBe(r, '/a/b');
    });

    it('should pass UrlSegments to functions implementing the canLoad guard interface', async () => {
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

      const {tree: r} = await recognize(
        TestBed.inject(EnvironmentInjector),
        <any>loader,
        null,
        config,
        createUrlTree('a/b'),
        serializer,
        'emptyOnly',
        new AbortController().signal,
      );
      expectTreeToBe(r, '/a/b');
      expect(passedUrlSegments!.length).toBe(2);
      expect(passedUrlSegments![0].path).toBe('a');
      expect(passedUrlSegments![1].path).toBe('b');
    });

    it('should pass UrlSegments to objects implementing the canLoad guard interface', async () => {
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

      const {tree: r} = await recognize(
        TestBed.inject(EnvironmentInjector),
        <any>loader,
        null,
        config,
        createUrlTree('a/b'),
        serializer,
        'emptyOnly',
        new AbortController().signal,
      );
      expectTreeToBe(r, '/a/b');
      expect(passedUrlSegments!.length).toBe(2);
      expect(passedUrlSegments![0].path).toBe('a');
      expect(passedUrlSegments![1].path).toBe('b');
    });

    it('should work with absolute redirects', async () => {
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

      const {tree: r} = await recognize(
        TestBed.inject(EnvironmentInjector),
        <any>loader,
        null,
        config,
        createUrlTree(''),
        serializer,
        'emptyOnly',
        new AbortController().signal,
      );
      expectTreeToBe(r, 'a');
      expect(getLoadedRoutes(config[1])).toBe(loadedConfig.routes);
    });

    it('should load the configuration only once', async () => {
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

      await recognize(
        TestBed.inject(EnvironmentInjector),
        <any>loader,
        null,
        config,
        createUrlTree('a?k1'),
        serializer,
        'emptyOnly',
        new AbortController().signal,
      );

      const {tree: r} = await recognize(
        TestBed.inject(EnvironmentInjector),
        <any>loader,
        null,
        config,
        createUrlTree('a?k2'),
        serializer,
        'emptyOnly',
        new AbortController().signal,
      );
      expectTreeToBe(r, 'a?k2');
      expect(getLoadedRoutes(config[0])).toBe(loadedConfig.routes);
    });

    it('should load the configuration of a wildcard route', async () => {
      const loadedConfig = {
        routes: [{path: '', component: ComponentB}],
        injector: TestBed.inject(EnvironmentInjector),
      };

      const loader: Pick<RouterConfigLoader, 'loadChildren'> = {
        loadChildren: (injector: any, p: any) => of(loadedConfig),
      };

      const config: Routes = [{path: '**', loadChildren: jasmine.createSpy('children')}];

      await recognize(
        TestBed.inject(EnvironmentInjector),
        <any>loader,
        null,
        config,
        createUrlTree('xyz'),
        serializer,
        'emptyOnly',
        new AbortController().signal,
      );
      expect(getLoadedRoutes(config[0])).toBe(loadedConfig.routes);
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
      loader.loadChildren.and.returnValue(
        of(loadedConfig).pipe(switchMap((v) => new Promise((r) => setTimeout(r, 0)).then(() => v))),
      );

      const config: Routes = [
        {path: '', loadChildren: jasmine.createSpy('matchChildren')},
        {path: '**', loadChildren: jasmine.createSpy('children')},
      ];

      await recognize(
        TestBed.inject(EnvironmentInjector),
        <any>loader,
        null,
        config,
        createUrlTree(''),
        serializer,
        'emptyOnly',
        new AbortController().signal,
      );
      expect(loader.loadChildren.calls.count()).toEqual(1);
      expect(loader.loadChildren.calls.first().args).not.toContain(
        jasmine.objectContaining({
          loadChildren: jasmine.createSpy('children'),
        }),
      );
    });

    it('should load the configuration after a local redirect from a wildcard route', async () => {
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

      await recognize(
        TestBed.inject(EnvironmentInjector),
        <any>loader,
        null,
        config,
        createUrlTree('xyz'),
        serializer,
        'emptyOnly',
        new AbortController().signal,
      );
      expect(getLoadedRoutes(config[0])).toBe(loadedConfig.routes);
    });

    it('should load the configuration after an absolute redirect from a wildcard route', async () => {
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

      await recognize(
        TestBed.inject(EnvironmentInjector),
        <any>loader,
        null,
        config,
        createUrlTree('xyz'),
        serializer,
        'emptyOnly',
        new AbortController().signal,
      );
      expect(getLoadedRoutes(config[0])).toBe(loadedConfig.routes);
    });

    it('should load all matching configurations of empty path, including an auxiliary outlets', async () => {
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
            switchMap((v) => new Promise((r) => setTimeout(r, 10 * loadCalls)).then(() => v)),
            tap(() => loaded.push((p.loadChildren as jasmine.Spy).and.identity)),
          );
        },
      };

      const config: Routes = [
        {path: '', loadChildren: jasmine.createSpy('root')},
        {path: '', loadChildren: jasmine.createSpy('aux'), outlet: 'popup'},
      ];

      await recognize(
        TestBed.inject(EnvironmentInjector),
        <any>loader,
        null,
        config,
        createUrlTree(''),
        serializer,
        'emptyOnly',
        new AbortController().signal,
      );
      expect(loadCalls).toBe(2);
      expect(loaded.sort()).toEqual(['root', 'aux'].sort());
    });

    it('should not try to load any matching configuration if previous load completed', async () => {
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
            switchMap((v) => new Promise((r) => setTimeout(r, 10 * loadCalls)).then(() => v)),
            tap(() => loaded.push((p.loadChildren as jasmine.Spy).and.identity)),
          );
        },
      };

      const config: Routes = [{path: '**', loadChildren: jasmine.createSpy('children')}];

      await recognize(
        TestBed.inject(EnvironmentInjector),
        <any>loader,
        null,
        config,
        createUrlTree('xyz/a'),
        serializer,
        'emptyOnly',
        new AbortController().signal,
      );
      expect(loadCalls).toBe(1);
      expect(loaded).toEqual(['children']);
      await recognize(
        TestBed.inject(EnvironmentInjector),
        <any>loader,
        null,
        config,
        createUrlTree('xyz/b'),
        serializer,
        'emptyOnly',
        new AbortController().signal,
      );
      expect(loadCalls).toBe(1);
      await recognize(
        TestBed.inject(EnvironmentInjector),
        <any>loader,
        null,
        config,
        createUrlTree('xyz/c'),
        serializer,
        'emptyOnly',
        new AbortController().signal,
      );
      expect(loadCalls).toBe(1);
    });

    it('loads only the first match when two Routes with the same outlet have the same path', async () => {
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

      await recognize(
        TestBed.inject(EnvironmentInjector),
        <any>loader,
        null,
        config,
        createUrlTree('a'),
        serializer,
        'emptyOnly',
        new AbortController().signal,
      );
      expect(loadCalls).toBe(1);
      expect(loaded).toEqual(['first']);
    });

    it('should load the configuration of empty root path if the entry is an aux outlet', async () => {
      const loadedConfig = {
        routes: [{path: '', component: ComponentA}],
        injector: TestBed.inject(EnvironmentInjector),
      };
      let loaded: string[] = [];
      const rootDelay = 10;
      const auxDelay = 1;
      const loader: Pick<RouterConfigLoader, 'loadChildren'> = {
        loadChildren: (injector: any, p: Route) => {
          const delayMs =
            (p.loadChildren! as jasmine.Spy).and.identity === 'aux' ? auxDelay : rootDelay;
          return of(loadedConfig).pipe(
            switchMap((v) => new Promise((r) => setTimeout(r, delayMs)).then(() => v)),
            tap(() => loaded.push((p.loadChildren as jasmine.Spy).and.identity)),
          );
        },
      };

      const config: Routes = [
        // Define aux route first so it matches before the primary outlet
        {path: 'modal', loadChildren: jasmine.createSpy('aux'), outlet: 'popup'},
        {path: '', loadChildren: jasmine.createSpy('root')},
      ];

      await recognize(
        TestBed.inject(EnvironmentInjector),
        <any>loader,
        null,
        config,
        createUrlTree('(popup:modal)'),
        serializer,
        'emptyOnly',
        new AbortController().signal,
      );
      expect(loaded.sort()).toEqual(['aux', 'root'].sort());
    });
  });

  describe('empty paths', () => {
    it('redirect from an empty path should work (local redirect)', async () => {
      await checkRedirect(
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

    it('redirect from an empty path should work (absolute redirect)', async () => {
      await checkRedirect(
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

    it('should redirect empty path route only when terminal', async () => {
      const config: Routes = [
        {
          path: 'a',
          component: ComponentA,
          children: [{path: 'b', component: ComponentB}],
        },
        {path: '', redirectTo: 'a', pathMatch: 'full'},
      ];

      try {
        await recognize(
          TestBed.inject(EnvironmentInjector),
          null!,
          null,
          config,
          createUrlTree('b'),
          serializer,
          'emptyOnly',
          new AbortController().signal,
        );
        fail('Should not be reached');
      } catch (e: any) {
        expect(e.message).toContain("Cannot match any routes. URL Segment: 'b'");
      }
    });

    it('redirect from an empty path should work (nested case)', async () => {
      await checkRedirect(
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

    it('redirect to an empty path should work', async () => {
      await checkRedirect(
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
      it('should create a new url segment (non-terminal)', async () => {
        await checkRedirect(
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

      it('should create a new url segment (terminal)', async () => {
        await checkRedirect(
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
      it('should work with non-empty auxiliary path', async () => {
        await checkRedirect(
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

      it('should work with empty auxiliary path', async () => {
        await checkRedirect(
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

      it('should work with empty auxiliary path and matching primary', async () => {
        await checkRedirect(
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

      it('should work with aux outlets adjacent to and children of empty path at once', async () => {
        await checkRedirect(
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

      it('should work with children outlets within two levels of empty parents', async () => {
        await checkRedirect(
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

      it('does not persist a primary segment beyond the boundary of a named outlet match', async () => {
        const config: Routes = [
          {
            path: '',
            component: ComponentA,
            outlet: 'aux',
            children: [{path: 'b', component: ComponentB, redirectTo: '/c'}],
          },
          {path: 'c', component: ComponentC},
        ];
        try {
          await recognize(
            TestBed.inject(EnvironmentInjector),
            null!,
            null,
            config,
            createUrlTree('/b'),
            serializer,
            'emptyOnly',
            new AbortController().signal,
          );
          fail('Should not be reached');
        } catch (e: any) {
          expect(e.message).toContain(`Cannot match any routes. URL Segment: 'b'`);
        }
      });
    });

    describe('split at the end (no right child)', () => {
      it('should create a new child (non-terminal)', async () => {
        await checkRedirect(
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

      it('should create a new child (terminal)', async () => {
        await checkRedirect(
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

      it('should work only only primary outlet', async () => {
        await checkRedirect(
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
      it('should create a new child (non-terminal)', async () => {
        await checkRedirect(
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

      it('should not create a new child (terminal)', async () => {
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

        try {
          await recognize(
            TestBed.inject(EnvironmentInjector),
            null!,
            null,
            config,
            createUrlTree('a/(d//aux:e)'),
            serializer,
            'emptyOnly',
            new AbortController().signal,
          );
          fail('Should not be reached');
        } catch (e: any) {
          expect(e.message).toContain("Cannot match any routes. URL Segment: 'a'");
        }
      });
    });
  });

  describe('empty URL leftovers', () => {
    it('should not error when no children matching and no url is left', async () => {
      await checkRedirect(
        [{path: 'a', component: ComponentA, children: [{path: 'b', component: ComponentB}]}],
        '/a',
        (t: UrlTree) => {
          expectTreeToBe(t, 'a');
        },
      );
    });

    it('should not error when no children matching and no url is left (aux routes)', async () => {
      await checkRedirect(
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

    it('should error when no children matching and some url is left', async () => {
      try {
        await recognize(
          TestBed.inject(EnvironmentInjector),
          null!,
          null,
          [{path: 'a', component: ComponentA, children: [{path: 'b', component: ComponentB}]}],
          createUrlTree('/a/c'),
          serializer,
          'emptyOnly',
          new AbortController().signal,
        );
        fail('Should not be reached');
      } catch (e: any) {
        expect(e.message).toContain("Cannot match any routes. URL Segment: 'a/c'");
      }
    });
  });

  describe('custom path matchers', () => {
    it('should use custom path matcher', async () => {
      const matcher = (s: any, g: any, r: any) => {
        if (s[0].path === 'a') {
          return {consumed: s.slice(0, 2), posParams: {id: s[1]}};
        } else {
          return null;
        }
      };

      await checkRedirect(
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
    it('should work with redirects when other outlet comes before the one being activated', async () => {
      const {tree} = await recognize(
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
        createUrlTree(''),
        serializer,
        'emptyOnly',
        new AbortController().signal,
      );
      expect(tree.toString()).toEqual('/b(aux:b)');
      expect(tree.root.children['primary'].toString()).toEqual('b');
      expect(tree.root.children['aux']).toBeDefined();
      expect(tree.root.children['aux'].toString()).toEqual('b');
    });

    it('should prevent empty named outlets from appearing in leaves, resulting in odd tree url', async () => {
      const {tree} = await recognize(
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
        createUrlTree(''),
        serializer,
        'emptyOnly',
        new AbortController().signal,
      );
      expect(tree.toString()).toEqual('/b');
    });

    it('should work when entry point is named outlet', async () => {
      const {tree} = await recognize(
        TestBed.inject(EnvironmentInjector),
        null!,
        null,
        [
          {path: '', component: ComponentA},
          {path: 'modal', component: ComponentB, outlet: 'popup'},
        ],
        createUrlTree('(popup:modal)'),
        serializer,
        'emptyOnly',
        new AbortController().signal,
      );
      expect(tree.toString()).toEqual('/(popup:modal)');
    });
  });

  describe('redirecting to named outlets', () => {
    it('should work when using absolute redirects', async () => {
      await checkRedirect(
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

    it('should work when using absolute redirects (wildcard)', async () => {
      await checkRedirect(
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

    it('should throw when using non-absolute redirects', async () => {
      try {
        await recognize(
          TestBed.inject(EnvironmentInjector),
          null!,
          null,
          [{path: 'a', redirectTo: 'b(aux:c)'}],
          createUrlTree('a'),
          serializer,
          'emptyOnly',
          new AbortController().signal,
        );
        fail('should not be reached');
      } catch (e: any) {
        expect(e.message).toContain(
          "Only absolute redirects can have named outlets. redirectTo: 'b(aux:c)'",
        );
      }
    });
  });

  describe('can use redirectTo as a function', () => {
    it('with a simple function returning a string', async () => {
      await checkRedirect(
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

    it('would cause an infinite loop if redirect route is sub route of the path containing the redirectTo', async () => {
      let redirects = 0;
      await checkRedirect(
        [
          {
            path: 'a/b',
            redirectTo: () => {
              redirects++;
              if (redirects < 10) {
                throw new Error('infinite');
              }

              return new UrlTree(
                new UrlSegmentGroup([], {
                  'primary': new UrlSegmentGroup(
                    [new UrlSegment('a', {}), new UrlSegment('b', {}), new UrlSegment('d', {})],
                    {},
                  ),
                }),
              );
            },
          },
          {path: '**', component: ComponentC},
        ],
        '/a/b',
        (t: UrlTree) => {
          throw 'Should not reach';
        },
        'emptyOnly',
        (e) => {
          expect(e).toBeDefined();
        },
      );
    });

    it('with a simple function returning a UrlTree', async () => {
      await checkRedirect(
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

    it('with a function using inject and returning a UrlTree', async () => {
      await checkRedirect(
        [
          {path: 'a/b', redirectTo: () => of(TestBed.inject(Router).parseUrl('/c/d/e'))},
          {path: '**', component: ComponentC},
        ],
        '/a/b',
        (t: UrlTree) => {
          expectTreeToBe(t, '/c/d/e');
        },
      );
    });

    it('can access query params and redirect using them', async () => {
      await checkRedirect(
        [
          {
            path: 'a/b',
            redirectTo: ({queryParams}) => {
              const tree = TestBed.inject(Router).parseUrl('other');
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

    it('with a function using inject and returning a UrlTree with params', async () => {
      await checkRedirect(
        [
          {
            path: 'a/b',
            redirectTo: () => TestBed.inject(Router).parseUrl('/c;a1=1,a2=2/d/e?qp=123'),
          },
          {path: '**', component: ComponentC},
        ],
        '/a/b',
        (t: UrlTree) => {
          expectTreeToBe(t, '/c;a1=1,a2=2/d/e?qp=123');
        },
      );
    });

    it('receives positional params from the current route', async () => {
      await checkRedirect(
        [
          {
            path: ':id1/:id2',
            redirectTo: ({params}) =>
              TestBed.inject(Router).parseUrl(
                `/redirect?id1=${params['id1']}&id2=${params['id2']}`,
              ),
          },
          {path: '**', component: ComponentC},
        ],
        '/a/b',
        (t: UrlTree) => {
          expectTreeToBe(t, 'redirect?id1=a&id2=b');
        },
      );
    });

    it('receives params from the parent route', async () => {
      await checkRedirect(
        [
          {
            path: ':id1/:id2',
            children: [
              {
                path: 'c',
                redirectTo: ({params}) =>
                  TestBed.inject(Router).parseUrl(
                    `/redirect?id1=${params['id1']}&id2=${params['id2']}`,
                  ),
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

    it('receives data from the parent componentless route', async () => {
      await checkRedirect(
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

    it('does not receive data from the parent route with component (default paramsInheritanceStrategy is emptyOnly)', async () => {
      await checkRedirect(
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

    it('has access to inherited data from all ancestor routes with paramsInheritanceStrategy always', async () => {
      await checkRedirect(
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

    it('has access to path params', async () => {
      await checkRedirect(
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

    it('works when the returned redirect observable does not complete', async () => {
      await checkRedirect(
        [
          {
            path: 'a',
            children: [
              {
                path: 'b',
                redirectTo: () => interval(100).pipe(map(() => '/redirected')),
              },
            ],
          },
          {path: '**', component: ComponentC},
        ],
        '/a;k1=v1;k2=v2/b;k3=v3;k4=v4',
        (t: UrlTree) => {
          expectTreeToBe(t, 'redirected');
        },
      );
    });
  });

  // internal failure b/165719418
  it('does not fail with large configs', async () => {
    const config: Routes = [];
    for (let i = 0; i < 400; i++) {
      config.push({path: 'no_match', component: ComponentB});
    }
    config.push({path: 'match', component: ComponentA});
    const {tree: r} = await recognize(
      TestBed.inject(EnvironmentInjector),
      null!,
      null,
      config,
      createUrlTree('match'),
      serializer,
      'emptyOnly',
      new AbortController().signal,
    );
    expectTreeToBe(r, 'match');
  });
});

async function checkRedirect(
  config: Routes,
  url: string,
  callback: (t: UrlTree, state: RouterStateSnapshot) => void,
  paramsInheritanceStrategy: ParamsInheritanceStrategy = 'emptyOnly',
  errorCallback?: (e: unknown) => void,
): Promise<void> {
  try {
    const {tree, state} = await recognize(
      TestBed.inject(EnvironmentInjector),
      TestBed.inject(RouterConfigLoader),
      null,
      config,
      createUrlTree(url),
      new DefaultUrlSerializer(),
      paramsInheritanceStrategy,
      new AbortController().signal,
    );
    callback(tree, state);
  } catch (e) {
    if (errorCallback) {
      errorCallback(e);
    } else {
      throw e;
    }
  }
}

function createUrlTree(url: string): UrlTree {
  return new DefaultUrlSerializer().parse(url);
}

function expectTreeToBe(actual: UrlTree, expectedUrl: string): void {
  const expected = createUrlTree(expectedUrl);
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
