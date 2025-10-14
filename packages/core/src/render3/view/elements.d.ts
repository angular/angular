/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { TElementContainerNode, TNode, TNodeType, type TElementNode } from '../interfaces/node';
import { type LView, type TView } from '../interfaces/view';
import { type DirectiveMatcherStrategy } from './directives';
export declare function directiveHostFirstCreatePass(index: number, lView: LView, type: TNodeType.Element | TNodeType.ElementContainer, name: string, directiveMatcher: DirectiveMatcherStrategy, bindingsEnabled: boolean, attrsIndex?: number | null, localRefsIndex?: number): TElementNode | TElementContainerNode;
export declare function directiveHostEndFirstCreatePass(tView: TView, tNode: TNode): void;
export declare function domOnlyFirstCreatePass(index: number, tView: TView, type: TNodeType.Element | TNodeType.ElementContainer, name: string, attrsIndex?: number | null, localRefsIndex?: number): TElementNode | TElementContainerNode;
