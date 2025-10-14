/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { LContainer } from './container';
import { ComponentDef, DirectiveDef } from './definition';
import { TNode } from './node';
import { RNode } from './renderer_dom';
import { LView } from './view';
/**
 * True if `value` is `LView`.
 * @param value wrapped value of `RNode`, `LView`, `LContainer`
 */
export declare function isLView(value: RNode | LView | LContainer | {} | null): value is LView;
/**
 * True if `value` is `LContainer`.
 * @param value wrapped value of `RNode`, `LView`, `LContainer`
 */
export declare function isLContainer(value: RNode | LView | LContainer | {} | null): value is LContainer;
export declare function isContentQueryHost(tNode: TNode): boolean;
export declare function isComponentHost(tNode: TNode): boolean;
export declare function isDirectiveHost(tNode: TNode): boolean;
export declare function isComponentDef<T>(def: DirectiveDef<T>): def is ComponentDef<T>;
export declare function isRootView(target: LView): boolean;
export declare function isProjectionTNode(tNode: TNode): boolean;
export declare function hasI18n(lView: LView): boolean;
export declare function isDestroyed(lView: LView): boolean;
