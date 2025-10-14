/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import type { Injector, ɵProviderRecord as ProviderRecord } from '@angular/core';
import { ComponentExplorerViewQuery, DirectivesProperties, ElementPosition, SerializedInjector, SerializedProviderRecord, UpdatedStateData } from '../../../../protocol';
import { ComponentTreeNode } from '../interfaces';
export declare const injectorToId: WeakMap<HTMLElement | Injector, string>;
export declare const nodeInjectorToResolutionPath: WeakMap<HTMLElement, SerializedInjector[]>;
export declare const idToInjector: Map<string, Injector>;
export declare const injectorsSeen: Set<string>;
export declare function getInjectorId(): string;
export declare function getInjectorMetadata(injector: Injector): {
    type: "element";
    source: import("../../../../../../packages/core/src/render3/interfaces/renderer_dom").RElement;
} | {
    type: "environment";
    source: string | null;
} | {
    type: "null";
    source: null;
} | null;
export declare function getInjectorResolutionPath(injector: Injector): Injector[];
export declare function getInjectorFromElementNode(element: Node): Injector | null;
export declare const getLatestComponentState: (query: ComponentExplorerViewQuery, directiveForest?: ComponentTreeNode[]) => {
    directiveProperties: DirectivesProperties;
} | undefined;
export declare function isOnPushDirective(dir: any): boolean;
export declare function getInjectorProviders(injector: Injector): ProviderRecord[];
export declare function serializeInjector(injector: Injector): Omit<SerializedInjector, 'id'> | null;
export declare function serializeProviderRecord(providerRecord: ProviderRecord, index: number, hasImportPath?: boolean): SerializedProviderRecord;
export declare function getElementInjectorElement(elementInjector: Injector): HTMLElement;
export declare function isElementInjector(injector: Injector): boolean;
export declare const buildDirectiveForest: () => ComponentTreeNode[];
export declare const queryDirectiveForest: (position: ElementPosition, forest: ComponentTreeNode[]) => ComponentTreeNode | null;
export declare const findNodeInForest: (position: ElementPosition, forest: ComponentTreeNode[]) => HTMLElement | null;
export declare const findNodeFromSerializedPosition: (serializedPosition: string) => ComponentTreeNode | null;
export declare const updateState: (updatedStateData: UpdatedStateData) => void;
export declare function serializeResolutionPath(resolutionPath: Injector[]): SerializedInjector[];
