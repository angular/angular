/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { TAttributes, TContainerNode, TElementContainerNode, TElementNode, TIcuContainerNode, TLetDeclarationNode, TNode, TNodeType, TProjectionNode } from './interfaces/node';
import { TView } from './interfaces/view';
/**
 * Create and stores the TNode, and hooks it up to the tree.
 *
 * @param tView The current `TView`.
 * @param index The index at which the TNode should be saved (null if view, since they are not
 * saved).
 * @param type The type of TNode to create
 * @param native The native element for this node, if applicable
 * @param name The tag name of the associated native element, if applicable
 * @param attrs Any attrs for the native element, if applicable
 */
export declare function getOrCreateTNode(tView: TView, index: number, type: TNodeType.Element | TNodeType.Text, name: string | null, attrs: TAttributes | null): TElementNode;
export declare function getOrCreateTNode(tView: TView, index: number, type: TNodeType.Container, name: string | null, attrs: TAttributes | null): TContainerNode;
export declare function getOrCreateTNode(tView: TView, index: number, type: TNodeType.Projection, name: null, attrs: TAttributes | null): TProjectionNode;
export declare function getOrCreateTNode(tView: TView, index: number, type: TNodeType.ElementContainer, name: string | null, attrs: TAttributes | null): TElementContainerNode;
export declare function getOrCreateTNode(tView: TView, index: number, type: TNodeType.Icu, name: null, attrs: TAttributes | null): TElementContainerNode;
export declare function getOrCreateTNode(tView: TView, index: number, type: TNodeType.LetDeclaration, name: null, attrs: null): TLetDeclarationNode;
export declare function getOrCreateTNode(tView: TView, index: number, type: TNodeType, name: string | null, attrs: TAttributes | null): TElementNode | TContainerNode | TElementContainerNode | TProjectionNode | TIcuContainerNode | TLetDeclarationNode;
export declare function createTNodeAtIndex(tView: TView, index: number, type: TNodeType, name: string | null, attrs: TAttributes | null): TNode;
/**
 * Constructs a TNode object from the arguments.
 *
 * @param tView `TView` to which this `TNode` belongs
 * @param tParent Parent `TNode`
 * @param type The type of the node
 * @param index The index of the TNode in TView.data, adjusted for HEADER_OFFSET
 * @param tagName The tag name of the node
 * @param attrs The attributes defined on this node
 * @returns the TNode object
 */
export declare function createTNode(tView: TView, tParent: TElementNode | TContainerNode | null, type: TNodeType.Container, index: number, tagName: string | null, attrs: TAttributes | null): TContainerNode;
export declare function createTNode(tView: TView, tParent: TElementNode | TContainerNode | null, type: TNodeType.Element | TNodeType.Text, index: number, tagName: string | null, attrs: TAttributes | null): TElementNode;
export declare function createTNode(tView: TView, tParent: TElementNode | TContainerNode | null, type: TNodeType.ElementContainer, index: number, tagName: string | null, attrs: TAttributes | null): TElementContainerNode;
export declare function createTNode(tView: TView, tParent: TElementNode | TContainerNode | null, type: TNodeType.Icu, index: number, tagName: string | null, attrs: TAttributes | null): TIcuContainerNode;
export declare function createTNode(tView: TView, tParent: TElementNode | TContainerNode | null, type: TNodeType.Projection, index: number, tagName: string | null, attrs: TAttributes | null): TProjectionNode;
export declare function createTNode(tView: TView, tParent: TElementNode | TContainerNode | null, type: TNodeType.LetDeclaration, index: number, tagName: null, attrs: null): TLetDeclarationNode;
export declare function createTNode(tView: TView, tParent: TElementNode | TContainerNode | null, type: TNodeType, index: number, tagName: string | null, attrs: TAttributes | null): TNode;
