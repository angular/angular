/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { FlatTreeControl } from '@angular/cdk/tree';
import { DevToolsNode, ElementPosition } from '../../../../../../protocol';
import { ComponentDataSource, FlatNode } from './component-data-source';
import { IndexedNode } from './index-forest';
import { FilterFn } from './filter/filter.component';
import { NodeTextMatch } from './tree-node/tree-node.component';
export declare class DirectiveForestComponent {
    private readonly tabUpdate;
    private readonly messageBus;
    private readonly elementRef;
    readonly forest: import("@angular/core").InputSignal<DevToolsNode<import("../../../../../../protocol").DirectiveType, import("../../../../../../protocol").ComponentType>[]>;
    readonly showCommentNodes: import("@angular/core").InputSignal<boolean>;
    readonly currentSelectedElement: import("@angular/core").InputSignal<IndexedNode>;
    readonly selectNode: import("@angular/core").OutputEmitterRef<IndexedNode | null>;
    readonly selectDomElement: import("@angular/core").OutputEmitterRef<IndexedNode>;
    readonly setParents: import("@angular/core").OutputEmitterRef<FlatNode[] | null>;
    readonly highlightComponent: import("@angular/core").OutputEmitterRef<ElementPosition>;
    readonly removeComponentHighlight: import("@angular/core").OutputEmitterRef<void>;
    readonly toggleInspector: import("@angular/core").OutputEmitterRef<void>;
    readonly viewport: import("@angular/core").Signal<CdkVirtualScrollViewport>;
    readonly selectedNode: import("@angular/core").WritableSignal<FlatNode | null>;
    readonly highlightIdInTreeFromElement: import("@angular/core").WritableSignal<number | null>;
    readonly matchedNodes: import("@angular/core").WritableSignal<Map<number, NodeTextMatch[]>>;
    readonly matchesCount: import("@angular/core").Signal<number>;
    readonly currentlyMatchedIndex: import("@angular/core").WritableSignal<number>;
    protected readonly selectedNodeIdx: import("@angular/core").Signal<number>;
    readonly treeControl: FlatTreeControl<FlatNode, FlatNode>;
    readonly dataSource: ComponentDataSource;
    readonly itemHeight = 18;
    readonly filterGenerator: import("./filter/filter.component").FilterFnGenerator;
    private parents;
    private initialized;
    private forestRoot;
    constructor();
    handleSelectDomElement(node: FlatNode): void;
    highlightNode(node: FlatNode): void;
    removeHighlight(): void;
    selectAndEnsureVisible(node: FlatNode): void;
    select(node: FlatNode): void;
    clearSelectedNode(): void;
    navigateUp(event: Event): void;
    navigateDown(event: Event): void;
    collapseCurrent(event: Event): void;
    expandCurrent(event: Event): void;
    isEditingDirectiveState(event: Event): boolean;
    handleFilter(filterFn: FilterFn): void;
    navigateMatchedNode(dir: 'next' | 'prev'): void;
    private reselectNodeOnUpdate;
    private updateForest;
    private populateParents;
    private subscribeToInspectorEvents;
    private selectNodeByComponentId;
    private expandParents;
    private handleViewportResize;
}
