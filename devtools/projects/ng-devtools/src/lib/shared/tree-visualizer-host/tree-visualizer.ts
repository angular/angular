/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as d3 from 'd3';
import {GraphRenderer} from './graph-renderer';

let arrowDefId = 0;
let ariaNodeIdIdx = 1;

const MAX_NODE_LABEL_LENGTH = 25;

export interface TreeNode {
  label: string;
  children: TreeNode[];
}

export type TreeD3Node<T extends TreeNode> = d3.HierarchyPointNode<T>;

export type SvgD3Node<T extends TreeNode> = d3.Selection<
  d3.BaseType,
  TreeD3Node<T>,
  HTMLElement,
  TreeD3Node<T>
>;

export type SvgD3Link<T extends TreeNode> = d3.Selection<
  SVGPathElement,
  d3.HierarchyPointNode<T>,
  HTMLElement,
  TreeD3Node<T>
>;

export interface TreeVisualizerConfig<T extends TreeNode> {
  /** WARNING: For vertically-oriented trees, use separation greater than `1` */
  orientation: 'horizontal' | 'vertical';
  nodeSize: [width: number, height: number];
  nodeSeparation: (nodeA: TreeD3Node<T>, nodeB: TreeD3Node<T>) => number;
  nodeLabelSize: [width: number, height: number];
  /** Perform custom changes on the SVG node (e.g. set classes, colors, attributes, etc.) */
  d3NodeModifier: (node: SvgD3Node<T>) => void;
  /** Perform custom changes on the SVG link (e.g. set classes, colors, attributes, etc.) */
  d3LinkModifier: (link: SvgD3Link<T>) => void;
}

export class TreeVisualizer<T extends TreeNode = TreeNode> extends GraphRenderer<T, TreeD3Node<T>> {
  private zoomController: d3.ZoomBehavior<HTMLElement, unknown> | null = null;
  private readonly config: TreeVisualizerConfig<T>;
  private readonly defaultConfig: TreeVisualizerConfig<T> = {
    orientation: 'horizontal',
    nodeSize: [200, 500],
    nodeSeparation: () => 2,
    nodeLabelSize: [250, 60],
    d3NodeModifier: () => {},
    d3LinkModifier: () => {},
  };

  constructor(
    private readonly containerElement: HTMLElement,
    public readonly graphElement: HTMLElement,
    config: Partial<TreeVisualizerConfig<T>> = {},
  ) {
    super();

    this.config = {
      ...this.defaultConfig,
      ...config,
    };
  }

  override root: TreeD3Node<T> | null = null;

  override zoomScale(scale: number) {
    if (this.zoomController) {
      this.zoomController.scaleTo(d3.select<HTMLElement, unknown>(this.containerElement), scale);
    }
  }

  override snapToRoot(scale = 1): void {
    if (this.root) {
      this.snapToNode(this.root, scale);
    }
  }

  override snapToNode(node: TreeD3Node<T>, scale = 1): void {
    const svg = d3.select(this.containerElement);
    const contHalfWidth = this.containerElement.clientWidth / 2;
    const contHalfHeight = this.containerElement.clientHeight / 2;
    const {x, y} = this.getNodeCoor(node);

    const t = d3.zoomIdentity
      .translate(contHalfWidth, contHalfHeight)
      .scale(scale)
      .translate(-x, -y);
    svg.transition().duration(500).call(this.zoomController!.transform, t);
  }

  override getNodeById(id: string): TreeD3Node<T> | null {
    const selection = d3
      .select<HTMLElement, TreeD3Node<T>>(this.containerElement)
      .select(`.node[data-id="${id}"]`);
    if (selection.empty()) {
      return null;
    }
    return selection.datum();
  }

  override cleanup(): void {
    super.cleanup();
    d3.select(this.graphElement).selectAll('*').remove();
  }

  override render(graph: T): void {
    // cleanup old graph
    this.cleanup();

    const data = d3.hierarchy(graph, (node: T) => node.children as Iterable<T>);
    const tree = d3.tree<T>();
    const svg = d3.select(this.containerElement);
    const g = d3.select<HTMLElement, TreeD3Node<T>>(this.graphElement);

    this.zoomController = d3.zoom<HTMLElement, unknown>().scaleExtent([0.1, 2]);
    this.zoomController.on('start zoom end', (e: {transform: number}) => {
      g.attr('transform', e.transform);
    });
    svg.call(this.zoomController);

    // Compute the new tree layout.
    tree.nodeSize(this.config.nodeSize);
    tree.separation((a: TreeD3Node<T>, b: TreeD3Node<T>) => {
      return this.config.nodeSeparation(a, b);
    });

    const nodes = tree(data);
    this.root = nodes;

    arrowDefId++;
    svg
      .append('svg:defs')
      .selectAll('marker')
      .data([`end${arrowDefId}`]) // Different link/path types can be defined here
      .enter()
      .append('svg:marker') // This section adds in the arrows
      .attr('id', String)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 10)
      .attr('refY', 0)
      .attr('class', 'arrow')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('svg:path')
      .attr('d', 'M0,-5L10,0L0,5');

    const [labelWidth, labelHeight] = this.config.nodeLabelSize;
    const halfLabelWidth = labelWidth / 2;
    const halfLabelHeight = labelHeight / 2;

    const d3Link = g
      .selectAll('.link')
      .data(nodes.descendants().slice(1))
      .enter()
      .append('path')
      .attr('aria-labelledby', (node: TreeD3Node<T>, idx) =>
        this.getLinkAriaId(node, node.parent!, idx),
      )
      .attr('class', 'link')
      .attr('marker-end', `url(#end${arrowDefId})`)
      .attr('d', (node: TreeD3Node<T>) => {
        const {x, y} = this.getNodeCoor(node);
        const {x: parentX, y: parentY} = this.getNodeCoor(node.parent!);

        if (this.config.orientation === 'horizontal') {
          return `
            M${x - halfLabelWidth},${y}
            C${(x + parentX) / 2},
              ${y} ${(x + parentX) / 2},
              ${parentY} ${parentX + halfLabelWidth},
              ${parentY}`;
        }

        return `
          M${x},${y - halfLabelHeight}
          C${x},
            ${(y + parentY) / 2} ${parentX},
            ${(y + parentY) / 2} ${parentX},
            ${parentY + halfLabelHeight}`;
      });

    this.config.d3LinkModifier(d3Link);

    // Set accessibility title
    d3Link
      .append('title')
      .attr('id', (node: TreeD3Node<T>, idx) => this.getLinkAriaId(node, node.parent!, idx))
      .html((node: TreeD3Node<T>) => {
        return `${this.getLinkAriaName(node, node.parent!)} link`;
      });

    // Declare the nodes
    const d3NodeG = g
      .selectAll('g.node-group')
      .data(nodes.descendants())
      .enter()
      .append('g')
      .attr('class', 'node-group')
      .on('click', (pointerEvent: PointerEvent, node: TreeD3Node<T>) => {
        this.nodeClickListeners.forEach((listener) => listener(pointerEvent, node));
      })
      .on('mouseover', (pointerEvent: PointerEvent, node: TreeD3Node<T>) => {
        this.nodeMouseoverListeners.forEach((listener) => listener(pointerEvent, node));
      })
      .on('mouseout', (pointerEvent: PointerEvent, node: TreeD3Node<T>) => {
        this.nodeMouseoutListeners.forEach((listener) => listener(pointerEvent, node));
      })
      .attr('transform', (node: TreeD3Node<T>) => {
        const {x, y} = this.getNodeCoor(node);
        return `translate(${x},${y})`;
      })
      .attr('aria-labelledby', (node: TreeD3Node<T>, idx) => this.getNodeAriaId(node, idx));

    // Set accessibility title
    d3NodeG
      .append('title')
      .attr('id', (node: TreeD3Node<T>, idx) => this.getNodeAriaId(node, idx))
      .html((node: TreeD3Node<T>) => `${this.getNodeAriaName(node)} node`);

    const d3Node = d3NodeG
      .append('foreignObject')
      .attr('width', labelWidth)
      .attr('height', labelHeight)
      .attr('x', -halfLabelWidth)
      .attr('y', -halfLabelHeight)
      .append('xhtml:div')
      .attr('class', 'node')
      .html((node: TreeD3Node<T>) => {
        const label = node.data.label;
        return label.length > MAX_NODE_LABEL_LENGTH
          ? label.slice(0, MAX_NODE_LABEL_LENGTH - '...'.length) + '...'
          : label;
      });

    this.config.d3NodeModifier(d3Node);

    svg.attr('height', '100%').attr('width', '100%');
  }

  /** Returns the node coordinates based on orientation. */
  private getNodeCoor(node: TreeD3Node<T>): {x: number; y: number} {
    const {x, y} = node;

    if (this.config.orientation === 'horizontal') {
      return {
        x: y,
        y: x,
      };
    }
    return {x, y};
  }

  private getLinkAriaName(node: TreeD3Node<T>, parent: TreeD3Node<T>) {
    const parentLabel = parent.data.label;
    const nodeLabel = node.data.label;

    if (parentLabel && nodeLabel) {
      return `${parentLabel}-${nodeLabel}`;
    }
    const definedLabel = nodeLabel ?? parentLabel;

    return definedLabel ? definedLabel : 'Disconnected';
  }

  private getNodeAriaName(node: TreeD3Node<T>) {
    return node.data.label || 'Empty';
  }

  private getLinkAriaId(node: TreeD3Node<T>, parent: TreeD3Node<T>, idx: number) {
    return `${this.getLinkAriaName(node, parent).toLowerCase()}-${idx}-link`;
  }

  private getNodeAriaId(node: TreeD3Node<T>, idx: number) {
    return `${node.data.label.toLowerCase()}-${idx}-node`;
  }
}
