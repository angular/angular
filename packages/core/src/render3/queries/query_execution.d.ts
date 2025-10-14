/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { LView, TView } from '../interfaces/view';
import { RenderFlags, ViewQueriesFunction } from '../interfaces/definition';
import { TNode } from '../interfaces/node';
/** Refreshes all content queries declared by directives in a given view */
export declare function refreshContentQueries(tView: TView, lView: LView): void;
export declare function executeViewQueryFn<T>(flags: RenderFlags, viewQueryFn: ViewQueriesFunction<T>, component: T): void;
export declare function executeContentQueries(tView: TView, tNode: TNode, lView: LView): void;
