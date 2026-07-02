/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ApplicationRef} from '../../application/application_ref';
import {ChangeDetectionSchedulerImpl} from './zoneless_scheduling_impl';
import {inject} from '../../di/injector_compatibility';
import {provideEnvironmentInitializer} from '../../di/provider_collection';
import {NgZone} from '../../zone/ng_zone';

import {ErrorHandler} from '../../error_handler';
import {checkNoChangesInternal} from '../../render3/instructions/change_detection';

export function exhaustiveCheckNoChangesInterval(interval: number) {
  return provideEnvironmentInitializer(() => {
    const applicationRef = inject(ApplicationRef);
    const errorHandler = inject(ErrorHandler);
    const scheduler = inject(ChangeDetectionSchedulerImpl);
    const ngZone = inject(NgZone);

    function scheduleCheckNoChanges() {
      ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          if (applicationRef.destroyed) {
            return;
          }
          if (scheduler.pendingRenderTaskId || scheduler.runningTick) {
            scheduleCheckNoChanges();
            return;
          }

          for (const view of applicationRef.allViews) {
            try {
              checkNoChangesInternal(view._lView, true /** exhaustive */);
            } catch (e) {
              errorHandler.handleError(e);
            }
          }

          scheduleCheckNoChanges();
        }, interval);
      });
    }
    scheduleCheckNoChanges();
  });
}
