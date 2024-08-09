/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ApplicationRef} from '../../application/application_ref';
import {ChangeDetectionSchedulerImpl} from './zoneless_scheduling_impl';
import {inject} from '../../di/injector_compatibility';
import {makeEnvironmentProviders} from '../../di/provider_collection';
import {NgZone} from '../../zone/ng_zone';

import {EnvironmentInjector} from '../../di/r3_injector';
import {ENVIRONMENT_INITIALIZER} from '../../di/initializer_token';
import {CheckNoChangesMode} from '../../render3/state';
import {ErrorHandler} from '../../error_handler';
import {checkNoChangesInternal} from '../../render3/instructions/change_detection';
import {ZONELESS_ENABLED} from './zoneless_scheduling';

/**
 * Used to periodically verify no expressions have changed after they were checked.
 *
 * @param options Used to configure when the check will execute.
 *   - `interval` will periodically run exhaustive `checkNoChanges` on application views
 *   - `useNgZoneOnStable` will use ZoneJS to determine when change detection might have run
 *      in an application using ZoneJS to drive change detection. When the `NgZone.onStable` would
 *      have emitted, all views attached to the `ApplicationRef` are checked for changes.
 *   - 'exhaustive' means that all views attached to `ApplicationRef` and all the descendants of those views will be
 *     checked for changes (excluding those subtrees which are detached via `ChangeDetectorRef.detach()`).
 *     This is useful because the check that runs after regular change detection does not work for components using `ChangeDetectionStrategy.OnPush`.
 *     This check is will surface any existing errors hidden by `OnPush` components. By default, this check is exhaustive
 *     and will always check all views, regardless of their "dirty" state and `ChangeDetectionStrategy`.
 *
 * When the `useNgZoneOnStable` option is `true`, this function will provide its own `NgZone` implementation and needs
 * to come after any other `NgZone` provider, including `provideZoneChangeDetection()` and `provideExperimentalZonelessChangeDetection()`.
 *
 * @experimental
 * @publicApi
 */
export function provideExperimentalCheckNoChangesForDebug(options: {
  interval?: number;
  useNgZoneOnStable?: boolean;
  exhaustive?: boolean;
}) {
  if (typeof ngDevMode === 'undefined' || ngDevMode) {
    if (options.interval === undefined && !options.useNgZoneOnStable) {
      throw new Error('Must provide one of `useNgZoneOnStable` or `interval`');
    }
    const checkNoChangesMode =
      options?.exhaustive === false
        ? CheckNoChangesMode.OnlyDirtyViews
        : CheckNoChangesMode.Exhaustive;
    return makeEnvironmentProviders([
      options?.useNgZoneOnStable
        ? {provide: NgZone, useFactory: () => new DebugNgZoneForCheckNoChanges(checkNoChangesMode)}
        : [],
      options?.interval !== undefined
        ? exhaustiveCheckNoChangesInterval(options.interval, checkNoChangesMode)
        : [],
      {
        provide: ENVIRONMENT_INITIALIZER,
        multi: true,
        useValue: () => {
          if (
            options?.useNgZoneOnStable &&
            !(inject(NgZone) instanceof DebugNgZoneForCheckNoChanges)
          ) {
            throw new Error(
              '`provideExperimentalCheckNoChangesForDebug` with `useNgZoneOnStable` must be after any other provider for `NgZone`.',
            );
          }
        },
      },
    ]);
  } else {
    return makeEnvironmentProviders([]);
  }
}

export class DebugNgZoneForCheckNoChanges extends NgZone {
  private applicationRef?: ApplicationRef;
  private scheduler?: ChangeDetectionSchedulerImpl;
  private errorHandler?: ErrorHandler;
  private readonly injector = inject(EnvironmentInjector);

  constructor(private readonly checkNoChangesMode: CheckNoChangesMode) {
    const zonelessEnabled = inject(ZONELESS_ENABLED);
    // Use coalescing to ensure we aren't ever running this check synchronously
    super({
      shouldCoalesceEventChangeDetection: true,
      shouldCoalesceRunChangeDetection: zonelessEnabled,
    });

    if (zonelessEnabled) {
      // prevent emits to ensure code doesn't rely on these
      this.onMicrotaskEmpty.emit = () => {};
      this.onStable.emit = () => {
        this.scheduler ||= this.injector.get(ChangeDetectionSchedulerImpl);
        if (this.scheduler.removePendingTask || this.scheduler.runningTick) {
          return;
        }
        this.checkApplicationViews();
      };
      this.onUnstable.emit = () => {};
    } else {
      this.runOutsideAngular(() => {
        this.onStable.subscribe(() => {
          this.checkApplicationViews();
        });
      });
    }
  }

  private checkApplicationViews() {
    this.applicationRef ||= this.injector.get(ApplicationRef);
    for (const view of this.applicationRef.allViews) {
      try {
        checkNoChangesInternal(view._lView, this.checkNoChangesMode, view.notifyErrorHandler);
      } catch (e) {
        this.errorHandler ||= this.injector.get(ErrorHandler);
        this.errorHandler.handleError(e);
      }
    }
  }
}

function exhaustiveCheckNoChangesInterval(
  interval: number,
  checkNoChangesMode: CheckNoChangesMode,
) {
  return {
    provide: ENVIRONMENT_INITIALIZER,
    multi: true,
    useFactory: () => {
      const applicationRef = inject(ApplicationRef);
      const errorHandler = inject(ErrorHandler);
      const scheduler = inject(ChangeDetectionSchedulerImpl);
      const ngZone = inject(NgZone);

      return () => {
        function scheduleCheckNoChanges() {
          ngZone.runOutsideAngular(() => {
            setTimeout(() => {
              if (applicationRef.destroyed) {
                return;
              }
              if (scheduler.removePendingTask || scheduler.runningTick) {
                scheduleCheckNoChanges();
                return;
              }

              for (const view of applicationRef.allViews) {
                try {
                  checkNoChangesInternal(view._lView, checkNoChangesMode, view.notifyErrorHandler);
                } catch (e) {
                  errorHandler.handleError(e);
                }
              }

              scheduleCheckNoChanges();
            }, interval);
          });
        }
        scheduleCheckNoChanges();
      };
    },
  };
}
