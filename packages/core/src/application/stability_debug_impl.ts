/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {EnvironmentProviders, inject, makeEnvironmentProviders} from '../di';
import {NgZone} from '../zone';
import {provideAppInitializer} from './application_init';
import {ApplicationRef} from './application_ref';
import {APPLICATION_IS_STABLE_TIMEOUT} from '../hydration/api';
import {DEBUG_TASK_TRACKER, DebugTaskTracker} from './stability_debug';

const STABILITY_WARNING_THRESHOLD = APPLICATION_IS_STABLE_TIMEOUT - 1_000;

class DebugTaskTrackerImpl implements DebugTaskTracker {
  readonly openTasks = new Map<number, Error>();

  add(taskId: number): void {
    this.openTasks.set(taskId, new Error('Task stack tracking error'));
  }

  remove(taskId: number): void {
    this.openTasks.delete(taskId);
  }
}

/**
 * Provides an application initializer that will log information about what tasks are keeping
 * the application from stabilizing if the application does not stabilize within 9 seconds.
 *
 * The logged information includes the stack of the tasks preventing stability. This stack can be traced
 * back to the source in the application code.
 *
 * If you are using Zone.js, it is recommended that you also temporarily import "zone.js/plugins/task-tracking".
 * This Zone.js plugin provides additional information about which macrotasks are scheduled in the Angular Zone
 * and keeping the Zone from stabilizing.
 *
 * @usageNotes
 *
 * ```ts
 * import 'zone.js/plugins/task-tracking';
 *
 * bootstrapApplication(AppComponent, {providers: [provideStabilityDebugging()]});
 * ```
 *
 * IMPORTANT: Neither the zone.js task tracking plugin nor this utility are removed from production bundles.
 * They are intended for temporary use while debugging stability issues during development, including for
 * optimized production builds.
 *
 * @publicApi 21.1
 */
export function provideStabilityDebugging(): EnvironmentProviders {
  const taskTracker = new DebugTaskTrackerImpl();
  const {openTasks} = taskTracker;
  return makeEnvironmentProviders([
    {
      provide: DEBUG_TASK_TRACKER,
      useValue: taskTracker,
    },
    provideAppInitializer(() => {
      if (typeof ngDevMode === 'undefined' || !ngDevMode) {
        console.warn(
          'Stability debugging utility was provided in production mode. ' +
            'This will cause debug code to be included in production bundles. ' +
            'If this is intentional because you are debugging stability issues in a production environment, you can ignore this warning.',
        );
      }
      const ngZone = inject(NgZone);
      const applicationRef = inject(ApplicationRef);

      // From TaskTrackingZone:
      // https://github.com/angular/angular/blob/ae0c59028a2f393ea5716bf222db2c38e7a3989f/packages/zone.js/lib/zone-spec/task-tracking.ts#L46
      let _taskTrackingZone: {macroTasks: Array<{creationLocation: Error}>} | null = null;
      if (typeof Zone !== 'undefined') {
        ngZone.run(() => {
          _taskTrackingZone = Zone.current.get('TaskTrackingZone');
        });
      }
      ngZone.runOutsideAngular(() => {
        const timeoutId = setTimeout(() => {
          console.debug(
            `---- Application did not stabilize within ${STABILITY_WARNING_THRESHOLD / 1000} seconds ----`,
          );
          if (typeof Zone !== 'undefined' && !_taskTrackingZone) {
            console.info(
              'Zone.js is present but no TaskTrackingZone found. To enable better debugging of tasks in the Angular Zone, ' +
                'import "zone.js/plugins/task-tracking" in your application.',
            );
          }
          if (_taskTrackingZone?.macroTasks?.length) {
            console.group('Macrotasks keeping Angular Zone unstable:');
            for (const t of _taskTrackingZone?.macroTasks ?? []) {
              console.debug(t.creationLocation.stack);
            }
            console.groupEnd();
          }
          console.group('PendingTasks keeping application unstable:');
          for (const error of openTasks.values()) {
            console.debug(error.stack);
          }
          console.groupEnd();
        }, STABILITY_WARNING_THRESHOLD);

        applicationRef.whenStable().then(() => {
          clearTimeout(timeoutId);
        });
      });
    }),
  ]);
}
