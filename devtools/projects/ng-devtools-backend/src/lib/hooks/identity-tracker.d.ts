/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { DevToolsNode, ElementPosition } from '../../../../protocol';
import { ComponentInstanceType, ComponentTreeNode, DirectiveInstanceType } from '../interfaces';
export declare interface Type<T> extends Function {
    new (...args: any[]): T;
}
export type NodeArray = {
    directive: any;
    isComponent: boolean;
}[];
export declare class IdentityTracker {
    private static _instance;
    private _directiveIdCounter;
    private _currentDirectivePosition;
    private _currentDirectiveId;
    isComponent: Map<any, boolean>;
    private constructor();
    static getInstance(): IdentityTracker;
    getDirectivePosition(dir: any): ElementPosition | undefined;
    getDirectiveId(dir: any): number | undefined;
    hasDirective(dir: any): boolean;
    index(): {
        newNodes: NodeArray;
        removedNodes: NodeArray;
        indexedForest: IndexedNode[];
        directiveForest: ComponentTreeNode[];
    };
    private _index;
    private _indexNode;
    destroy(): void;
}
export interface IndexedNode extends DevToolsNode<DirectiveInstanceType, ComponentInstanceType> {
    position: ElementPosition;
    children: IndexedNode[];
}
export declare const indexForest: <T extends DevToolsNode<DirectiveInstanceType, ComponentInstanceType>>(forest: T[]) => IndexedNode[];
