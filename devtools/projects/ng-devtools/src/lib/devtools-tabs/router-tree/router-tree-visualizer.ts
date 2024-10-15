/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 * 
 *
 - legend
- path highlight
- search
- more details
 */

import * as d3 from 'd3';
import {Route} from 'protocol';

let arrowDefId = 0;

export type RouterTreeD3Node = d3.HierarchyPointNode<Route>;
type ClickHandler<U> = (pointerEvent: PointerEvent, node: U) => void;
export abstract class GraphRenderer<T, U> {
  abstract render(graph: T, filterRegex: RegExp, showFullPath: boolean): void;
  abstract getNodeById(id: string): U | null;
  abstract snapToNode(node: U): void;
  abstract snapToRoot(): void;
  abstract zoomScale(scale: number): void;
  abstract root: U | null;
  abstract get graphElement(): HTMLElement;

  protected nodeClickListeners: Array<ClickHandler<U>> = [];
  protected nodeMouseoverListeners: Array<ClickHandler<U>> = [];
  protected nodeMouseoutListeners: Array<ClickHandler<U>> = [];

  cleanup(): void {
    this.nodeClickListeners = [];
    this.nodeMouseoverListeners = [];
    this.nodeMouseoutListeners = [];
  }

  onNodeClick(cb: (pointerEvent: PointerEvent, node: U) => void): void {
    this.nodeClickListeners.push(cb);
  }

  onNodeMouseover(cb: (pointerEvent: PointerEvent, node: U) => void): void {
    this.nodeMouseoverListeners.push(cb);
  }

  onNodeMouseout(cb: (pointerEvent: PointerEvent, node: U) => void): void {
    this.nodeMouseoutListeners.push(cb);
  }
}

interface RouterTreeVisualizerConfig {
  orientation: 'horizontal' | 'vertical';
  nodeSize: [width: number, height: number];
  nodeSeparation: (nodeA: RouterTreeD3Node, nodeB: RouterTreeD3Node) => number;
  nodeLabelSize: [width: number, height: number];
}

export class RouterTreeVisualizer extends GraphRenderer<Route, RouterTreeD3Node> {
  private readonly config: RouterTreeVisualizerConfig;

  constructor(
    private _containerElement: HTMLElement,
    private _graphElement: HTMLElement,
    {
      orientation = 'horizontal',
      nodeSize = [200, 500],
      nodeSeparation = () => 2.5,
      nodeLabelSize = [300, 60],
    }: Partial<RouterTreeVisualizerConfig> = {},
  ) {
    super();

    this.config = {
      orientation,
      nodeSize,
      nodeSeparation,
      nodeLabelSize,
    };
  }

  private d3 = d3;

  override root: RouterTreeD3Node | null = null;
  zoomController: d3.ZoomBehavior<HTMLElement, unknown> | null = null;

  override zoomScale(scale: number) {
    if (this.zoomController) {
      this.zoomController.scaleTo(
        this.d3.select<HTMLElement, unknown>(this._containerElement),
        scale,
      );
    }
  }

  override snapToRoot(scale = 1): void {
    if (this.root) {
      this.snapToNode(this.root, scale);
    }
  }

  override snapToNode(node: RouterTreeD3Node, scale = 1): void {
    const svg = this.d3.select(this._containerElement);
    const halfHeight = this._containerElement.clientHeight / 2;
    const t = d3.zoomIdentity.translate(250, halfHeight - node.x).scale(scale);
    svg.transition().duration(500).call(this.zoomController!.transform, t);
  }

  override get graphElement(): HTMLElement {
    return this._graphElement;
  }

  override getNodeById(id: string): RouterTreeD3Node | null {
    const selection = this.d3
      .select<HTMLElement, RouterTreeD3Node>(this._containerElement)
      .select(`.node[data-id="${id}"]`);
    if (selection.empty()) {
      return null;
    }
    return selection.datum();
  }

  override cleanup(): void {
    super.cleanup();
    this.d3.select(this._graphElement).selectAll('*').remove();
  }

  override render(route: Route, filterRegex: RegExp, showFullPath: boolean): void {
    // cleanup old graph
    this.cleanup();

    const data = this.d3.hierarchy(route, (node: Route) => node.children);
    const tree = this.d3.tree<Route>();
    const svg = this.d3.select(this._containerElement);
    const g = this.d3.select<HTMLElement, RouterTreeD3Node>(this._graphElement);

    const size = 20;

    svg
      .append('rect')
      .attr('x', 10)
      .attr('y', 10)
      .attr('width', size)
      .attr('height', size)
      .style('stroke', '#ff7a7e')
      .style('fill', '#f9c2c5');

    svg
      .append('rect')
      .attr('x', 10)
      .attr('y', 45)
      .attr('width', size)
      .attr('height', size)
      .style('stroke', 'oklch(0.65 0.25 266/1)')
      .style('fill', '#8bc1ff');

    svg
      .append('rect')
      .attr('x', 10)
      .attr('y', 80)
      .attr('width', size)
      .attr('height', size)
      .style('stroke', '#28ab2c')
      .style('fill', '#a7d5a9');

    svg
      .append('text')
      .attr('x', 37)
      .attr('y', 21)
      .text('Eager loaded routes')

      .style('font-size', '15px')
      .attr('alignment-baseline', 'middle');

    svg
      .append('text')
      .attr('x', 37)
      .attr('y', 56)
      .text('Lazy Loaded Route')
      .style('font-size', '15px')
      .attr('alignment-baseline', 'middle');

    svg
      .append('text')
      .attr('x', 37)
      .attr('y', 92)
      .text('Active Route')
      .style('font-size', '15px')
      .attr('alignment-baseline', 'middle');

    this.zoomController = this.d3.zoom<HTMLElement, unknown>().scaleExtent([0.1, 2]);
    this.zoomController.on('start zoom end', (e: {transform: number}) => {
      g.attr('transform', e.transform);
    });
    svg.call(this.zoomController);

    // Compute the new tree layout.
    tree.nodeSize(this.config.nodeSize);
    tree.separation((a: RouterTreeD3Node, b: RouterTreeD3Node) => {
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
      .attr('refX', 15)
      .attr('refY', 0)
      .attr('class', 'arrow')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('svg:path')
      .attr('d', 'M0,-5L10,0L0,5');

    g.selectAll('.link')
      .data(nodes.descendants().slice(1))
      .enter()
      .append('path')
      .attr('class', (node: RouterTreeD3Node) => {
        return `link`;
      })
      .attr('d', (node: RouterTreeD3Node) => {
        const parent = node.parent!;
        if (this.config.orientation === 'horizontal') {
          return `
                    M${node.y},${node.x}
                    C${(node.y + parent.y) / 2},
                      ${node.x} ${(node.y + parent.y) / 2},
                      ${parent.x} ${parent.y},
                      ${parent.x}`;
        }

        return `
              M${node.x},${node.y}
              C${(node.x + parent.x) / 2},
                ${node.y} ${(node.x + parent.x) / 2},
                ${parent.y} ${parent.x},
                ${parent.y}`;
      });

    // Declare the nodes
    const node = g
      .selectAll('g.node')
      .data(nodes.descendants())
      .enter()
      .append('g')
      .attr('class', (node: RouterTreeD3Node) => {
        return `node`;
      })
      .on('click', (pointerEvent: PointerEvent, node: RouterTreeD3Node) => {
        this.nodeClickListeners.forEach((listener) => listener(pointerEvent, node));
      })
      .on('mouseover', (pointerEvent: PointerEvent, node: RouterTreeD3Node) => {
        this.nodeMouseoverListeners.forEach((listener) => listener(pointerEvent, node));
      })
      .on('mouseout', (pointerEvent: PointerEvent, node: RouterTreeD3Node) => {
        this.nodeMouseoutListeners.forEach((listener) => listener(pointerEvent, node));
      })

      .attr('transform', (node: RouterTreeD3Node) => {
        if (this.config.orientation === 'horizontal') {
          return `translate(${node.y},${node.x})`;
        }

        return `translate(${node.x},${node.y})`;
      });

    const [width, height] = this.config.nodeLabelSize!;

    node
      .append('foreignObject')
      .attr('width', width)
      .attr('height', height)
      .attr('x', -1 * (width - 10))
      .attr('y', -1 * (height / 2))
      .append('xhtml:div')
      .attr('title', (node: RouterTreeD3Node) => {
        return node.data.path || '';
      })
      .attr('class', (node: RouterTreeD3Node) => {
        const label =
          (showFullPath
            ? node.data.path
            : node.data.path.replace(node.parent?.data.path || '', '')) || '';
        const isMatched =
          filterRegex.test(label.toLowerCase()) || filterRegex.test(label.toLowerCase());

        let nodeClass = 'node-container node-environment';
        if (node.data.isActive) {
          nodeClass = 'node-container node-element';
        } else if (node.data.isLazy) {
          nodeClass = 'node-container node-lazy';
        }

        if (isMatched) {
          nodeClass = `${nodeClass} node-search`;
        }
        return nodeClass;
      })
      .html((node: RouterTreeD3Node) => {
        const label =
          (showFullPath
            ? node.data.path
            : node.data.path.replace(node.parent?.data.path || '', '')) || '';
        const lengthLimit = 25;
        const labelText =
          label.length > lengthLimit ? label.slice(0, lengthLimit - '...'.length) + '...' : label;

        const isMatched =
          filterRegex.test(label.toLowerCase()) || filterRegex.test(label.toLowerCase());

        let htmlContent = labelText;
        if (isMatched) {
          htmlContent = '<u><b>' + labelText + '</b></u>';
        }
        return htmlContent;
      });

    svg.attr('height', '100%').attr('width', '100%');
  }
}
