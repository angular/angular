/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ComponentExplorerView, SerializedProviderRecord } from '../../../../../protocol';
import { TreeVisualizerConfig } from '../../shared/tree-visualizer/tree-visualizer';
import { InjectorTreeD3Node, InjectorTreeNode, InjectorTreeVisualizer } from './injector-tree-fns';
import { ResponsiveSplitConfig } from '../../shared/split/responsive-split.directive';
import { Direction } from '../../shared/split/interface';
export declare class InjectorTreeComponent {
    private readonly elementTree;
    private readonly environmentTree;
    private readonly messageBus;
    protected readonly selectedNode: import("@angular/core").WritableSignal<InjectorTreeD3Node | null>;
    protected readonly injectorProvidersEnabled: import("@angular/core").WritableSignal<boolean>;
    protected readonly injectorProvidersVisible: import("@angular/core").Signal<boolean | null>;
    protected readonly providers: import("@angular/core").InputSignal<SerializedProviderRecord[]>;
    protected readonly componentExplorerView: import("@angular/core").InputSignal<ComponentExplorerView | null>;
    protected readonly hidden: import("@angular/core").InputSignal<boolean>;
    protected readonly diDebugAPIsAvailable: import("@angular/core").Signal<boolean>;
    private rawDirectiveForest;
    private elementToEnvironmentPath;
    private hideInjectorsWithNoProviders;
    private hideFrameworkInjectors;
    protected readonly elementInjectorTree: import("@angular/core").WritableSignal<InjectorTreeNode | null>;
    protected readonly environmentInjectorTree: import("@angular/core").WritableSignal<InjectorTreeNode | null>;
    protected readonly responsiveSplitConfig: ResponsiveSplitConfig;
    protected readonly envHierarchySize: import("@angular/core").WritableSignal<number>;
    protected readonly elHierarchySize: import("@angular/core").WritableSignal<number>;
    environmentTreeConfig: Partial<TreeVisualizerConfig<InjectorTreeNode>>;
    elementTreeConfig: Partial<TreeVisualizerConfig<InjectorTreeNode>>;
    constructor();
    toggleHideInjectorsWithNoProviders(): void;
    toggleHideAngularInjectors(): void;
    onTreeRender(tree: InjectorTreeVisualizer, { initial }: {
        initial: boolean;
    }): void;
    selectInjectorByNode(node: InjectorTreeD3Node): void;
    onResponsiveSplitDirChange(direction: Direction): void;
    private init;
    private refreshVisualizer;
    /**
     *
     * Converts the array of resolution paths for every node in the
     * directive forest into a tree structure that can be rendered by the
     * injector tree visualizer.
     *
     */
    private updateInjectorTreeVisualization;
    private snapToRoot;
    private snapToNode;
    private reselectSelectedNode;
    private getNodeByComponentId;
    private highlightPathFromSelectedInjector;
    private highlightNodeById;
    private highlightEdgeById;
    private unhighlightAllEdges;
    private unhighlightAllNodes;
    private getProviders;
}
