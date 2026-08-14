/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  inject,
  Injector,
  Resource,
  resourceFromSnapshots,
  Signal,
  signal,
  DestroyRef,
  ResourceSnapshot,
  effect,
  computed,
  assertInInjectionContext,
} from '@angular/core';
import {Router} from './router';
import {
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
  NavigationSkipped,
  NavigationCancellationCode,
} from './events';

export const NON_BLOCKING_SYMBOL: unique symbol = Symbol(
  typeof ngDevMode === 'undefined' || ngDevMode ? '__isNonBlocking' : '',
);
export const BLOCKING_SYMBOL: unique symbol = Symbol(
  typeof ngDevMode === 'undefined' || ngDevMode ? '__isBlocking' : '',
);

/**
 * @internal
 */
export interface InternalRouterResource<T = unknown> extends Resource<T> {
  [NON_BLOCKING_SYMBOL]?: boolean;
  [BLOCKING_SYMBOL]?: boolean;
  reload(): boolean;
}

/**
 * Marks a resource as non-blocking. The Router will NOT wait for this resource to resolve
 * before completing the navigation.
 * @experimental
 */
export function nonBlocking<T, R extends Resource<T>>(res: R): R {
  (res as unknown as InternalRouterResource<T>)[NON_BLOCKING_SYMBOL] = true;
  return res;
}

/**
 * Wraps a Resource to make it cooperative with the Angular Router, freezing its state
 * during navigation transitions and handling rollback recovery.
 */
export function routerResource<T>(source: Resource<T>): Resource<T> & {reload(): boolean} {
  ngDevMode && assertInInjectionContext(routerResource);
  const injector = inject(Injector);
  const router = injector.get(Router);

  const {snapshot: snapshotSignal, frozenSnapshot} = createTransactionalSnapshot(
    source,
    router,
    injector,
  );

  const res = resourceFromSnapshots(snapshotSignal) as unknown as InternalRouterResource<T>;

  if ((source as unknown as InternalRouterResource<T>)[NON_BLOCKING_SYMBOL]) {
    res[NON_BLOCKING_SYMBOL] = true;
  } else {
    res[BLOCKING_SYMBOL] = true;
  }

  if (typeof (source as any).reload === 'function') {
    res.reload = function (): boolean {
      // If the resource is currently frozen (e.g., during an active navigation transition
      // or while recovering from a cancelled navigation), we reject manual reload requests.
      // Triggering a reload during an active navigation (where the resource may already be
      // reactively loading new parameters behind the scenes) would disrupt the router's resource
      // tracking for the transition. Similarly, during a rollback recovery, the router is
      // already managing the resource reload to restore the previous state.
      if (frozenSnapshot() !== null) {
        return false;
      }
      return (source as any).reload();
    };
  } else {
    res.reload = () => false;
  }

  return res;
}

/**
 * Creates a signal that tracks the resource snapshot and handles transactional behavior
 * (freezing during navigation and rollback recovery).
 */
function createTransactionalSnapshot<T>(
  source: Resource<T>,
  router: Router,
  injector: Injector,
): {
  snapshot: Signal<ResourceSnapshot<T>>;
  frozenSnapshot: Signal<ResourceSnapshot<T> | null>;
} {
  // Holds a snapshot of the resource to keep the UI masked (frozen) during pending navigations
  // or while recovering from a cancelled navigation.
  const frozenSnapshot = signal<ResourceSnapshot<T> | null>(null);

  // Tracks whether we are in a recovery phase after a cancelled navigation.
  // The intended behavior is that on cancellation, the router reverts to the previous state.
  // This reversion might trigger a new load of the previous state because the signal dependencies
  // changed. If we were to release the frozen resource state immediately, the user would see a loading state
  // for data they were just looking at. To avoid this "loading flash", we retain the frozen
  // value (via frozenSnapshot) during this recovery load/reload until the resource settles.
  const isRollbackRecoveryPending = signal(false);

  const sub = router.events.subscribe((e) => {
    if (e instanceof NavigationStart) {
      isRollbackRecoveryPending.set(false);

      if (frozenSnapshot() === null) {
        // Freeze the snapshot at the start of navigation to keep the UI stable.
        frozenSnapshot.set(source.snapshot());
      }
    } else if (e instanceof NavigationEnd) {
      // Navigation succeeded, so we can unfreeze and use the live state.
      frozenSnapshot.set(null);
      isRollbackRecoveryPending.set(false);
    } else if (e instanceof NavigationSkipped) {
      // If a navigation is skipped while we have a frozen snapshot (e.g. navigating to the
      // current URL to cancel an in-flight navigation), the in-flight navigation is aborted
      // and parameter rollback begins. We must maintain the frozen snapshot until the rollback
      // recovery load completes to prevent flashing a loading state.
      if (frozenSnapshot() !== null) {
        isRollbackRecoveryPending.set(true);
      }
    } else if (e instanceof NavigationCancel || e instanceof NavigationError) {
      const isRollback =
        e instanceof NavigationError ||
        (e instanceof NavigationCancel &&
          e.code !== NavigationCancellationCode.SupersededByNewNavigation &&
          e.code !== NavigationCancellationCode.Redirect);

      if (!isRollback) return;

      isRollbackRecoveryPending.set(true);
    }
  });

  injector.get(DestroyRef).onDestroy(() => sub.unsubscribe());

  effect(
    () => {
      if (
        isRollbackRecoveryPending() &&
        // TODO(consider):  should this be hasValue || status !== loading
        // Some stream implementations may retain loading status after first item resolves
        !source.isLoading()
      ) {
        isRollbackRecoveryPending.set(false);
        frozenSnapshot.set(null);
      }
    },
    {injector},
  );

  return {
    snapshot: computed(() => frozenSnapshot() ?? source.snapshot()),
    frozenSnapshot,
  };
}
