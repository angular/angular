/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {InjectionToken} from '../../di/injection_token';
/**
 * Injectable that is notified when an `LView` is made aware of changes to application state.
 */
export class ChangeDetectionScheduler {}
/** Token used to indicate if zoneless was enabled via provideZonelessChangeDetection(). */
export const ZONELESS_ENABLED = new InjectionToken(
  typeof ngDevMode === 'undefined' || ngDevMode ? 'Zoneless enabled' : '',
  {providedIn: 'root', factory: () => true},
);
/** Token used to indicate `provideZonelessChangeDetection` was used. */
export const PROVIDED_ZONELESS = new InjectionToken(
  typeof ngDevMode === 'undefined' || ngDevMode ? 'Zoneless provided' : '',
  {providedIn: 'root', factory: () => false},
);
// TODO(atscott): Remove in v19. Scheduler should be done with runOutsideAngular.
export const SCHEDULE_IN_ROOT_ZONE = new InjectionToken(
  typeof ngDevMode === 'undefined' || ngDevMode ? 'run changes outside zone in root' : '',
);
//# sourceMappingURL=zoneless_scheduling.js.map
