/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ɵɵinject} from '../../di/injector_compatibility';
import {ɵɵdefineInjectable} from '../../di/interface/defs';
import {NotificationSource} from './tokens';
import {ChangeDetectionSchedulerImpl} from './change_detection_scheduler_impl';

/**
 * Injectable that is notified when an `LView` is made aware of changes to application state.
 */
export abstract class ChangeDetectionScheduler {
  /** @nocollapse */
  static ɵprov = /** @pureOrBreakMyCode */ /* @__PURE__ */ ɵɵdefineInjectable({
    token: ChangeDetectionScheduler,
    providedIn: 'root',
    factory: () => ɵɵinject(ChangeDetectionSchedulerImpl),
  });

  abstract notify(source: NotificationSource): void;
  abstract runningTick: boolean;
}
