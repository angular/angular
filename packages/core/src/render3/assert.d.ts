/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { LContainer } from './interfaces/container';
import { DirectiveDef } from './interfaces/definition';
import { TIcu } from './interfaces/i18n';
import { TNode } from './interfaces/node';
import { LView, TView } from './interfaces/view';
export declare function assertTNodeForLView(tNode: TNode, lView: LView): void;
export declare function assertTNodeCreationIndex(lView: LView, index: number): void;
export declare function assertTNodeForTView(tNode: TNode, tView: TView): void;
export declare function assertTNode(tNode: TNode): void;
export declare function assertTIcu(tIcu: TIcu): void;
export declare function assertComponentType(actual: any, msg?: string): void;
export declare function assertNgModuleType(actual: any, msg?: string): void;
export declare function assertCurrentTNodeIsParent(isParent: boolean): void;
export declare function assertHasParent(tNode: TNode | null): void;
export declare function assertLContainer(value: any): asserts value is LContainer;
export declare function assertLViewOrUndefined(value: any): asserts value is LView | null | undefined;
export declare function assertLView(value: any): asserts value is LView;
export declare function assertFirstCreatePass(tView: TView, errMessage?: string): void;
export declare function assertFirstUpdatePass(tView: TView, errMessage?: string): void;
/**
 * This is a basic sanity check that an object is probably a directive def. DirectiveDef is
 * an interface, so we can't do a direct instanceof check.
 */
export declare function assertDirectiveDef<T>(obj: any): asserts obj is DirectiveDef<T>;
export declare function assertIndexInDeclRange(tView: TView, index: number): void;
export declare function assertIndexInExpandoRange(lView: LView, index: number): void;
export declare function assertBetween(lower: number, upper: number, index: number): void;
export declare function assertProjectionSlots(lView: LView, errMessage?: string): void;
export declare function assertParentView(lView: LView | null, errMessage?: string): void;
export declare function assertNoDuplicateDirectives(directives: DirectiveDef<unknown>[]): void;
/**
 * This is a basic sanity check that the `injectorIndex` seems to point to what looks like a
 * NodeInjector data structure.
 *
 * @param lView `LView` which should be checked.
 * @param injectorIndex index into the `LView` where the `NodeInjector` is expected.
 */
export declare function assertNodeInjector(lView: LView, injectorIndex: number): void;
