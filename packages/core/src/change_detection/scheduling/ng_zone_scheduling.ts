/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Subscription} from 'rxjs';

import {ApplicationRef, ApplicationRefDirtyFlags} from '../../application/application_ref';
import {
  ENVIRONMENT_INITIALIZER,
  EnvironmentInjector,
  EnvironmentProviders,
  inject,
  Injectable,
  InjectionToken,
  makeEnvironmentProviders,
  StaticProvider,
} from '../../di';
import {RuntimeError, RuntimeErrorCode} from '../../errors';
import {PendingTasksInternal} from '../../pending_tasks';
import {performanceMarkFeature} from '../../util/performance';
import {NgZone} from '../../zone';
import {InternalNgZoneOptions} from '../../zone/ng_zone';

import {
  ChangeDetectionScheduler,
  ZONELESS_SCHEDULER_DISABLED,
  ZONELESS_ENABLED,
  SCHEDULE_IN_ROOT_ZONE,
} from './zoneless_scheduling';
import {SCHEDULE_IN_ROOT_ZONE_DEFAULT} from './flags';
import {INTERNAL_APPLICATION_ERROR_HANDLER, ErrorHandler} from '../../error_handler';

@Injectable({providedIn: 'root'})
export class NgZoneChangeDetectionScheduler {
  private readonly zone = inject(NgZone);
  private readonly changeDetectionScheduler = inject(ChangeDetectionScheduler);
  private readonly applicationRef = inject(ApplicationRef);
  private readonly applicationErrorHandler = inject(INTERNAL_APPLICATION_ERROR_HANDLER);

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
        if (this.changeDetectionScheduler.runningTick) {
          return;
        }
        this.zone.run(() => {
          try {
            this.applicationRef.dirtyFlags |= ApplicationRefDirtyFlags.ViewTreeGlobal;
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
}

/**
 * Internal token used to verify that `provideZoneChangeDetection` is not used
 * with the bootstrapModule API.
 */
export const PROVIDED_NG_ZONE = new InjectionToken<boolean>(
  typeof ngDevMode === 'undefined' || ngDevMode ? 'provideZoneChangeDetection token' : '',
  {factory: () => false},
);

export function internalProvideZoneChangeDetection({
  ngZoneFactory,
  ignoreChangesOutsideZone,
  scheduleInRootZone,
}: {
  ngZoneFactory?: () => NgZone;
  ignoreChangesOutsideZone?: boolean;
  scheduleInRootZone?: boolean;
}): StaticProvider[] {
  ngZoneFactory ??= () =>
    new NgZone({...getNgZoneOptions(), scheduleInRootZone} as InternalNgZoneOptions);
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
    // Always disable scheduler whenever explicitly disabled, even if another place called
    // `provideZoneChangeDetection` without the 'ignore' option.
    ignoreChangesOutsideZone === true ? {provide: ZONELESS_SCHEDULER_DISABLED, useValue: true} : [],
    {
      provide: SCHEDULE_IN_ROOT_ZONE,
      useValue: scheduleInRootZone ?? SCHEDULE_IN_ROOT_ZONE_DEFAULT,
    },
    {
      provide: INTERNAL_APPLICATION_ERROR_HANDLER,
      useFactory: () => {
        const zone = inject(NgZone);
        const injector = inject(EnvironmentInjector);
        let userErrorHandler: ErrorHandler;
        return (e: unknown) => {
          zone.runOutsideAngular(() => {
            if (injector.destroyed && !userErrorHandler) {
              setTimeout(() => {
                throw e;
              });
            } else {
              userErrorHandler ??= injector.get(ErrorHandler);
              userErrorHandler.handleError(e);
            }
          });
        };
      },
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
export function provideZoneChangeDetection(options?: NgZoneOptions): EnvironmentProviders {
  const ignoreChangesOutsideZone = options?.ignoreChangesOutsideZone;
  const scheduleInRootZone = (options as any)?.scheduleInRootZone;
  const zoneProviders = internalProvideZoneChangeDetection({
    ngZoneFactory: () => {
      const ngZoneOptions = getNgZoneOptions(options);
      ngZoneOptions.scheduleInRootZone = scheduleInRootZone;
      if (ngZoneOptions.shouldCoalesceEventChangeDetection) {
        performanceMarkFeature('NgZone_CoalesceEvent');
      }
      return new NgZone(ngZoneOptions);
    },
    ignoreChangesOutsideZone,
    scheduleInRootZone,
  });
  return makeEnvironmentProviders([
    {provide: PROVIDED_NG_ZONE, useValue: true},
    {provide: ZONELESS_ENABLED, useValue: false},
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
   * ```html
   * <div (click)="doSomething()">
   *   <button (click)="doSomethingElse()"></button>
   * </div>
   * ```
   *
   * When button is clicked, because of the event bubbling, both
   * event handlers will be called and 2 change detections will be
   * triggered. We can coalesce such kind of events to trigger
   * change detection only once.
   *
   * By default, this option is set to false, meaning events will
   * not be coalesced, and change detection will be triggered multiple times.
   * If this option is set to true, change detection will be triggered
   * once in the scenario described above.
   */
  eventCoalescing?: boolean;

  /**
   * Optionally specify if `NgZone#run()` method invocations should be coalesced
   * into a single change detection.
   *
   * Consider the following case.
   * ```ts
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
   * - attaching a view that is marked dirty
   * - removing a view
   * - registering a render hook (templates are only refreshed if render hooks do one of the above)
   *
   * @deprecated This option was introduced out of caution as a way for developers to opt out of the
   *    new behavior in v18 which schedule change detection for the above events when they occur
   *    outside the Zone. After monitoring the results post-release, we have determined that this
   *    feature is working as desired and do not believe it should ever be disabled by setting
   *    this option to `true`.
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
  private readonly pendingTasks = inject(PendingTasksInternal);

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
