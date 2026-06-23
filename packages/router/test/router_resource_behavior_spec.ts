/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license $can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, signal, WritableSignal, resource, ɵpromiseWithResolvers} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {provideRouter, Router, UrlTree} from '@angular/router';
import {RouterTestingHarness} from '@angular/router/testing';
import {routerResource} from '../src/router_resource';
import {timeout, useAutoTick} from '../../private/testing/src/utils';
import {rxResource} from '@angular/core/rxjs-interop';
import {Subject} from 'rxjs';

@Component({
  standalone: true,
  template: '',
})
class DummyComponent {}

describe('routerResource behavior tests', () => {
  useAutoTick();
  let router: Router;
  let harness: RouterTestingHarness;

  let guardPromise2: Promise<boolean | UrlTree>;
  let resolveGuard2: (val: boolean | UrlTree) => void;

  let guardPromise3: Promise<boolean | UrlTree>;
  let resolveGuard3: (val: boolean | UrlTree) => void;

  let paramSignal: WritableSignal<string>;
  let resolveLoader: (value: string) => void;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {path: 'route1', component: DummyComponent},
          {
            path: 'route2',
            component: DummyComponent,
            canActivate: [() => guardPromise2],
          },
          {
            path: 'route3',
            component: DummyComponent,
            canActivate: [() => guardPromise3],
          },
          {path: 'route4', component: DummyComponent},
        ]),
      ],
    });

    router = TestBed.inject(Router);
    harness = await RouterTestingHarness.create();

    // Navigate to /route1 to start at a settled state
    await harness.navigateByUrl('/route1');
    await harness.fixture.whenStable();
  });

  // Helper to create a real resource controlled in tests
  // Resolves the very first load immediately to 'initial', and returns a pending promise for subsequent loads.
  function createRealResource() {
    paramSignal = signal('initial');
    let resolveImmediately = true;

    return resource({
      params: () => paramSignal(),
      loader: () => {
        if (resolveImmediately) {
          resolveImmediately = false;
          return Promise.resolve('initial');
        }
        return new Promise<string>((resolve) => {
          resolveLoader = resolve;
        });
      },
    });
  }

  // Helper to create a wrapped resource controlled in tests inside injection context
  function createWrappedResource() {
    return TestBed.runInInjectionContext(() => routerResource(createRealResource()));
  }

  describe('Basic Snapshot Propagation and Symbols', () => {
    it("should propagate the source resource's snapshot", async () => {
      const wrapped = createWrappedResource();
      await timeout();

      expect(wrapped.status()).toBe('resolved');
      expect(wrapped.value()).toBe('initial');

      // Update source by changing param and resolving the loader
      paramSignal.set('updated');
      await timeout(); // Let the loader trigger
      resolveLoader('updated');
      await harness.fixture.whenStable();

      expect(wrapped.status()).toBe('resolved');
      expect(wrapped.value()).toBe('updated');
    });
  });

  describe('Transactional Freezing during Navigation', () => {
    it('should freeze the snapshot at the start of navigation', async () => {
      const wrapped = createWrappedResource();
      await timeout();

      // Setup pending navigation to /route2
      guardPromise2 = new Promise((resolve) => (resolveGuard2 = resolve));
      const navPromise = harness.navigateByUrl('/route2');
      await timeout();

      // Update source snapshot while navigating (should be frozen)
      paramSignal.set('updated');
      await timeout(); // Loader triggers

      // Should still be frozen at 'initial'
      expect(wrapped.value()).toBe('initial');
      const snapshot = wrapped.snapshot();
      expect(snapshot.status).toBe('resolved');
      if (snapshot.status === 'resolved') {
        expect(snapshot.value).toBe('initial');
      }

      // Complete navigation to avoid leaving router in pending state
      resolveLoader('updated'); // Settle the resource loader
      resolveGuard2(true);
      await navPromise;
      await harness.fixture.whenStable();
    });

    it('should unfreeze the snapshot when navigation succeeds', async () => {
      const wrapped = createWrappedResource();
      await timeout();

      guardPromise2 = new Promise((resolve) => (resolveGuard2 = resolve));
      const navPromise = harness.navigateByUrl('/route2');
      await timeout();

      paramSignal.set('updated');
      await timeout();

      expect(wrapped.value()).toBe('initial');

      // Let navigation succeed and resource resolve
      resolveLoader('updated');
      resolveGuard2(true);
      await navPromise;
      await harness.fixture.whenStable();

      // Should now be unfrozen and updated
      expect(wrapped.value()).toBe('updated');
    });

    it('should unfreeze the snapshot when navigation is skipped', async () => {
      const wrapped = createWrappedResource();
      await timeout();

      // Navigate to same URL (/route1) to trigger skipped navigation
      const navPromise = harness.navigateByUrl('/route1');
      await timeout();

      paramSignal.set('updated');
      await timeout();
      resolveLoader('updated');

      await navPromise;
      await harness.fixture.whenStable();

      // Should be unfrozen and updated
      expect(wrapped.value()).toBe('updated');
    });
  });

  describe('Rollback Recovery', () => {
    it('should maintain the freeze when navigation is cancelled due to redirect or being superseded', async () => {
      const wrapped = createWrappedResource();
      await timeout();

      // Block route3 with a pending guard so we can pause and inspect the redirect transition
      guardPromise3 = new Promise((resolve) => (resolveGuard3 = resolve));

      guardPromise2 = new Promise((resolve) => (resolveGuard2 = resolve));
      const navPromise = harness.navigateByUrl('/route2');
      await timeout();

      paramSignal.set('updated');
      await timeout();

      // Trigger redirect to /route3
      resolveLoader('updated');
      resolveGuard2(router.createUrlTree(['/route3']));
      await timeout(); // Let nav 1 cancel and redirect nav start

      // The resource should REMAIN frozen at 'initial' during the active redirect navigation
      expect(wrapped.value()).toBe('initial');

      // Now complete the redirect navigation
      resolveGuard3(true);
      await navPromise;
      await harness.fixture.whenStable();

      // Once the redirect completes, it should unfreeze
      expect(wrapped.value()).toBe('updated');
    });

    it('should initiate rollback recovery and remain frozen on true rollback until source finishes loading', async () => {
      const wrapped = createWrappedResource();
      await timeout();

      guardPromise2 = new Promise((resolve) => (resolveGuard2 = resolve));
      const navPromise = harness.navigateByUrl('/route2');
      await timeout();

      // Change source value (simulating parameter rollback triggering a new reload of the old value)
      paramSignal.set('rolled-back');
      await timeout();

      // Reject guard to trigger true rollback
      resolveGuard2(false);
      await navPromise;
      await timeout();

      // Should still be frozen during recovery loading (status must remain 'resolved', not 'reloading'!)
      expect(wrapped.status()).toBe('resolved');
      expect(wrapped.value()).toBe('initial');

      // Complete loading the rolled-back state
      resolveLoader('rolled-back-settled');
      await harness.fixture.whenStable();

      // Now it should be unfrozen and show the settled rolled-back state
      expect(wrapped.status()).toBe('resolved');
      expect(wrapped.value()).toBe('rolled-back-settled');
    });

    it('should unfreeze immediately on rollback if the frozen state was not a settled, non error state', async () => {
      const errorParamSignal = signal('initial');
      const {promise: initialErrorPromise, reject: rejectInitial} = ɵpromiseWithResolvers<string>();
      initialErrorPromise.catch(() => {}); // Prevent unhandled promise rejection error. When integrated into Router, we catch these there.

      const wrapped = TestBed.runInInjectionContext(() => {
        return routerResource(
          resource({
            params: () => errorParamSignal(),
            loader: ({params}) => {
              if (params === 'initial') {
                return initialErrorPromise;
              }
              return new Promise<string>((resolve) => {
                resolveLoader = resolve;
              });
            },
          }),
        );
      });

      rejectInitial(new Error('Initial error'));
      await harness.fixture.whenStable();

      expect(wrapped.status()).toBe('error');

      guardPromise2 = new Promise((resolve) => (resolveGuard2 = resolve));
      const navPromise = harness.navigateByUrl('/route2');
      await timeout();

      // Reject guard to trigger true rollback
      resolveGuard2(false);
      await navPromise;
      await timeout();

      // If it unfroze immediately, changing the parameter should immediately transition the wrapper to 'loading'.
      // (If it was still frozen, it would remain insulated in the 'error' state).
      errorParamSignal.set('new-param');
      await timeout();
      harness.fixture.detectChanges();

      expect(wrapped.status()).toBe('loading');

      // Resolve the loader to complete the verification
      resolveLoader('recovered-data');
      await harness.fixture.whenStable();

      expect(wrapped.status()).toBe('resolved');
      expect(wrapped.value()).toBe('recovered-data');
    });
  });

  describe('Multi-Navigation Interactions', () => {
    it('should ignore events from older navigations', async () => {
      const wrapped = createWrappedResource();
      await timeout();

      // Start Nav 1 (to /route2)
      guardPromise2 = new Promise((resolve) => (resolveGuard2 = resolve));
      const nav1Promise = harness.navigateByUrl('/route2');
      await timeout();

      // Start Nav 2 (to /route3), which cancels Nav 1
      guardPromise3 = new Promise((resolve) => (resolveGuard3 = resolve));
      const nav2Promise = harness.navigateByUrl('/route3');
      await timeout();

      paramSignal.set('updated');
      await timeout();

      // Resolve Nav 1's guard (should have no effect because Nav 1 was cancelled/superseded)
      resolveLoader('updated');
      resolveGuard2(true);
      await timeout(); // Wait a moment for events to process (Nav 1's promise is rejected in the background)

      expect(wrapped.value()).toBe('initial'); // Still frozen by Nav 2

      // Let Nav 2 complete
      resolveGuard3(true);
      await nav2Promise;
      await harness.fixture.whenStable();

      expect(wrapped.value()).toBe('updated'); // Unfrozen!

      // Clean up Nav 1 promise rejection
      await nav1Promise.catch(() => {});
    });

    it('should clear rollback recovery if a new navigation starts', async () => {
      const wrapped = createWrappedResource();
      await timeout();

      // Start Nav 1
      guardPromise2 = new Promise((resolve) => (resolveGuard2 = resolve));
      const nav1Promise = harness.navigateByUrl('/route2');
      await timeout();

      // Cancel Nav 1 with rollback
      resolveGuard2(false);
      // Synchronously trigger the reload to simulate rollback reload!
      paramSignal.set('rolled-back');
      await nav1Promise;
      await timeout();

      // While recovery is pending, a new navigation (Nav 2) starts (to /route3)
      guardPromise3 = new Promise((resolve) => (resolveGuard3 = resolve));
      const nav2Promise = harness.navigateByUrl('/route3');
      await timeout();

      // Recovery should be cleared, but the resource is still frozen because of Nav 2.
      // Now recovery loading completes (isLoading becomes false)
      resolveLoader('rolled-back');
      await timeout();

      // It should still be frozen at 'initial' because Nav 2 is active!
      expect(wrapped.value()).toBe('initial');

      // Let Nav 2 succeed
      resolveGuard3(true);
      await nav2Promise;
      await harness.fixture.whenStable();

      // Unfrozen!
      expect(wrapped.value()).toBe('rolled-back');
    });
  });

  describe('Reload Behavior', () => {
    it('should allow reload and delegate to source when not frozen', async () => {
      const wrapped = createWrappedResource();
      await timeout();

      const result = wrapped.reload();
      expect(result).toBe(true);

      // Verify that the resource actually started reloading (proves delegation!)
      await timeout();
      expect(wrapped.isLoading()).toBe(true);
    });

    it('should ignore reload and return false when frozen', async () => {
      const wrapped = createWrappedResource();
      await timeout();

      guardPromise2 = new Promise((resolve) => (resolveGuard2 = resolve));
      const navPromise = harness.navigateByUrl('/route2');
      await timeout();

      const result = wrapped.reload();
      expect(result).toBe(false);

      // Clean up
      resolveGuard2(true);
      await navPromise;
      await harness.fixture.whenStable();
    });
  });

  describe('Reactive Integration with Router Navigation State', () => {
    it('should reactively trigger loading but keep the wrapped resource frozen until navigation completes', async () => {
      const wrapped = createWrappedResource();
      await harness.fixture.whenStable(); // Let the initial Promise.resolve('data-route1') resolve and the zone stabilize!

      // Initially, we are at route1 and resolved
      expect(wrapped.status()).toBe('resolved');
      expect(wrapped.value()).toBe('initial');

      // 1. Start navigation to route2 (blocked by guard)
      guardPromise2 = new Promise((resolve) => (resolveGuard2 = resolve));
      const navPromise = harness.navigateByUrl('/route2');
      await timeout(); // Let router start and freeze the resource

      // 2. Manually trigger the parameter change while navigation is active
      paramSignal.set('route2');
      await timeout(); // Let the resource loader trigger in the background
      harness.fixture.detectChanges();

      // The wrapped resource MUST remain frozen at route1's data!
      expect(wrapped.status()).toBe('resolved');
      expect(wrapped.value()).toBe('initial');

      // 3. Settle the resource loader for route2
      resolveLoader('data-route2');
      await timeout(); // Let the resource resolve
      harness.fixture.detectChanges();

      // But the wrapped resource MUST STILL remain frozen at route1's data because the navigation is still pending!
      expect(wrapped.status()).toBe('resolved');
      expect(wrapped.value()).toBe('initial');

      // 4. Resolve the guard to let the navigation complete
      resolveGuard2(true);
      await navPromise;
      await harness.fixture.whenStable();

      // Now that the navigation completed, the wrapped resource must unfreeze and show route2's data!
      expect(wrapped.status()).toBe('resolved');
      expect(wrapped.value()).toBe('data-route2');
    });
  });

  describe('rxResource Integration', () => {
    it('should support wrapping rxResource natively and stream values without completion', async () => {
      const triggerSignal = signal('initial');
      let resolveSubject!: Subject<string>;

      const wrapped = TestBed.runInInjectionContext(() => {
        return routerResource(
          rxResource({
            params: () => triggerSignal(),
            stream: () => {
              resolveSubject = new Subject<string>();
              return resolveSubject;
            },
          }),
        );
      });

      // 1. Verify initial streaming (multiple emissions, no completion)
      await timeout();
      resolveSubject.next('initial-1');
      await harness.fixture.whenStable();
      expect(wrapped.value()).toBe('initial-1');

      resolveSubject.next('initial-2');
      await harness.fixture.whenStable();
      expect(wrapped.value()).toBe('initial-2');

      // 2. Start navigation (should freeze at the last streamed value)
      guardPromise2 = new Promise((resolve) => (resolveGuard2 = resolve));
      const navPromise = harness.navigateByUrl('/route2');
      await timeout();

      // Trigger a parameter change which creates a new stream
      triggerSignal.set('updated');
      await timeout();

      // Emit a value on the new active stream
      resolveSubject.next('updated-1');
      await timeout();

      // Wrapper must remain frozen at 'initial-2'
      expect(wrapped.value()).toBe('initial-2');

      // 3. Complete navigation to unfreeze
      resolveGuard2(true);
      await navPromise;
      await harness.fixture.whenStable();

      // Wrapper should unfreeze and show the latest value from the new stream
      expect(wrapped.value()).toBe('updated-1');

      // 4. Verify streaming continues to work after unfreezing
      resolveSubject.next('updated-2');
      await harness.fixture.whenStable();
      expect(wrapped.value()).toBe('updated-2');
    });
  });
});
