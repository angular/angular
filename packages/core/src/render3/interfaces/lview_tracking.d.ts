/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { LView } from './view';
/** Gets a unique ID that can be assigned to an LView. */
export declare function getUniqueLViewId(): number;
/** Starts tracking an LView. */
export declare function registerLView(lView: LView): void;
/** Gets an LView by its unique ID. */
export declare function getLViewById(id: number): LView | null;
/** Stops tracking an LView. */
export declare function unregisterLView(lView: LView): void;
/** Gets the currently-tracked views. */
export declare function getTrackedLViews(): ReadonlyMap<number, LView>;
