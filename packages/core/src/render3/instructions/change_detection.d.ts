/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ComponentTemplate } from '../interfaces/definition';
import { LView, TView } from '../interfaces/view';
/**
 * The maximum number of times the change detection traversal will rerun before throwing an error.
 */
export declare const MAXIMUM_REFRESH_RERUNS = 100;
export declare function detectChangesInternal(lView: LView, mode?: ChangeDetectionMode): void;
export declare function checkNoChangesInternal(lView: LView, exhaustive: boolean): void;
/**
 * Different modes of traversing the logical view tree during change detection.
 *
 *
 * The change detection traversal algorithm switches between these modes based on various
 * conditions.
 */
export declare const enum ChangeDetectionMode {
    /**
     * In `Global` mode, `Dirty` and `CheckAlways` views are refreshed as well as views with the
     * `RefreshView` flag.
     */
    Global = 0,
    /**
     * In `Targeted` mode, only views with the `RefreshView` flag or updated signals are refreshed.
     */
    Targeted = 1
}
/**
 * Processes a view in update mode. This includes a number of steps in a specific order:
 * - executing a template function in update mode;
 * - executing hooks;
 * - refreshing queries;
 * - setting host bindings;
 * - refreshing child (embedded and component) views.
 */
export declare function refreshView<T>(tView: TView, lView: LView, templateFn: ComponentTemplate<{}> | null, context: T): void;
