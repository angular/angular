/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { LContainer } from './interfaces/container';
import { TNode } from './interfaces/node';
import { LView, TView } from './interfaces/view';
export declare function collectNativeNodes(tView: TView, lView: LView, tNode: TNode | null, result: any[], isProjection?: boolean): any[];
/**
 * Collects all root nodes in all views in a given LContainer.
 */
export declare function collectNativeNodesInLContainer(lContainer: LContainer, result: any[]): void;
