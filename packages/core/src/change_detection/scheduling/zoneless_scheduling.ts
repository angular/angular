/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken} from '../../di/injection_token';

export const enum NotificationType {
  RefreshViews,
  AfterRenderHooks,
}

/**
 * Injectable that is notified when an `LView` is made aware of changes to application state.
 */
export abstract class ChangeDetectionScheduler {
  abstract notify(source?: NotificationType): void;
  abstract runningTick: boolean;
}

/** Token used to indicate if zoneless was enabled via provideZonelessChangeDetection(). */
export const ZONELESS_ENABLED = new InjectionToken<boolean>(
    typeof ngDevMode === 'undefined' || ngDevMode ? 'Zoneless enabled' : '',
    {providedIn: 'root', factory: () => false});

export const ZONELESS_SCHEDULER_DISABLED = new InjectionToken<boolean>(
    typeof ngDevMode === 'undefined' || ngDevMode ? 'scheduler disabled' : '');
