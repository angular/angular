/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken} from '../../di/injection_token';

export const enum NotificationSource {
  // Change detection needs to run in order to synchronize application state
  // with the DOM when the following notifications are received:
  // This operation indicates that a subtree needs to be traversed during change detection.
  MarkAncestorsForTraversal,
  // A component/directive gets a new input.
  SetInput,
  // Defer block state updates need change detection to fully render the state.
  DeferBlockStateUpdate,
  // Debugging tools updated state and have requested change detection.
  DebugApplyChanges,
  // ChangeDetectorRef.markForCheck indicates the component is dirty/needs to refresh.
  MarkForCheck,

  // Bound listener callbacks execute and can update state without causing other notifications from
  // above.
  Listener,

  // The following notifications do not require views to be refreshed
  // but we should execute render hooks:
  // Render hooks are guaranteed to execute with the schedulers timing.
  NewRenderHook,
  // Views might be created outside and manipulated in ways that
  // we cannot be aware of. When a view is attached, Angular now "knows"
  // about it and we now know that DOM might have changed (and we should
  // run render hooks). If the attached view is dirty, the `MarkAncestorsForTraversal`
  // notification should also be received.
  ViewAttached,
  // When DOM removal happens, render hooks may be interested in the new
  // DOM state but we do not need to refresh any views unless. If change
  // detection is required after DOM removal, another notification should
  // be received (i.e. `markForCheck`).
  ViewDetachedFromDOM,
  // Applying animations might result in new DOM state and should rerun render hooks
  AsyncAnimationsLoaded,

  // An `effect()` outside of the view tree became dirty and might need to run.
  RootEffect,
}

/**
 * Injectable that is notified when an `LView` is made aware of changes to application state.
 */
export abstract class ChangeDetectionScheduler {
  abstract notify(source: NotificationSource): void;
  abstract runningTick: boolean;
}

/** Token used to indicate if zoneless was enabled via provideZonelessChangeDetection(). */
export const ZONELESS_ENABLED = new InjectionToken<boolean>(
  typeof ngDevMode === 'undefined' || ngDevMode ? 'Zoneless enabled' : '',
  {providedIn: 'root', factory: () => false},
);

/** Token used to indicate `provideExperimentalZonelessChangeDetection` was used. */
export const PROVIDED_ZONELESS = new InjectionToken<boolean>(
  typeof ngDevMode === 'undefined' || ngDevMode ? 'Zoneless provided' : '',
  {providedIn: 'root', factory: () => false},
);

export const ZONELESS_SCHEDULER_DISABLED = new InjectionToken<boolean>(
  typeof ngDevMode === 'undefined' || ngDevMode ? 'scheduler disabled' : '',
);
