/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Subscription} from 'rxjs';

import {ApplicationRef} from '../../application/application_ref';
import {
  ENVIRONMENT_INITIALIZER,
  EnvironmentProviders,
  inject,
  Injectable,
  InjectionToken,
  makeEnvironmentProviders,
  StaticProvider,
} from '../../di';
import {ErrorHandler, INTERNAL_APPLICATION_ERROR_HANDLER} from '../../error_handler';
import {RuntimeError, RuntimeErrorCode} from '../../errors';
import {PendingTasks} from '../../pending_tasks';
import {performanceMarkFeature} from '../../util/performance';
import {NgZone} from '../../zone';
import {InternalNgZoneOptions} from '../../zone/ng_zone';

import {alwaysProvideZonelessScheduler} from './flags';
import {
  ChangeDetectionScheduler,
  ZONELESS_ENABLED,
  ZONELESS_SCHEDULER_DISABLED,
} from './zoneless_scheduling';
import {ChangeDetectionSchedulerImpl} from './zoneless_scheduling_impl';

@Injectable({providedIn: 'root'})
export class NgZoneChangeDetectionScheduler {
  private readonly zone = inject(NgZone);
  private readonly changeDetectionScheduler = inject(ChangeDetectionScheduler, {optional: true});
  private readonly applicationRef = inject(ApplicationRef);
  private readonly zonelessEnabled = inject(ZONELESS_ENABLED);

  private _onMicrotaskEmptySubscription?: Subscription;

  initialize(): void {
    if (this._onMicrotaskEmptySubscription) {
      return;
    }

    this._onMicrotaskEmptySubscription = this.zone.onMicrotaskEmpty.subscribe({
      next: () => {
        // `onMicroTaskEmpty` can happen _during_ the zoneless scheduler change detection because
        // zone.run(() => {}) will result in `checkStable` at the end of the `zone.run` closure
        // and emit `onMicrotaskEmpty` synchronously if run coalsecing is false.
        if (this.changeDetectionScheduler?.runningTick) {
          return;
        }
        this.zone.run(() => {
          this.applicationRef.tick();
        });
      },
    });
  }

  ngOnDestroy() {
    this._onMicrotaskEmptySubscription?.unsubscribe();
  }
}

/**
 * Internal token used to verify that `provideZoneChangeDetection` is not used
 * with the bootstrapModule API.
 */
export const PROVIDED_NG_ZONE = new InjectionToken<boolean>(
  typeof ngDevMode === 'undefined' || ngDevMode ? 'provideZoneChangeDetection token' : '',
);

export function internalProvideZoneChangeDetection({
  ngZoneFactory,
  ignoreChangesOutsideZone,
}: {
  ngZoneFactory?: () => NgZone;
  ignoreChangesOutsideZone?: boolean;
}): StaticProvider[] {
  ngZoneFactory ??= () => new NgZone(getNgZoneOptions());
  return [
    {provide: NgZone, useFactory: ngZoneFactory},
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useFactory: () => {
        const ngZoneChangeDetectionScheduler = inject(NgZoneChangeDetectionScheduler, {
          optional: true,
        });
        if (
          (typeof ngDevMode === 'undefined' || ngDevMode) &&
          ngZoneChangeDetectionScheduler === null
        ) {
          throw new RuntimeError(
            RuntimeErrorCode.MISSING_REQUIRED_INJECTABLE_IN_BOOTSTRAP,
            `A required Injectable was not found in the dependency injection tree. ` +
              'If you are bootstrapping an NgModule, make sure that the `BrowserModule` is imported.',
          );
        }
        return () => ngZoneChangeDetectionScheduler!.initialize();
      },
    },
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useFactory: () => {
        const service = inject(ZoneStablePendingTask);
        return () => {
          service.initialize();
        };
      },
    },
    {provide: INTERNAL_APPLICATION_ERROR_HANDLER, useFactory: ngZoneApplicationErrorHandlerFactory},
    // Always disable scheduler whenever explicitly disabled, even if another place called
    // `provideZoneChangeDetection` without the 'ignore' option.
    ignoreChangesOutsideZone === true ? {provide: ZONELESS_SCHEDULER_DISABLED, useValue: true} : [],
    // TODO(atscott): This should move to the same places that zone change detection is provided by
    // default instead of being in the zone scheduling providers.
    alwaysProvideZonelessScheduler || ignoreChangesOutsideZone === false
      ? {provide: ChangeDetectionScheduler, useExisting: ChangeDetectionSchedulerImpl}
      : [],
  ];
}

export function ngZoneApplicationErrorHandlerFactory() {
  const zone = inject(NgZone);
  const userErrorHandler = inject(ErrorHandler);
  return (e: unknown) => zone.runOutsideAngular(() => userErrorHandler.handleError(e));
}

/**
 * Provides `NgZone`-based change detection for the application bootstrapped using
 * `bootstrapApplication`.
 *
 * `NgZone` is already provided in applications by default. This provider allows you to configure
 * options like `eventCoalescing` in the `NgZone`.
 * This provider is not available for `platformBrowser().bootstrapModule`, which uses
 * `BootstrapOptions` instead.
 *
 * @usageNotes
 * ```typescript
 * bootstrapApplication(MyApp, {providers: [
 *   provideZoneChangeDetection({eventCoalescing: true}),
 * ]});
 * ```
 *
 * @publicApi
 * @see {@link bootstrapApplication}
 * @see {@link NgZoneOptions}
 */
export function provideZoneChangeDetection(options?: NgZoneOptions): EnvironmentProviders {
  const ignoreChangesOutsideZone = options?.ignoreChangesOutsideZone;
  const zoneProviders = internalProvideZoneChangeDetection({
    ngZoneFactory: () => {
      const ngZoneOptions = getNgZoneOptions(options);
      if (ngZoneOptions.shouldCoalesceEventChangeDetection) {
        performanceMarkFeature('NgZone_CoalesceEvent');
      }
      return new NgZone(ngZoneOptions);
    },
    ignoreChangesOutsideZone,
  });
  return makeEnvironmentProviders([
    typeof ngDevMode === 'undefined' || ngDevMode
      ? [{provide: PROVIDED_NG_ZONE, useValue: true}, bothZoneAndZonelessErrorCheckProvider]
      : [],
    zoneProviders,
  ]);
}

/**
 * Used to configure event and run coalescing with `provideZoneChangeDetection`.
 *
 * @publicApi
 *
 * @see {@link provideZoneChangeDetection}
 */
export interface NgZoneOptions {
  /**
   * Optionally specify coalescing event change detections or not.
   * Consider the following case.
   *
   * ```
   * <div (click)="doSomething()">
   *   <button (click)="doSomethingElse()"></button>
   * </div>
   * ```
   *
   * When button is clicked, because of the event bubbling, both
   * event handlers will be called and 2 change detections will be
   * triggered. We can coalesce such kind of events to only trigger
   * change detection only once.
   *
   * By default, this option will be false. So the events will not be
   * coalesced and the change detection will be triggered multiple times.
   * And if this option be set to true, the change detection will be
   * triggered async by scheduling a animation frame. So in the case above,
   * the change detection will only be triggered once.
   */
  eventCoalescing?: boolean;

  /**
   * Optionally specify if `NgZone#run()` method invocations should be coalesced
   * into a single change detection.
   *
   * Consider the following case.
   * ```
   * for (let i = 0; i < 10; i ++) {
   *   ngZone.run(() => {
   *     // do something
   *   });
   * }
   * ```
   *
   * This case triggers the change detection multiple times.
   * With ngZoneRunCoalescing options, all change detections in an event loop trigger only once.
   * In addition, the change detection executes in requestAnimation.
   *
   */
  runCoalescing?: boolean;

  /**
   * When false, change detection is scheduled when Angular receives
   * a clear indication that templates need to be refreshed. This includes:
   *
   * - calling `ChangeDetectorRef.markForCheck`
   * - calling `ComponentRef.setInput`
   * - updating a signal that is read in a template
   * - when bound host or template listeners are triggered
   * - attaching a view that is marked dirty
   * - removing a view
   * - registering a render hook (templates are only refreshed if render hooks do one of the above)
   */
  ignoreChangesOutsideZone?: boolean;
}

// Transforms a set of `BootstrapOptions` (supported by the NgModule-based bootstrap APIs) ->
// `NgZoneOptions` that are recognized by the NgZone constructor. Passing no options will result in
// a set of default options returned.
export function getNgZoneOptions(options?: NgZoneOptions): InternalNgZoneOptions {
  return {
    enableLongStackTrace: typeof ngDevMode === 'undefined' ? false : !!ngDevMode,
    shouldCoalesceEventChangeDetection: options?.eventCoalescing ?? false,
    shouldCoalesceRunChangeDetection: options?.runCoalescing ?? false,
  };
}

@Injectable({providedIn: 'root'})
export class ZoneStablePendingTask {
  private readonly subscription = new Subscription();
  private initialized = false;
  private readonly zone = inject(NgZone);
  private readonly pendingTasks = inject(PendingTasks);

  initialize() {
    if (this.initialized) {
      return;
    }
    this.initialized = true;

    let task: number | null = null;
    if (!this.zone.isStable && !this.zone.hasPendingMacrotasks && !this.zone.hasPendingMicrotasks) {
      task = this.pendingTasks.add();
    }

    this.zone.runOutsideAngular(() => {
      this.subscription.add(
        this.zone.onStable.subscribe(() => {
          NgZone.assertNotInAngularZone();

          // Check whether there are no pending macro/micro tasks in the next tick
          // to allow for NgZone to update the state.
          queueMicrotask(() => {
            if (
              task !== null &&
              !this.zone.hasPendingMacrotasks &&
              !this.zone.hasPendingMicrotasks
            ) {
              this.pendingTasks.remove(task);
              task = null;
            }
          });
        }),
      );
    });

    this.subscription.add(
      this.zone.onUnstable.subscribe(() => {
        NgZone.assertInAngularZone();
        task ??= this.pendingTasks.add();
      }),
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}

const bothZoneAndZonelessErrorCheckProvider = {
  provide: ENVIRONMENT_INITIALIZER,
  multi: true,
  useFactory: () => {
    const providedZoneless = inject(ZONELESS_ENABLED, {optional: true});
    if (providedZoneless) {
      throw new RuntimeError(
        RuntimeErrorCode.PROVIDED_BOTH_ZONE_AND_ZONELESS,
        'Invalid change detection configuration: ' +
          'provideZoneChangeDetection and provideExperimentalZonelessChangeDetection cannot be used together.',
      );
    }
    return () => {};
  },
};
