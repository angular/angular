/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { InjectionToken } from '../../di/injection_token';
export declare const enum NotificationSource {
    MarkAncestorsForTraversal = 0,
    SetInput = 1,
    DeferBlockStateUpdate = 2,
    DebugApplyChanges = 3,
    MarkForCheck = 4,
    Listener = 5,
    CustomElement = 6,
    RenderHook = 7,
    ViewAttached = 8,
    ViewDetachedFromDOM = 9,
    AsyncAnimationsLoaded = 10,
    PendingTaskRemoved = 11,
    RootEffect = 12,
    ViewEffect = 13
}
/**
 * Injectable that is notified when an `LView` is made aware of changes to application state.
 */
export declare abstract class ChangeDetectionScheduler {
    abstract notify(source: NotificationSource): void;
    abstract runningTick: boolean;
}
/** Token used to indicate if zoneless was enabled via provideZonelessChangeDetection(). */
export declare const ZONELESS_ENABLED: InjectionToken<boolean>;
/** Token used to indicate `provideZonelessChangeDetection` was used. */
export declare const PROVIDED_ZONELESS: InjectionToken<boolean>;
export declare const SCHEDULE_IN_ROOT_ZONE: InjectionToken<boolean>;
