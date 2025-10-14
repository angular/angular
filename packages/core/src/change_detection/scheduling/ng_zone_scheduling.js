/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {Subscription} from 'rxjs';
import {ApplicationRef} from '../../application/application_ref';
import {
  ENVIRONMENT_INITIALIZER,
  inject,
  Injectable,
  InjectionToken,
  makeEnvironmentProviders,
} from '../../di';
import {RuntimeError} from '../../errors';
import {PendingTasksInternal} from '../../pending_tasks_internal';
import {performanceMarkFeature} from '../../util/performance';
import {NgZone} from '../../zone';
import {
  ChangeDetectionScheduler,
  ZONELESS_ENABLED,
  SCHEDULE_IN_ROOT_ZONE,
} from './zoneless_scheduling';
import {SCHEDULE_IN_ROOT_ZONE_DEFAULT} from './flags';
import {INTERNAL_APPLICATION_ERROR_HANDLER} from '../../error_handler';
let NgZoneChangeDetectionScheduler = class NgZoneChangeDetectionScheduler {
  constructor() {
    this.zone = inject(NgZone);
    this.changeDetectionScheduler = inject(ChangeDetectionScheduler);
    this.applicationRef = inject(ApplicationRef);
    this.applicationErrorHandler = inject(INTERNAL_APPLICATION_ERROR_HANDLER);
  }
  initialize() {
    if (this._onMicrotaskEmptySubscription) {
      return;
    }
    this._onMicrotaskEmptySubscription = this.zone.onMicrotaskEmpty.subscribe({
      next: () => {
        // `onMicroTaskEmpty` can happen _during_ the zoneless scheduler change detection because
        // zone.run(() => {}) will result in `checkStable` at the end of the `zone.run` closure
        // and emit `onMicrotaskEmpty` synchronously if run coalsecing is false.
        if (this.changeDetectionScheduler.runningTick) {
          return;
        }
        this.zone.run(() => {
          try {
            this.applicationRef.dirtyFlags |= 1 /* ApplicationRefDirtyFlags.ViewTreeGlobal */;
            this.applicationRef._tick();
          } catch (e) {
            this.applicationErrorHandler(e);
          }
        });
      },
    });
  }
  ngOnDestroy() {
    this._onMicrotaskEmptySubscription?.unsubscribe();
  }
};
NgZoneChangeDetectionScheduler = __decorate(
  [Injectable({providedIn: 'root'})],
  NgZoneChangeDetectionScheduler,
);
export {NgZoneChangeDetectionScheduler};
/**
 * Internal token used to verify that `provideZoneChangeDetection` is not used
 * with the bootstrapModule API.
 */
export const PROVIDED_NG_ZONE = new InjectionToken(
  typeof ngDevMode === 'undefined' || ngDevMode ? 'provideZoneChangeDetection token' : '',
  {factory: () => false},
);
export function internalProvideZoneChangeDetection({ngZoneFactory, scheduleInRootZone}) {
  ngZoneFactory ?? (ngZoneFactory = () => new NgZone({...getNgZoneOptions(), scheduleInRootZone}));
  return [
    {provide: ZONELESS_ENABLED, useValue: false},
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
            402 /* RuntimeErrorCode.MISSING_REQUIRED_INJECTABLE_IN_BOOTSTRAP */,
            `A required Injectable was not found in the dependency injection tree. ` +
              'If you are bootstrapping an NgModule, make sure that the `BrowserModule` is imported.',
          );
        }
        return () => ngZoneChangeDetectionScheduler.initialize();
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
    {
      provide: SCHEDULE_IN_ROOT_ZONE,
      useValue: scheduleInRootZone ?? SCHEDULE_IN_ROOT_ZONE_DEFAULT,
    },
  ];
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
 * ```ts
 * bootstrapApplication(MyApp, {providers: [
 *   provideZoneChangeDetection({eventCoalescing: true}),
 * ]});
 * ```
 *
 * @publicApi
 * @see {@link /api/platform-browser/bootstrapApplication bootstrapApplication}
 * @see {@link NgZoneOptions}
 */
export function provideZoneChangeDetection(options) {
  const scheduleInRootZone = options?.scheduleInRootZone;
  const zoneProviders = internalProvideZoneChangeDetection({
    ngZoneFactory: () => {
      const ngZoneOptions = getNgZoneOptions(options);
      ngZoneOptions.scheduleInRootZone = scheduleInRootZone;
      if (ngZoneOptions.shouldCoalesceEventChangeDetection) {
        performanceMarkFeature('NgZone_CoalesceEvent');
      }
      return new NgZone(ngZoneOptions);
    },
    scheduleInRootZone,
  });
  return makeEnvironmentProviders([{provide: PROVIDED_NG_ZONE, useValue: true}, zoneProviders]);
}
// Transforms a set of `BootstrapOptions` (supported by the NgModule-based bootstrap APIs) ->
// `NgZoneOptions` that are recognized by the NgZone constructor. Passing no options will result in
// a set of default options returned.
export function getNgZoneOptions(options) {
  return {
    enableLongStackTrace: typeof ngDevMode === 'undefined' ? false : !!ngDevMode,
    shouldCoalesceEventChangeDetection: options?.eventCoalescing ?? false,
    shouldCoalesceRunChangeDetection: options?.runCoalescing ?? false,
  };
}
let ZoneStablePendingTask = class ZoneStablePendingTask {
  constructor() {
    this.subscription = new Subscription();
    this.initialized = false;
    this.zone = inject(NgZone);
    this.pendingTasks = inject(PendingTasksInternal);
  }
  initialize() {
    if (this.initialized) {
      return;
    }
    this.initialized = true;
    let task = null;
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
        task ?? (task = this.pendingTasks.add());
      }),
    );
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
};
ZoneStablePendingTask = __decorate([Injectable({providedIn: 'root'})], ZoneStablePendingTask);
export {ZoneStablePendingTask};
//# sourceMappingURL=ng_zone_scheduling.js.map
