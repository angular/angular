/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import type { ComponentDef, DirectiveDef } from '../interfaces/definition';
import { type TContainerNode, type TElementContainerNode, type TElementNode, type TNode } from '../interfaces/node';
import { type LView, type TView } from '../interfaces/view';
export type DirectiveMatcherStrategy = (tView: TView, tNode: TElementNode | TContainerNode | TElementContainerNode) => DirectiveDef<unknown>[] | null;
/**
 * Resolve the matched directives on a node.
 */
export declare function resolveDirectives(tView: TView, lView: LView, tNode: TElementNode | TContainerNode | TElementContainerNode, localRefs: string[] | null, directiveMatcher: DirectiveMatcherStrategy): void;
/**
 * Add `hostBindings` to the `TView.hostBindingOpCodes`.
 *
 * @param tView `TView` to which the `hostBindings` should be added.
 * @param tNode `TNode` the element which contains the directive
 * @param directiveIdx Directive index in view.
 * @param directiveVarsIdx Where will the directive's vars be stored
 * @param def `ComponentDef`/`DirectiveDef`, which contains the `hostVars`/`hostBindings` to add.
 */
export declare function registerHostBindingOpCodes(tView: TView, tNode: TNode, directiveIdx: number, directiveVarsIdx: number, def: ComponentDef<any> | DirectiveDef<any>): void;
