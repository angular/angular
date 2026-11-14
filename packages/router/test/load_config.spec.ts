/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, inject, InjectionToken} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {
  DefaultExport,
  provideRouter,
  Route,
  Router,
  RouterOutlet,
  PreloadAllModules,
  RouterPreloader,
  withPreloading,
  RouteConfigLoadStart,
  RouteConfigLoadEnd,
} from '../index';
import {RouterTestingHarness} from '../testing';
import {useAutoTick, timeout} from '../../private/testing/src/utils';
import {LazyRouteConfig} from '../src/models';
import {RouterConfigLoader} from '../src/router_config_loader';

// 3p-only-start
declare module '../index' {
  interface Route {
    loadConfig?: () => LazyRouteConfig | Promise<LazyRouteConfig | DefaultExport<LazyRouteConfig>>;
  }
}
// 3p-only-end

const LAZY_TOKEN = new InjectionToken<string>('LAZY_TOKEN');

@Component({
  template: 'simple-cmp: {{ val }}',
})
class SimpleCmp {
  val = inject(LAZY_TOKEN, {optional: true});
}

@Component({
  template: 'parent: <router-outlet></router-outlet>',
  imports: [RouterOutlet],
})
class ParentCmp {}

@Component({
  template: 'child',
})
class ChildCmp {}

@Component({
  template: 'home',
})
class HomeCmp {}

describe('Route loadConfig', () => {
  useAutoTick();

  it('loads config during recognition, creates route injector, and caches config without emitting load events', async () => {
    let loadCount = 0;
    const events: any[] = [];

    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {path: '', component: HomeCmp},
          {
            path: 'lazy',
            component: SimpleCmp,
            loadConfig: () => {
              loadCount++;
              return Promise.resolve({
                providers: [{provide: LAZY_TOKEN, useValue: 'lazy-val'}],
              });
            },
          },
        ]),
      ],
    });

    const router = TestBed.inject(Router);
    router.events.subscribe((e) => events.push(e));

    const harness = await RouterTestingHarness.create('/lazy');
    expect(loadCount).toBe(1);
    expect(harness.routeNativeElement?.innerHTML).toContain('simple-cmp: lazy-val');

    expect(
      events.some((e) => e instanceof RouteConfigLoadStart || e instanceof RouteConfigLoadEnd),
    ).toBeFalse();

    await harness.navigateByUrl('/');
    await harness.navigateByUrl('/lazy');
    expect(loadCount).toBe(1);
  });

  it('invokes the loadConfig loader in the root injection context rather than the parent route injector', async () => {
    const ROOT_TOKEN = new InjectionToken<string>('ROOT_TOKEN', {
      providedIn: 'root',
      factory: () => 'root-val',
    });
    const PARENT_TOKEN = new InjectionToken<string>('PARENT_TOKEN');
    let injectedRootVal: string | null = null;
    let injectedParentVal: string | null = null;

    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'parent',
            providers: [{provide: PARENT_TOKEN, useValue: 'parent-val'}],
            children: [
              {
                path: 'lazy',
                component: SimpleCmp,
                loadConfig: () => {
                  injectedRootVal = inject(ROOT_TOKEN);
                  injectedParentVal = inject(PARENT_TOKEN, {optional: true});
                  return Promise.resolve({
                    providers: [{provide: LAZY_TOKEN, useValue: 'lazy-val'}],
                  });
                },
              },
            ],
          },
        ]),
      ],
    });

    const harness = await RouterTestingHarness.create('/parent/lazy');

    expect(injectedRootVal as string | null).toBe('root-val');
    expect(injectedParentVal).toBeNull();
    expect(harness.routeNativeElement?.innerHTML).toContain('simple-cmp: lazy-val');
  });

  it('evaluates loadConfig sequentially during recognition and loadComponent in parallel post-recognition', async () => {
    let parentConfigLoaded = false;
    let childConfigLoaded = false;
    let parentComponentStarted = false;
    let childComponentStarted = false;

    let resolveComponents!: () => void;
    const componentPromise = new Promise<void>((resolve) => (resolveComponents = resolve));

    const routes: Route[] = [
      {
        path: 'parent',
        loadConfig: async () => {
          parentConfigLoaded = true;
          expect(childConfigLoaded).toBeFalse();
          return {};
        },
        loadComponent: () => {
          parentComponentStarted = true;
          return componentPromise.then(() => ParentCmp);
        },
        children: [
          {
            path: 'child',
            loadConfig: async () => {
              expect(parentConfigLoaded).toBeTrue();
              childConfigLoaded = true;
              return {};
            },
            loadComponent: () => {
              childComponentStarted = true;
              return componentPromise.then(() => ChildCmp);
            },
          },
        ],
      },
    ];

    TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    });

    const harness = await RouterTestingHarness.create();
    const nav = harness.navigateByUrl('/parent/child');
    await timeout();

    expect(parentConfigLoaded).toBeTrue();
    expect(childConfigLoaded).toBeTrue();
    expect(parentComponentStarted).toBeTrue();
    expect(childComponentStarted).toBeTrue();

    resolveComponents();
    await nav;

    expect(harness.routeNativeElement?.innerHTML).toContain('parent:');
    expect(harness.routeNativeElement?.innerHTML).toContain('child');
  });

  it('propagates route injector to child routes', async () => {
    @Component({
      template: 'child: {{ val }}',
    })
    class ChildWithInject {
      val = inject(LAZY_TOKEN);
    }

    const routes: Route[] = [
      {
        path: 'parent',
        component: ParentCmp,
        loadConfig: () =>
          Promise.resolve({
            providers: [{provide: LAZY_TOKEN, useValue: 'from-parent'}],
          }),
        children: [{path: 'child', component: ChildWithInject}],
      },
    ];

    TestBed.configureTestingModule({providers: [provideRouter(routes)]});
    const harness = await RouterTestingHarness.create('/parent/child');
    expect(harness.routeNativeElement?.innerHTML).toContain('child: from-parent');
  });

  it('runs canMatch before loadConfig and skips loadConfig when canMatch returns false', async () => {
    let allow = false;
    let loadCount = 0;
    const order: string[] = [];

    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {path: '', component: HomeCmp},
          {
            path: 'guarded',
            component: SimpleCmp,
            canMatch: [
              () => {
                order.push('canMatch');
                return allow;
              },
            ],
            loadConfig: () => {
              loadCount++;
              order.push('loadConfig');
              return Promise.resolve({
                providers: [{provide: LAZY_TOKEN, useValue: 'lazy-val'}],
              });
            },
          },
          {path: 'guarded', component: HomeCmp},
        ]),
      ],
    });

    const harness = await RouterTestingHarness.create('/guarded');
    expect(harness.routeNativeElement?.innerHTML).toContain('home');
    expect(loadCount).toBe(0);
    expect(order).toEqual(['canMatch']);

    order.length = 0;
    allow = true;
    await harness.navigateByUrl('/');
    await harness.navigateByUrl('/guarded');
    expect(harness.routeNativeElement?.innerHTML).toContain('simple-cmp: lazy-val');
    expect(loadCount).toBe(1);
    expect(order).toEqual(['canMatch', 'loadConfig']);
  });

  it('preloads loadConfig routes with PreloadAllModules', async () => {
    let loaded = false;

    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            {path: '', component: HomeCmp},
            {
              path: 'lazy',
              component: SimpleCmp,
              loadConfig: () => {
                loaded = true;
                return Promise.resolve({title: 'preloaded'});
              },
            },
          ],
          withPreloading(PreloadAllModules),
        ),
      ],
    });

    await RouterTestingHarness.create('/');
    const preloader = TestBed.inject(RouterPreloader);
    await preloader.preload().toPromise();

    expect(loaded).toBeTrue();
    const router = TestBed.inject(Router);
    expect((router.config[1] as any)._configLoaded).toBeTrue();
    expect(router.config[1].title).toBe('preloaded');
  });

  // A configuration is applied to the route with `Object.assign`. Applying it twice would fail
  // validation with a confusing "already defined on the route" error, so the loader must only ever
  // apply a given route's configuration once. Callers rely on being able to request a load without
  // first checking whether one is in flight or has already completed.
  describe('loader caching', () => {
    let loader: RouterConfigLoader;

    beforeEach(() => {
      TestBed.configureTestingModule({providers: [provideRouter([])]});
      loader = TestBed.inject(RouterConfigLoader);
    });

    it('shares a single in-flight request between concurrent loads of the same route', async () => {
      let loadCount = 0;
      let resolveConfig!: (config: Partial<Route>) => void;
      const route: Route = {
        path: 'lazy',
        component: SimpleCmp,
        loadConfig: () => {
          loadCount++;
          return new Promise<Partial<Route>>((resolve) => (resolveConfig = resolve));
        },
      };

      const first = loader.loadConfig(route);
      const second = loader.loadConfig(route);
      expect(loadCount).toBe(1);

      resolveConfig({title: 'loaded'});
      await Promise.all([first, second]);

      expect(loadCount).toBe(1);
      expect(route.title).toBe('loaded');
    });

    it('does nothing when the configuration has already been loaded', async () => {
      let loadCount = 0;
      const route: Route = {
        path: 'lazy',
        component: SimpleCmp,
        loadConfig: async () => {
          loadCount++;
          return {title: 'loaded'};
        },
      };

      await loader.loadConfig(route);
      expect((route as any)._configLoaded).toBeTrue();

      await loader.loadConfig(route);
      expect(loadCount).toBe(1);
      expect(route.title).toBe('loaded');
    });

    it('retries after a failed load', async () => {
      let loadCount = 0;
      const route: Route = {
        path: 'lazy',
        component: SimpleCmp,
        loadConfig: async () => {
          if (loadCount++ === 0) {
            throw new Error('load failed');
          }
          return {title: 'loaded'};
        },
      };

      await expectAsync(loader.loadConfig(route)).toBeRejectedWithError('load failed');
      expect((route as any)._configLoaded).toBeFalsy();

      await loader.loadConfig(route);
      expect(loadCount).toBe(2);
      expect(route.title).toBe('loaded');
    });
  });

  it('throws error when loadConfig is used with redirectTo', () => {
    expect(() => {
      TestBed.configureTestingModule({
        providers: [
          provideRouter([
            {path: 'invalid', redirectTo: 'home', loadConfig: () => Promise.resolve({})},
          ]),
        ],
      });
      TestBed.inject(Router);
    }).toThrowError(/redirectTo and loadConfig cannot be used together/);
  });

  for (const disallowedProp of ['children', 'component', 'data', 'canMatch', 'canLoad']) {
    it(`throws error when loadConfig returns disallowed property '${disallowedProp}'`, async () => {
      TestBed.configureTestingModule({
        providers: [
          provideRouter([
            {
              path: 'disallowed',
              component: SimpleCmp,
              loadConfig: () => Promise.resolve({[disallowedProp]: {}} as any),
            },
          ]),
        ],
      });
      const harness = await RouterTestingHarness.create();
      await expectAsync(harness.navigateByUrl('/disallowed')).toBeRejectedWithError(
        new RegExp(`property '${disallowedProp}' cannot be returned from 'loadConfig'`),
      );
    });
  }

  it('throws error when loadConfig returns a property already defined on the route', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'override',
            component: SimpleCmp,
            title: 'eager',
            loadConfig: () => Promise.resolve({title: 'lazy'}),
          },
        ]),
      ],
    });
    const harness = await RouterTestingHarness.create();
    await expectAsync(harness.navigateByUrl('/override')).toBeRejectedWithError(
      /property 'title' is already defined on the route and cannot be overridden by 'loadConfig'/,
    );
  });

  it('throws error when route has loadConfig without component, loadComponent, redirectTo, children, or loadChildren', () => {
    expect(() => {
      TestBed.configureTestingModule({
        providers: [
          provideRouter([
            {
              path: 'empty-lazy',
              loadConfig: () => Promise.resolve({title: 'lazy'}),
            },
          ]),
        ],
      });
      TestBed.inject(Router);
    }).toThrowError(
      /One of the following must be provided: component, loadComponent, redirectTo, children or loadChildren/,
    );
  });

  it('supports loadConfig on a named outlet route with children', async () => {
    @Component({
      template: 'host: <router-outlet name="aux"></router-outlet>',
      imports: [RouterOutlet],
    })
    class AuxHostCmp {}

    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'host',
            component: AuxHostCmp,
            children: [
              {
                path: 'aux-parent',
                outlet: 'aux',
                loadConfig: () =>
                  Promise.resolve({
                    providers: [{provide: LAZY_TOKEN, useValue: 'aux-val'}],
                  }),
                children: [{path: 'child', component: SimpleCmp}],
              },
            ],
          },
        ]),
      ],
    });

    const harness = await RouterTestingHarness.create('/host/(aux:aux-parent/child)');
    expect(harness.routeNativeElement?.innerHTML).toContain('simple-cmp: aux-val');
  });

  it('preloads loadConfig before loadComponent and child routes so lazy providers are available', async () => {
    const order: string[] = [];
    let injectedInLoadComponent: string | null | undefined;
    let injectedInChildLoadComponent: string | null | undefined;

    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            {path: '', component: HomeCmp},
            {
              path: 'lazy',
              loadConfig: async () => {
                order.push('loadConfig');
                return {
                  providers: [{provide: LAZY_TOKEN, useValue: 'preloaded-token'}],
                };
              },
              loadComponent: () => {
                order.push('loadComponent');
                injectedInLoadComponent = inject(LAZY_TOKEN, {optional: true});
                return Promise.resolve(ParentCmp);
              },
              children: [
                {
                  path: 'child',
                  loadComponent: () => {
                    order.push('childLoadComponent');
                    injectedInChildLoadComponent = inject(LAZY_TOKEN, {optional: true});
                    return Promise.resolve(ChildCmp);
                  },
                },
              ],
            },
          ],
          withPreloading(PreloadAllModules),
        ),
      ],
    });

    await RouterTestingHarness.create('/');
    const preloader = TestBed.inject(RouterPreloader);
    await preloader.preload().toPromise();

    expect(order[0]).toBe('loadConfig');
    expect(injectedInLoadComponent).toBe('preloaded-token');
    expect(injectedInChildLoadComponent).toBe('preloaded-token');
  });
});
