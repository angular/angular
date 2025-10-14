/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { NodeArray } from '../identity-tracker';
import { Profiler } from './shared';
/**
 * Implementation of Profiler that uses monkey patching of directive templates and lifecycle
 * methods to fire profiler hooks.
 */
export declare class PatchingProfiler extends Profiler {
    private _patched;
    private _undoLifecyclePatch;
    private _tracker;
    destroy(): void;
    onIndexForest(newNodes: NodeArray, removedNodes: NodeArray): void;
    private _fireCreationCallback;
    private _fireDestroyCallback;
    private _observeComponent;
    private _observeLifecycle;
}
