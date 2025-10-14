/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ElementPosition } from '../../../../protocol';
import { ComponentTreeNode } from '../interfaces';
import { IndexedNode } from './identity-tracker';
import { Profiler } from './profiler';
/**
 *  Class to hook into directive forest.
 *
 *  Exposes latest directive forest state.
 *
 *  Delegates profiling to a Profiler instance.
 *  Delegates forest indexing to IdentityTracker Singleton
 */
export declare class DirectiveForestHooks {
    private _tracker;
    private _forest;
    private _indexedForest;
    profiler: Profiler;
    getDirectivePosition(dir: any): ElementPosition | undefined;
    getDirectiveId(dir: any): number | undefined;
    getIndexedDirectiveForest(): IndexedNode[];
    getDirectiveForest(): ComponentTreeNode[];
    initialize(): void;
    indexForest(): void;
}
