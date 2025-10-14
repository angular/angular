/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as d3 from 'd3';
import { GraphRenderer } from './graph-renderer';
export interface TreeNode {
    label: string;
    subLabel?: string;
    children: TreeNode[];
}
export type TreeD3Node<T extends TreeNode> = d3.HierarchyPointNode<T>;
export type SvgD3Node<T extends TreeNode> = d3.Selection<d3.BaseType, TreeD3Node<T>, HTMLElement, TreeD3Node<T>>;
export type SvgD3Link<T extends TreeNode> = d3.Selection<SVGPathElement, d3.HierarchyPointNode<T>, HTMLElement, TreeD3Node<T>>;
export interface TreeVisualizerConfig<T extends TreeNode> {
    /** WARNING: For vertically-oriented trees, use separation greater than `1` */
    orientation: 'horizontal' | 'vertical';
    nodeSize: [width: number, height: number];
    nodeSeparation: (nodeA: TreeD3Node<T>, nodeB: TreeD3Node<T>) => number;
    nodeLabelSize: [width: number, height: number];
    arrowDirection: 'parent-to-child' | 'child-to-parent';
    /** Perform custom changes on the SVG node (e.g. set classes, colors, attributes, etc.) */
    d3NodeModifier: (node: SvgD3Node<T>) => void;
    /** Perform custom changes on the SVG link (e.g. set classes, colors, attributes, etc.) */
    d3LinkModifier: (link: SvgD3Link<T>) => void;
}
export declare class TreeVisualizer<T extends TreeNode = TreeNode> extends GraphRenderer<T, TreeD3Node<T>> {
    private readonly containerElement;
    private readonly graphElement;
    private zoomController;
    private snappedNode;
    private snappedNodeListenersDisposeFn?;
    private readonly config;
    private readonly defaultConfig;
    constructor(containerElement: HTMLElement, graphElement: HTMLElement, config?: Partial<TreeVisualizerConfig<T>>);
    root: TreeD3Node<T> | null;
    zoomScale(scale: number): void;
    snapToRoot(scale?: number): void;
    snapToNode(node: T, scale?: number): void;
    getInternalNodeById(id: string): TreeD3Node<T> | null;
    cleanup(): void;
    dispose(): void;
    render(root: T): void;
    /** Returns the node coordinates based on orientation. */
    private getNodeCoor;
    private manageSnappedNode;
    private keepSnappedNodeOnFocus;
    private cleanSnappedNodeOnInteraction;
    private snapToD3Node;
    private findD3NodeByDataNode;
}
