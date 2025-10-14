/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { DevToolsNode, SerializedInjector } from '../../../../../protocol';
import { SvgD3Link, SvgD3Node, TreeD3Node, TreeNode } from '../../shared/tree-visualizer/tree-visualizer';
import { TreeVisualizerComponent } from '../../shared/tree-visualizer/tree-visualizer.component';
export interface InjectorPath {
    node: DevToolsNode;
    path: SerializedInjector[];
}
export type InjectorTreeVisualizer = TreeVisualizerComponent<InjectorTreeNode>;
export interface InjectorTreeNode extends TreeNode {
    injector: SerializedInjector;
    children: InjectorTreeNode[];
}
export type InjectorTreeD3Node = TreeD3Node<InjectorTreeNode>;
export declare function getInjectorIdsToRootFromNode(node: InjectorTreeD3Node): string[];
export declare function generateEdgeIdsFromNodeIds(nodeIds: string[]): string[];
export declare function equalInjector(a: SerializedInjector, b: SerializedInjector): boolean;
export declare function findExistingPath(path: InjectorTreeNode[], value: SerializedInjector): InjectorTreeNode | null;
export declare function transformInjectorResolutionPathsIntoTree(injectorPaths: InjectorPath[]): InjectorTreeNode;
export declare function grabInjectorPathsFromDirectiveForest(directiveForest: DevToolsNode[]): InjectorPath[];
export declare function splitInjectorPathsIntoElementAndEnvironmentPaths(injectorPaths: InjectorPath[]): {
    elementPaths: InjectorPath[];
    environmentPaths: InjectorPath[];
    startingElementToEnvironmentPath: Map<string, SerializedInjector[]>;
};
export declare function filterOutInjectorsWithNoProviders(injectorPaths: InjectorPath[]): InjectorPath[];
export declare function filterOutAngularInjectors(injectorPaths: InjectorPath[]): InjectorPath[];
export declare function d3InjectorTreeLinkModifier(link: SvgD3Link<InjectorTreeNode>): void;
export declare function d3InjectorTreeNodeModifier(d3Node: SvgD3Node<InjectorTreeNode>): void;
