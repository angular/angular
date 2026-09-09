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
  EnvironmentInjector,
  inject,
  Injector,
  Input,
  input,
  resource,
  Resource,
  ResourceParamsStatus,
  ResourceStatus,
  runInInjectionContext,
  Signal,
  signal,
  ɵpromiseWithResolvers as promiseWithResolvers,
} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {
  provideRouter,
  Router,
  NavigationError,
  withNavigationErrorHandler,
  RedirectCommand,
  withRouterResources,
  withComponentInputBinding,
  withRouterConfig,
  nonBlocking,
  ActivatedRoute,
  Route,
  RouterFeatures,
} from '@angular/router';
import {RouterTestingHarness} from '../testing';
import {timeout, useAutoTick} from '../../private/testing/src/utils';
import {rxResource} from '@angular/core/rxjs-interop';
import {of} from 'rxjs';
import {delay} from 'rxjs/operators';

async function setupRouter(routes: Route[], ...features: RouterFeatures[]) {
  TestBed.configureTestingModule({
    providers: [provideRouter(routes, ...features, withRouterResources())],
  });
  const harness = await RouterTestingHarness.create();
  const router = TestBed.inject(Router);
  return {harness, router};
}

type ActivatedRouteInternal = ActivatedRoute;

@Component({template: ''})
class TargetCmp {}

@Component({template: ''})
class InputBindingCmp {
  @Input() user: any;
  @Input() extra: any;
}

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

      expect(router.url).toBe('/test/1'); // Succeeded!
      expect(resourceRef.status()).toBe('resolved');
      expect(resourceRef.value()).toBe('1');
    });

    it('should block navigation when reloading an existing resource that already has a value', async () => {
      let loaderPromise = promiseWithResolvers<string>();

      const {harness, router} = await setupRouter([
        {
          path: 'test/:id',
          component: TargetCmp,
          resources: (ctx) => ({
            data: resource({
              params: () => ctx.params()['id'],
              loader: async () => loaderPromise.promise,
            }),
          }),
        },
      ]);

      // 1. Initial load
      loaderPromise.resolve('val-1');
      await harness.navigateByUrl('/test/1');
      expect(router.url).toBe('/test/1');

      const resourceRef = (router.routerState.root.firstChild as ActivatedRouteInternal)
        ?.resources?.['data'] as any;
      expect(resourceRef.value()).toBe('val-1');

      // 2. Navigate to /test/2: resets loaderPromise
      loaderPromise = promiseWithResolvers<string>();
      const nav = harness.navigateByUrl('/test/2');
      await timeout();

      // Navigation is blocked on loading even though resource previously had a value
      expect(router.url).toBe('/test/1');

      loaderPromise.resolve('val-2');
      await nav;

      expect(router.url).toBe('/test/2');
      expect(resourceRef.value()).toBe('val-2');
    });

    it('should block navigation when a resource has a defaultValue until loading is complete', async () => {
      const loaderDeferred = promiseWithResolvers<string>();

      const {harness, router} = await setupRouter(
        [
          {
            path: 'test',
            component: InputBindingCmp,
            resources: () => ({
              user: resource({
                defaultValue: 'default-user',
                loader: async () => loaderDeferred.promise,
              }),
            }),
          },
        ],
        withComponentInputBinding(),
      );

      const nav = harness.navigateByUrl('/test', InputBindingCmp);
      await timeout();

      // Navigation is blocked on loading even though the resource has a defaultValue
      expect(router.url).not.toBe('/test');

      loaderDeferred.resolve('loaded-user');
      const cmp = await nav;

      expect(router.url).toBe('/test');
      expect(cmp.user).toBe('loaded-user');

      const resourceRef = (router.routerState.root.firstChild as ActivatedRouteInternal)
        ?.resources?.['user'] as any;
      expect(resourceRef.value()).toBe('loaded-user');
      expect(resourceRef.isLoading()).toBe(false);
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

    it('should redirect when a blocking resource throws a RedirectCommand', async () => {
      const {harness, router} = await setupRouter([
        {
          path: 'test',
          component: TargetCmp,
          resources: () => ({
            data: resource({
              loader: async () => {
                throw new RedirectCommand(TestBed.inject(Router).parseUrl('/redirected'));
              },
            }),
          }),
        },
        {
          path: 'redirected',
          component: TargetCmp,
        },
      ]);

      await harness.navigateByUrl('/test');

      expect(router.url).toBe('/redirected');
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

      expect(resourceRef.isLoading()).toBe(false);
      expect(resourceRef.value()).toBe('rx loaded 123');
    });

    it('should remain blocked when a resource emits a value while remaining in loading state until loading completes', async () => {
      const valueSignal = signal<string | undefined>(undefined);
      const statusSignal = signal<ResourceStatus>('loading');
      const isLoadingSignal = signal<boolean>(true);
      const hasValueSignal = signal<boolean>(false);

      const customResource: Resource<string> = {
        value: valueSignal as Signal<string>,
        status: statusSignal.asReadonly(),
        isLoading: isLoadingSignal.asReadonly(),
        hasValue: (() => hasValueSignal()) as any,
        error: signal<Error | undefined>(undefined).asReadonly(),
        snapshot: computed(
          () =>
            ({
              status: statusSignal(),
              value: valueSignal()!,
            }) as any,
        ),
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

      const nav = harness.navigateByUrl('/stream');
      await timeout();

      // Navigation should be pending because customResource is in loading state
      expect(router.url).not.toBe('/stream');

      // Custom resource emits a value while retaining isLoading() === true and status 'loading'
      valueSignal.set('streamed-1');
      hasValueSignal.set(true);
      await timeout();

      // Navigation should still be blocked because loading state is true
      expect(router.url).not.toBe('/stream');

      // Resource finishes loading
      statusSignal.set('resolved');
      isLoadingSignal.set(false);
      await nav;

      expect(router.url).toBe('/stream');
      const resourceRef = (router.routerState.root.firstChild as ActivatedRouteInternal)
        ?.resources?.['data'] as any;
      expect(resourceRef.value()).toBe('streamed-1');
      expect(resourceRef.isLoading()).toBe(false);
    });

    describe('dependent resources', () => {
      it('should support resources depending on each other on the same route', async () => {
        const {promise: userPromise, resolve: resolveUser} = promiseWithResolvers<{
          id: string;
          teamId: string;
        }>();

        const {harness, router} = await setupRouter([
          {
            path: 'user-team',
            component: TargetCmp,
            resources: () => {
              const user = resource({
                loader: () => userPromise,
              });
              const team = resource({
                params: ({chain}) => chain(user)?.teamId,
                loader: async ({params: teamId}) => ({id: teamId, name: 'Angular Team'}),
              });
              return {user, team};
            },
          },
        ]);

        const nav = harness.navigateByUrl('/user-team');
        await timeout();

        // Navigation is blocked because user is loading and team depends on user
        expect(router.url).not.toBe('/user-team');

        // Resolve user
        resolveUser({id: 'u1', teamId: 't42'});
        await nav;

        expect(router.url).toBe('/user-team');
        const resources = (router.routerState.root.firstChild as ActivatedRouteInternal)
          ?.resources as any;
        expect(resources['user'].value()).toEqual({id: 'u1', teamId: 't42'});
        expect(resources['team'].value()).toEqual({id: 't42', name: 'Angular Team'});
      });

      it('should support child route resource depending on shared signal updated by parent resource', async () => {
        const {promise: parentPromise, resolve: resolveParent} = promiseWithResolvers<any>();
        const {promise: childPromise, resolve: resolveChild} = promiseWithResolvers<any>();

        const sharedUserSignal = signal<any>(undefined);

        const {harness, router} = await setupRouter([
          {
            path: 'user/:id',
            component: TargetCmp,
            resources: () => ({
              user: resource({
                loader: async () => {
                  const user = await parentPromise;
                  sharedUserSignal.set(user);
                  return user;
                },
              }),
            }),
            children: [
              {
                path: 'details',
                component: TargetCmp,
                resources: () => ({
                  details: resource({
                    params: () => sharedUserSignal()?.role,
                    loader: async ({params: role}) => {
                      if (!role) {
                        return new Promise(() => {});
                      }
                      return childPromise;
                    },
                  }),
                }),
              },
            ],
          },
        ]);

        const nav = harness.navigateByUrl('/user/1/details');
        await timeout();

        // Navigation is blocked
        expect(router.url).not.toBe('/user/1/details');

        // Resolve parent
        resolveParent({id: '1', role: 'admin'});
        await timeout();

        // Still blocked on child
        expect(router.url).not.toBe('/user/1/details');

        // Resolve child
        resolveChild({role: 'admin', permissions: ['read', 'write']});
        await nav;

        expect(router.url).toBe('/user/1/details');
        const parentRoute = router.routerState.root.firstChild as ActivatedRouteInternal;
        const childRoute = parentRoute.firstChild as ActivatedRouteInternal;
        expect(parentRoute.resources!['user'].value()).toEqual({id: '1', role: 'admin'});
        expect(childRoute.resources!['details'].value()).toEqual({
          role: 'admin',
          permissions: ['read', 'write'],
        });
      });

      it('should handle parallel dependent resources where parent setup takes longer than child', async () => {
        const parentSetupDeferred = promiseWithResolvers<void>();
        const parentLoaderDeferred = promiseWithResolvers<{id: string; role: string}>();
        const childLoaderDeferred = promiseWithResolvers<string[]>();

        const {harness, router} = await setupRouter([
          {
            path: 'user',
            resources: async () => {
              const injector = inject(Injector);
              // Parent setup is async and delayed
              await parentSetupDeferred.promise;
              return runInInjectionContext(injector, () => ({
                user: resource({
                  loader: () => parentLoaderDeferred.promise,
                }),
              }));
            },
            children: [
              {
                path: 'roles',
                component: TargetCmp,
                resources: (ctx) => ({
                  roles: resource({
                    params: ({chain}) => {
                      const user = ctx.resources()['user'];
                      if (!user) {
                        throw ResourceParamsStatus.LOADING;
                      }
                      return (chain(user) as any).role;
                    },
                    loader: async () => {
                      return childLoaderDeferred.promise;
                    },
                  }),
                }),
              },
            ],
          },
        ]);

        const nav = harness.navigateByUrl('/user/roles');
        await timeout(10);

        // Navigation is blocked: parent setup hasn't finished yet
        expect(router.url).not.toBe('/user/roles');

        // 1. Resolve parent setup function
        parentSetupDeferred.resolve();
        await timeout(10);

        // Navigation is still blocked: parent loader is running
        expect(router.url).not.toBe('/user/roles');

        // 2. Resolve parent loader
        parentLoaderDeferred.resolve({id: '123', role: 'admin'});
        await timeout(10);

        // Navigation is still blocked: child loader received role='admin' and is now running
        expect(router.url).not.toBe('/user/roles');

        // 3. Resolve child loader
        childLoaderDeferred.resolve(['read', 'write', 'admin']);
        await nav;

        expect(router.url).toBe('/user/roles');
        const parentRoute = router.routerState.root.firstChild!;
        const childRoute = parentRoute.firstChild!;

        expect(parentRoute.resources!['user'].value()).toEqual({id: '123', role: 'admin'});
        expect(childRoute.resources!['user'].value()).toEqual({id: '123', role: 'admin'});
        expect(childRoute.resources!['roles'].value()).toEqual(['read', 'write', 'admin']);
      });
    });

    describe('Resource inheritance', () => {
      it('should inherit resources from parent routes to child routes', async () => {
        const {harness, router} = await setupRouter([
          {
            path: 'parent',
            resources: () => ({
              parentData: resource({loader: async () => 'parent-value'}),
            }),
            children: [
              {
                path: 'child',
                component: TargetCmp,
                resources: () => ({
                  childData: resource({loader: async () => 'child-value'}),
                }),
              },
            ],
          },
        ]);

        await harness.navigateByUrl('/parent/child');

        const parentRoute = router.routerState.root.firstChild!;
        const childRoute = parentRoute.firstChild!;

        expect(parentRoute.resources!['parentData'].value()).toBe('parent-value');
        expect(parentRoute.resources!['childData']).toBeUndefined();

        expect(childRoute.resources!['parentData'].value()).toBe('parent-value');
        expect(childRoute.resources!['childData'].value()).toBe('child-value');
        expect(childRoute.snapshot.resources!['parentData'].value()).toBe('parent-value');
        expect(childRoute.snapshot.resources!['childData'].value()).toBe('child-value');
      });

      it('should inherit resources to child routes without own resources config', async () => {
        const {harness, router} = await setupRouter([
          {
            path: 'parent',
            resources: () => ({
              parentData: resource({loader: async () => 'parent-value'}),
            }),
            children: [
              {
                path: 'child',
                component: TargetCmp,
              },
            ],
          },
        ]);

        await harness.navigateByUrl('/parent/child');

        const parentRoute = router.routerState.root.firstChild!;
        const childRoute = parentRoute.firstChild!;

        expect(childRoute.resources!['parentData'].value()).toBe('parent-value');
        expect(childRoute.snapshot.resources!['parentData'].value()).toBe('parent-value');
      });

      it('should allow child resources to override inherited parent resources with the same key', async () => {
        const {harness, router} = await setupRouter([
          {
            path: 'parent',
            resources: () => ({
              shared: resource({loader: async () => 'parent-shared'}),
            }),
            children: [
              {
                path: 'child',
                component: TargetCmp,
                resources: () => ({
                  shared: resource({loader: async () => 'child-shared'}),
                }),
              },
            ],
          },
        ]);

        await harness.navigateByUrl('/parent/child');

        const parentRoute = router.routerState.root.firstChild!;
        const childRoute = parentRoute.firstChild!;

        expect(parentRoute.resources!['shared'].value()).toBe('parent-shared');
        expect(childRoute.resources!['shared'].value()).toBe('child-shared');
      });

      it('should always inherit resources from parent routes regardless of paramsInheritanceStrategy emptyOnly', async () => {
        const {harness, router} = await setupRouter(
          [
            {
              path: 'parent',
              component: TargetCmp,
              resources: () => ({
                data: resource({loader: async () => 'parent-data'}),
              }),
              children: [
                {
                  path: 'non-empty-child',
                  component: TargetCmp,
                },
                {
                  path: '',
                  component: TargetCmp,
                },
              ],
            },
            {
              path: 'componentless',
              resources: () => ({
                data: resource({loader: async () => 'comp-data'}),
              }),
              children: [
                {
                  path: 'sub',
                  component: TargetCmp,
                },
              ],
            },
          ],
          withRouterConfig({paramsInheritanceStrategy: 'emptyOnly'}),
        );

        // 1. Non-empty path child of a component route STILL inherits resources
        await harness.navigateByUrl('/parent/non-empty-child');
        const parentRoute = router.routerState.root.firstChild!;
        const nonEmptyChild = parentRoute.firstChild!;
        expect(nonEmptyChild.resources!['data'].value()).toBe('parent-data');

        // 2. Empty path child inherits resources
        await harness.navigateByUrl('/parent');
        const emptyChild = parentRoute.firstChild!;
        expect(emptyChild.resources!['data'].value()).toBe('parent-data');

        // 3. Child of componentless route inherits resources
        await harness.navigateByUrl('/componentless/sub');
        const compRoute = router.routerState.root.firstChild!;
        const subRoute = compRoute.firstChild!;
        expect(subRoute.resources!['data'].value()).toBe('comp-data');
      });

      it('should leave resources undefined on routes that do not configure or inherit resources', async () => {
        const {harness, router} = await setupRouter([
          {
            path: 'no-resources',
            component: TargetCmp,
          },
        ]);

        await harness.navigateByUrl('/no-resources');

        const route = router.routerState.root.firstChild!;
        expect(route.resources).toBeUndefined();
        expect(route.snapshot.resources).toBeUndefined();
      });

      it('should bind inherited blocking and non-blocking resources to component inputs', async () => {
        const {harness} = await setupRouter(
          [
            {
              path: 'parent',
              resources: () => ({
                user: resource({loader: async () => ({name: 'Alice'})}),
                extra: nonBlocking(resource({loader: async () => 'extra-info'})),
              }),
              children: [
                {
                  path: 'child',
                  component: InputBindingCmp,
                },
              ],
            },
          ],
          withComponentInputBinding(),
        );

        const cmpInstance = await harness.navigateByUrl('/parent/child', InputBindingCmp);

        // Blocking resource binds unwrapped value directly
        expect(cmpInstance.user).toEqual({name: 'Alice'});
        // Non-blocking resource binds Resource instance
        expect(cmpInstance.extra.value()).toBe('extra-info');
      });

      it('should pass routeConfig and reactive resources to ResourceContext without snapshot', async () => {
        let receivedContext: any = null;

        const {harness} = await setupRouter([
          {
            path: 'meta',
            component: TargetCmp,
            title: 'Meta Page',
            resources: (ctx) => {
              receivedContext = ctx;
              return {
                data: nonBlocking(resource({loader: async () => 'ok'})),
              };
            },
          },
        ]);

        await harness.navigateByUrl('/meta');

        expect(receivedContext).not.toBeNull();
        expect(receivedContext.routeConfig?.path).toBe('meta');
        expect(receivedContext.routeConfig?.title).toBe('Meta Page');
        expect(typeof receivedContext.resources).toBe('function');
        expect(receivedContext.snapshot).toBeUndefined();
      });
    });
  });
});
