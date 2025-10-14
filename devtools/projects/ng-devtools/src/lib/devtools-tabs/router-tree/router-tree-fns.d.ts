/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { TreeD3Node, TreeNode } from '../../shared/tree-visualizer/tree-visualizer';
import { Route } from '../../../../../protocol';
import { TreeVisualizerComponent } from '../../shared/tree-visualizer/tree-visualizer.component';
export interface RouterTreeNode extends TreeNode, Route {
    children: RouterTreeNode[];
}
export type RouterTreeVisualizer = TreeVisualizerComponent<RouterTreeNode>;
export type RouterTreeD3Node = TreeD3Node<RouterTreeNode>;
export declare function getRouteLabel(route: Route | RouterTreeNode, parent: Route | RouterTreeNode | undefined, showFullPath: boolean): string;
export declare function mapRoute(route: Route, parent: Route | undefined, showFullPath: boolean): RouterTreeNode;
export declare function transformRoutesIntoVisTree(root: Route, showFullPath: boolean): RouterTreeNode;
export declare function findNodesByLabel(root: RouterTreeNode, searchString: string): Set<RouterTreeNode>;
