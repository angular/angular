/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Component,
  computed,
  EnvironmentProviders,
  resource,
  Resource,
  ResourceStatus,
  Signal,
  signal,
  ɵpromiseWithResolvers as promiseWithResolvers,
} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {
  provideRouter as internalProvideRouter,
  Router,
  NavigationError,
  withNavigationErrorHandler,
  RedirectCommand,
  ɵwithRouterResources as withRouterResources,
  ɵnonBlocking as nonBlocking,
  ActivatedRoute,
  Route,
  ɵResourceContext as ResourceContext,
  ɵResourceResult as ResourceResult,
  RouterFeatures,
} from '@angular/router';
import {RouterTestingHarness} from '../testing';
import {timeout, useAutoTick} from '../../private/testing/src/utils';
import {rxResource} from '@angular/core/rxjs-interop';
import {of} from 'rxjs';
import {delay} from 'rxjs/operators';

// TODO: Use the public @angular/router API once exposed
type InternalRoute = Route & {
  /**
   * A function that returns a map of resources.
   * This function is executed during the Main Loading Phase of a navigation.
   * @experimental
   * @internal
   */
  resources?: (ctx: ResourceContext) => ResourceResult | Promise<ResourceResult>;
  children?: InternalRoute[];
};

export function provideRouter(
  routes: InternalRoute[],
  ...features: RouterFeatures[]
): EnvironmentProviders {
  return internalProvideRouter(routes, withRouterResources(), ...features);
}

async function setupRouter(routes: InternalRoute[], ...features: RouterFeatures[]) {
  TestBed.configureTestingModule({
    providers: [provideRouter(routes, ...features)],
  });
  const harness = await RouterTestingHarness.create();
  const router = TestBed.inject(Router);
  return {harness, router};
}

type ActivatedRouteInternal = ActivatedRoute & {
  resources?: {[key: string]: Resource<unknown>};
};

@Component({template: ''})
class TargetCmp {}

describe('Router resources integration', () => {
  useAutoTick();

  describe('Route Configuration and Execution', () => {
    it('should execute resources on initial navigation and expose the result', async () => {
      const loaderSpy = jasmine.createSpy('loader').and.resolveTo('loaded');

      const {harness, router} = await setupRouter([
        {
          path: 'test',
          component: TargetCmp,
          resources: () => ({
            data: nonBlocking(resource({loader: loaderSpy})),
          }),
        },
      ]);

      await harness.navigateByUrl('/test');
      await harness.fixture.whenStable();
      expect(loaderSpy).toHaveBeenCalled();

      const resourceRef = (router.routerState.root.firstChild as ActivatedRouteInternal)
        ?.resources?.['data'] as any;
      expect(resourceRef.value()).toBe('loaded');
    });

    it('should support async resource functions returning a Promise', async () => {
      const loaderDeferred = promiseWithResolvers<string>();

      const {harness, router} = await setupRouter([
        {
          path: 'test',
          component: TargetCmp,
          resources: async () => {
            const data = nonBlocking(
              resource({
                loader: async () => loaderDeferred.promise,
              }),
            );
            await timeout(10);
            return {data};
          },
        },
      ]);

      await router.navigateByUrl('/test');

      expect(router.url).toBe('/test');

      const route = router.routerState.root.firstChild as ActivatedRouteInternal;
      const resourceRef = route?.resources?.['data'] as any;
      expect(resourceRef).toBeDefined();
      expect(resourceRef.isLoading()).toBe(true);
      expect(resourceRef.value()).toBeUndefined();

      loaderDeferred.resolve('async loaded');
      await harness.fixture.whenStable();

      expect(resourceRef.isLoading()).toBe(false);
      expect(resourceRef.value()).toBe('async loaded');
    });

    it('should support async resource functions returning a Promise (blocking)', async () => {
      const {harness, router} = await setupRouter([
        {
          path: 'test',
          component: TargetCmp,
          resources: async () => {
            const data = resource({loader: async () => 'async loaded'});
            await timeout(10);
            return {data};
          },
        },
      ]);

      await harness.navigateByUrl('/test');
      await harness.fixture.whenStable();

      const route = router.routerState.root.firstChild as ActivatedRouteInternal;
      const resourceRef = route?.resources?.['data'] as any;
      expect(resourceRef).toBeDefined();
      expect(resourceRef.value()).toBe('async loaded');
    });

    it('should await blocking resource resolution even when resources function is async', async () => {
      const loaderDeferred = promiseWithResolvers<string>();

      const {harness, router} = await setupRouter([
        {
          path: 'test',
          component: TargetCmp,
          resources: async () => {
            const data = resource({loader: () => loaderDeferred.promise});
            await timeout(10);
            return {data};
          },
        },
      ]);

      const navPromise = harness.navigateByUrl('/test');

      // 1. Wait past the async resources function delay (10ms)
      await timeout(15);
      harness.fixture.detectChanges();

      // Navigation must STILL be pending because the blocking resource loader hasn't resolved yet
      expect(router.url).not.toBe('/test');

      // 2. Now resolve the blocking resource loader
      loaderDeferred.resolve('resolved data');
      await navPromise;
      await harness.fixture.whenStable();

      expect(router.url).toBe('/test');
      const route = router.routerState.root.firstChild as ActivatedRouteInternal;
      const resourceRef = route?.resources?.['data'] as any;
      expect(resourceRef.value()).toBe('resolved data');
    });

    it('should cleanly ignore resolution of async resource function if navigation was cancelled', async () => {
      const firstResources = promiseWithResolvers<void>();

      const {harness, router} = await setupRouter([
        {
          path: 'first',
          component: TargetCmp,
          resources: () => {
            const data = nonBlocking(resource({loader: async () => 'first data'}));
            return firstResources.promise.then(() => ({data}));
          },
        },
        {
          path: 'second',
          component: TargetCmp,
          resources: () => ({
            data: nonBlocking(resource({loader: async () => 'second data'})),
          }),
        },
      ]);

      // Start navigation to /first (which will block waiting on firstResourcesPromise)
      const nav1 = harness.navigateByUrl('/first');
      await timeout(10);

      // Supersede with navigation to /second
      await harness.navigateByUrl('/second');
      await harness.fixture.whenStable();

      expect(router.url).toBe('/second');

      // Now resolve the cancelled /first resources promise
      firstResources.resolve();
      await harness.fixture.whenStable();

      // Navigation should remain on /second
      expect(router.url).toBe('/second');
    });

    it('should cleanly ignore resolution of async resource function if navigation was cancelled (blocking)', async () => {
      const firstResources = promiseWithResolvers<void>();

      const {harness, router} = await setupRouter([
        {
          path: 'first',
          component: TargetCmp,
          resources: () => {
            const data = resource({loader: async () => 'first data'});
            return firstResources.promise.then(() => ({data}));
          },
        },
        {
          path: 'second',
          component: TargetCmp,
          resources: () => ({
            data: resource({loader: async () => 'second data'}),
          }),
        },
      ]);

      // Start navigation to /first (which will block waiting on firstResourcesPromise)
      const nav1 = harness.navigateByUrl('/first');
      await timeout(10);

      // Supersede with navigation to /second
      await harness.navigateByUrl('/second');
      await harness.fixture.whenStable();

      expect(router.url).toBe('/second');

      // Now resolve the cancelled /first resources promise
      firstResources.resolve();
      await harness.fixture.whenStable();

      // Navigation should remain on /second
      expect(router.url).toBe('/second');
    });

    it('should fail navigation when async resources function rejects', async () => {
      const {harness, router} = await setupRouter([
        {
          path: 'test',
          component: TargetCmp,
          resources: async () => {
            throw new Error('Async setup failed');
          },
        },
      ]);

      await expectAsync(harness.navigateByUrl('/test')).toBeRejectedWithError(/Async setup failed/);
      expect(router.url).not.toContain('/test');
    });

    it('should not recreate and re-execute resources on subsequent navigations to the same route', async () => {
      let callCount = 0;

      const {harness} = await setupRouter([
        {
          path: 'test/:id',
          component: TargetCmp,
          resources: (ctx) => ({
            data: nonBlocking(
              resource({
                params: () => ctx.params(),
                loader: async () => {
                  callCount++;
                  return 'loaded';
                },
              }),
            ),
          }),
        },
      ]);

      await harness.navigateByUrl('/test/1');
      expect(callCount).toBe(1);

      // Navigating to the identical URL should not trigger a refetch
      await harness.navigateByUrl('/test/1');
      expect(callCount).toBe(1);
    });

    it('should support resources on componentless routes', async () => {
      const {harness, router} = await setupRouter([
        {
          path: 'parent',
          resources: () => ({
            parentData: nonBlocking(resource({loader: async () => 'parent'})),
          }),
          children: [
            {
              path: 'componentless',
              resources: () => ({
                compData: nonBlocking(resource({loader: async () => 'comp'})),
              }),
              children: [{path: 'child', component: TargetCmp}],
            },
          ],
        },
      ]);

      await harness.navigateByUrl('/parent/componentless/child');
      await harness.fixture.whenStable();
      await timeout(20);

      const parentRoute = router.routerState.root.firstChild!;
      const componentlessRoute = parentRoute.firstChild!;

      expect(
        ((parentRoute as ActivatedRouteInternal).resources?.['parentData'] as any).value(),
      ).toBe('parent');
      expect(
        ((componentlessRoute as ActivatedRouteInternal).resources?.['compData'] as any).value(),
      ).toBe('comp');
    });

    it('should throw an error in dev mode if resource function does not return a Resource', async () => {
      const {harness} = await setupRouter([
        {
          path: 'test',
          component: TargetCmp,
          resources: () => ({
            data: {foo: 'bar'} as any,
          }),
        },
      ]);

      await expectAsync(harness.navigateByUrl('/test')).toBeRejectedWithError(
        /Invalid resource returned for key "data"/,
      );
    });
  });

  describe('Blocking vs Non-blocking Resources', () => {
    it('should resolve resources before component initialization if blocking', async () => {
      let resolverSpy = jasmine.createSpy('resolver');
      const deferred = promiseWithResolvers<string>();

      const {harness, router} = await setupRouter([
        {
          path: 'test',
          component: TargetCmp,
          resources: () => ({
            data: resource({
              loader: async () => {
                resolverSpy();
                return await deferred.promise;
              },
            }),
          }),
        },
      ]);

      let completed = false;
      const navPromise = harness.navigateByUrl('/test').then(() => {
        completed = true;
      });

      await timeout(10);
      expect(completed).toBe(false);
      expect(router.url).toBe('/');
      expect(resolverSpy).toHaveBeenCalled();

      deferred.resolve('resolved');
      await navPromise;
      expect(completed).toBe(true);
      expect(router.url).toBe('/test');
    });

    it('should cancel navigation when blocking resource yields error', async () => {
      const {harness, router} = await setupRouter([
        {
          path: 'test',
          component: TargetCmp,
          resources: () => ({
            data: resource({
              loader: () => Promise.reject('test error'),
            }),
          }),
        },
      ]);

      await harness.navigateByUrl('/test').catch(() => {});
      expect(router.url).not.toContain('/test');
    });

    it('should emit NavigationError when blocking resource rejects', async () => {
      const {harness, router} = await setupRouter([
        {
          path: 'test',
          component: TargetCmp,
          resources: () => ({
            data: resource({
              loader: () => Promise.reject('test error'),
            }),
          }),
        },
      ]);

      const error = await new Promise((resolve) => {
        router.events.subscribe((e) => {
          if (e instanceof NavigationError) resolve(e.error);
        });
        harness.navigateByUrl('/test').catch(() => {});
      });
      expect(typeof error).toBe('object');
      expect(error).toBeDefined();
    });

    it('should allow retrying a blocking route that previously threw an error', async () => {
      let shouldError = false;

      const {harness, router} = await setupRouter([
        {
          path: 'test/:id',
          component: TargetCmp,
          resources: () => ({
            data: resource({
              loader: async () => {
                if (shouldError) throw new Error('Failed');
                return '1';
              },
            }),
          }),
        },
      ]);

      // 1. Initial navigation succeeds
      await harness.navigateByUrl('/test/1');
      await harness.fixture.whenStable();
      expect(router.url).toBe('/test/1');

      const resourceRef = (router.routerState.root.firstChild as ActivatedRouteInternal)
        ?.resources?.['data'] as any;
      expect(resourceRef.value()).toBe('1');

      // 2. Resource encounters an error while on the route
      shouldError = true;
      resourceRef.reload();
      await harness.fixture.whenStable();
      expect(resourceRef.status()).toBe('error');

      // 3. Retry the identical route with same parameters using onSameUrlNavigation: 'reload'
      shouldError = false;
      await router.navigateByUrl('/test/1', {onSameUrlNavigation: 'reload'});
      await harness.fixture.whenStable();

      expect(router.url).toBe('/test/1'); // Succeeded!
      expect(resourceRef.status()).toBe('resolved');
      expect(resourceRef.value()).toBe('1');
    });

    it('should complete navigation and expose error for non-blocking resources', async () => {
      const {harness, router} = await setupRouter([
        {
          path: 'test',
          component: TargetCmp,
          resources: () => ({
            data: nonBlocking(
              resource({
                loader: async () => {
                  throw new Error('Non-blocking error');
                },
              }),
            ),
          }),
        },
      ]);

      // Non-blocking resource error doesn't cancel navigation
      await harness.navigateByUrl('/test');
      await harness.fixture.whenStable();

      expect(router.url).toBe('/test');
      const resourceRef = (router.routerState.root.firstChild as ActivatedRouteInternal)
        ?.resources?.['data'] as any;
      expect(resourceRef.error()?.message).toBe('Non-blocking error');
      expect(resourceRef.isLoading()).toBe(false);
    });

    it('should complete navigation when a resource is idle and not loading', async () => {
      const {harness, router} = await setupRouter([
        {
          path: 'search',
          component: TargetCmp,
          resources: (ctx) => ({
            data: resource({
              params: () => ctx.queryParams()['q'],
              loader: async ({params}) => `Query: ${params}`,
            }),
          }),
        },
      ]);

      // Navigate without query params -> params() is undefined -> resource is idle
      await harness.navigateByUrl('/search');
      await harness.fixture.whenStable();

      expect(router.url).toBe('/search');
      const resourceRef = (router.routerState.root.firstChild as ActivatedRouteInternal)
        ?.resources?.['data'] as any;
      expect(resourceRef.status()).toBe('idle');
      expect(resourceRef.value()).toBeUndefined();
    });
  });

  describe('Integration with Router Features', () => {
    it('should work with resolvers', async () => {
      const {harness, router} = await setupRouter([
        {
          path: 'test',
          component: TargetCmp,
          resolve: {id: () => '123'},
          resources: (ctx) => ({
            data: nonBlocking(
              resource({
                params: () => ctx.data(),
                loader: async ({params}: any) => ({name: `user ${params['id']}`}),
              }),
            ),
          }),
        },
      ]);

      await harness.navigateByUrl('/test');
      await harness.fixture.whenStable();
      const resourceRef = (router.routerState.root.firstChild as ActivatedRouteInternal)
        ?.resources?.['data'] as any;

      await timeout(20);
      expect(resourceRef.value()).toEqual({name: 'user 123'});
    });

    it('should rollback parameter state on failed navigation', async () => {
      let canActivate = true;

      const {harness, router} = await setupRouter([
        {
          path: 'test/:id',
          component: TargetCmp,
          canActivate: [
            async () => {
              await timeout(10);
              return canActivate;
            },
          ],
          resources: (ctx) => ({
            data: nonBlocking(
              resource({
                params: () => ctx.params(),
                loader: async ({params}: any) => params['id'],
              }),
            ),
          }),
        },
      ]);

      await harness.navigateByUrl('/test/1');
      await harness.fixture.whenStable();
      const resourceRef = (router.routerState.root.firstChild as ActivatedRouteInternal)
        ?.resources?.['data'] as any;
      expect(resourceRef.value()).toBe('1');

      // Fail next navigation
      canActivate = false;
      await harness.navigateByUrl('/test/2');
      await harness.fixture.whenStable();

      // The navigation is cancelled so the resource should retain the old value without loading flicker.
      expect(resourceRef.value()).toBe('1');
      expect(resourceRef.isLoading()).toBe(false);
    });

    it('should abort previous request via AbortSignal when a new navigation comes in', async () => {
      const deferred = promiseWithResolvers<{name: string}>();
      let aborted = false;

      const {harness, router} = await setupRouter([
        {
          path: 'user/:id',
          component: TargetCmp,
          resources: (ctx) => ({
            user: nonBlocking(
              resource({
                params: () => ctx.params(),
                loader: async ({params, abortSignal}: any) => {
                  abortSignal.addEventListener('abort', () => (aborted = true));
                  if (params['id'] === '1') return deferred.promise;
                  return {name: 'user 2'};
                },
              }),
            ),
          }),
        },
      ]);

      harness.navigateByUrl('/user/1');
      await timeout(10);

      await harness.navigateByUrl('/user/2');
      await harness.fixture.whenStable();
      expect(aborted).toBe(true);

      const userResource = (router.routerState.root.firstChild as ActivatedRouteInternal)
        ?.resources?.['user'] as any;
      expect(userResource?.value()).toEqual({name: 'user 2'});

      // Resolving the old promise should have no effect
      deferred.resolve({name: 'user 1'});
      await timeout(10);
      expect(userResource.value()).toEqual({name: 'user 2'});
    });

    it('should correctly propagate parameter state when a pending navigation supersedes identically reused routes', async () => {
      const p2 = new Promise(() => {}); // never resolves
      const p3 = promiseWithResolvers<string>();

      let loadedParams: any[] = [];

      const {harness, router} = await setupRouter([
        {
          path: 'test/:id',
          component: TargetCmp,
          resources: (ctx: any) => ({
            data: resource({
              params: () => ctx.params(),
              loader: async ({params}: any) => {
                loadedParams.push(params['id']);
                if (params['id'] === '2') return p2;
                if (params['id'] === '3') return p3.promise;
                return params['id'];
              },
            }),
          }),
        },
      ]);

      await harness.navigateByUrl('/test/1');

      // Trigger nav2 and let it pend.
      harness.navigateByUrl('/test/2');
      await timeout(10);

      // Supersede with identical route (/test/2 -> /test/3)
      const nav3 = harness.navigateByUrl('/test/3');
      await timeout(10);

      expect(loadedParams).toEqual(['1', '2', '3']);

      p3.resolve('loaded-3');
      await nav3;
      await harness.fixture.whenStable();

      const resourceRef = (router.routerState.root.firstChild as ActivatedRouteInternal)
        ?.resources?.['data'] as any;
      expect(resourceRef.value()).toBe('loaded-3');
    });

    it('should mask loading states during multi-step Guard UrlTree redirects', async () => {
      let loader = promiseWithResolvers<string>();

      const {harness, router} = await setupRouter([
        {
          path: 'target/:id',
          component: TargetCmp,
          resources: (ctx: any) => ({
            data: resource({
              params: () => ctx.params(),
              loader: async () => loader.promise,
            }),
          }),
        },
        {
          path: 'bad-link',
          canActivate: [() => TestBed.inject(Router).createUrlTree(['/target/3'])],
          component: TargetCmp,
        },
      ]);

      // Settle initial state
      loader.resolve('1');
      await harness.navigateByUrl('/target/1');
      await harness.fixture.whenStable();

      const resourceRef = (router.routerState.root.firstChild as ActivatedRouteInternal)
        ?.resources?.['data'] as any;
      expect(resourceRef.value()).toBe('1');
      expect(resourceRef.isLoading()).toBe(false);

      loader = promiseWithResolvers<string>();

      // Initiate a navigation to a link that Redirects using a UrlTree Guard.
      const nav2 = harness.navigateByUrl('/bad-link');
      await timeout(50);

      // UI is still masked looking like '1'
      expect(resourceRef.isLoading()).toBe(false);
      expect(resourceRef.value()).toBe('1');

      loader.resolve('3');
      await nav2;
      await harness.fixture.whenStable();

      expect(resourceRef.isLoading()).toBe(false);
      expect(resourceRef.value()).toBe('3');
    });

    it('should be able to redirect from a blocking resource using a NavigationErrorHandler', async () => {
      let handleCount = 0;
      let errorRef: unknown = null;

      const {harness, router} = await setupRouter(
        [
          {
            path: 'test',
            component: TargetCmp,
            resources: () => ({
              data: resource({
                loader: async () => {
                  throw new Error('Resource failed!');
                },
              }),
            }),
          },
          {
            path: 'error',
            component: TargetCmp,
          },
        ],
        withNavigationErrorHandler((e: NavigationError) => {
          handleCount++;
          errorRef = e.error;
          return new RedirectCommand(TestBed.inject(Router).parseUrl('/error'));
        }),
      );

      await harness.navigateByUrl('/test');

      expect(router.url).toBe('/error');
      expect(handleCount).toBe(1);
      expect((errorRef as Error).message).toBe('Resource failed!');
    });
  });

  describe('rxResource Integration', () => {
    it('should successfully wrap and await an rxResource', async () => {
      const {harness, router} = await setupRouter([
        {
          path: 'rx/:id',
          component: TargetCmp,
          resources: (ctx) => ({
            data: rxResource({
              params: () => ctx.params(),
              stream: ({params}: any) => of(`rx loaded ${params['id']}`).pipe(delay(10)),
            }),
          }),
        },
      ]);

      const nav = harness.navigateByUrl('/rx/123');
      await timeout(5);

      const resourceRef = (router.routerState.root.firstChild as ActivatedRouteInternal)
        ?.resources?.['data'] as any;
      expect(resourceRef.isLoading()).toBe(true);
      expect(resourceRef.value()).toBeUndefined();

      await nav;
      await harness.fixture.whenStable();

      expect(resourceRef.isLoading()).toBe(false);
      expect(resourceRef.value()).toBe('rx loaded 123');
    });

    it('should unblock navigation when a resource emits a value even while remaining in loading state', async () => {
      const valueSignal = signal<string | undefined>(undefined);
      const hasValueSignal = signal<boolean>(false);

      const customResource: Resource<string> = {
        value: valueSignal as Signal<string>,
        status: signal<ResourceStatus>('loading').asReadonly(),
        isLoading: signal(true).asReadonly(),
        hasValue: (() => hasValueSignal()) as any,
        error: signal<Error | undefined>(undefined).asReadonly(),
        snapshot: computed(() => ({
          status: 'loading' as const,
          value: valueSignal()!,
        })),
      };

      const {harness, router} = await setupRouter([
        {
          path: 'stream',
          component: TargetCmp,
          resources: () => ({
            data: customResource,
          }),
        },
      ]);

      harness.navigateByUrl('/stream');
      await timeout();

      // Navigation should be pending because customResource has no value yet
      expect(router.url).not.toBe('/stream');

      // Custom resource emits a value while retaining isLoading() === true and status 'loading'
      valueSignal.set('streamed-1');
      hasValueSignal.set(true);
      await harness.fixture.whenStable();

      expect(router.url).toBe('/stream');
      const resourceRef = (router.routerState.root.firstChild as ActivatedRouteInternal)
        ?.resources?.['data'] as any;
      expect(resourceRef.value()).toBe('streamed-1');
      expect(resourceRef.isLoading()).toBe(true);

      // Verify subsequent value update while still in loading state
      valueSignal.set('streamed-2');
      await harness.fixture.whenStable();
      expect(resourceRef.value()).toBe('streamed-2');
    });
  });
});
