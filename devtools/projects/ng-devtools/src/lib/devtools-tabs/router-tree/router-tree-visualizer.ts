/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as d3 from 'd3';
import {Route} from '../../../../../protocol';

let arrowDefId = 0;

export type RouterTreeD3Node = d3.HierarchyPointNode<Route>;

interface RouterTreeVisualizerConfig {
  orientation: 'horizontal' | 'vertical';
  nodeSize: [width: number, height: number];
  nodeSeparation: (nodeA: RouterTreeD3Node, nodeB: RouterTreeD3Node) => number;
  nodeLabelSize: [width: number, height: number];
}

export class RouterTreeVisualizer {
  private readonly config: RouterTreeVisualizerConfig;
  private d3 = d3;
  private root: RouterTreeD3Node | null = null;
  private zoomController: d3.ZoomBehavior<HTMLElement, unknown> | null = null;

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
    this.config = {
      orientation,
      nodeSize,
      nodeSeparation,
      nodeLabelSize,
    };
  }

  private zoomScale(scale: number) {
    if (this.zoomController) {
      this.zoomController.scaleTo(
        this.d3.select<HTMLElement, unknown>(this._containerElement),
        scale,
      );
    }
  }

  snapToRoot(scale = 1): void {
    if (this.root) {
      this.snapToNode(this.root, scale);
    }
  }

  private snapToNode(node: RouterTreeD3Node, scale = 1): void {
    const svg = this.d3.select(this._containerElement);
    const halfHeight = this._containerElement.clientHeight / 2;
    const t = d3.zoomIdentity.translate(250, halfHeight - node.x).scale(scale);
    svg.transition().duration(500).call(this.zoomController!.transform, t);
  }

  get graphElement(): HTMLElement {
    return this._graphElement;
  }

  private getNodeById(id: string): RouterTreeD3Node | null {
    const selection = this.d3
      .select<HTMLElement, RouterTreeD3Node>(this._containerElement)
      .select(`.node[data-id="${id}"]`);
    if (selection.empty()) {
      return null;
    }
    return selection.datum();
  }

  cleanup(): void {
    this.d3.select(this._graphElement).selectAll('*').remove();
  }

  render(route: Route, filterRegex: RegExp, showFullPath: boolean): void {
    // cleanup old graph
    this.cleanup();

    const data = this.d3.hierarchy(route, (node: Route) => node.children);
    const tree = this.d3.tree<Route>();
    const svg = this.d3.select(this._containerElement);
    const g = this.d3.select<HTMLElement, RouterTreeD3Node>(this._graphElement);

    const size = 20;

    svg.selectAll('text').remove();
    svg.selectAll('rect').remove();
    svg.selectAll('defs').remove();

    svg
      .append('rect')
      .attr('x', 10)
      .attr('y', 10)
      .attr('width', size)
      .attr('height', size)
      .style('stroke', 'var(--red-05)')
      .style('fill', 'var(--red-06)');

    svg
      .append('rect')
      .attr('x', 10)
      .attr('y', 45)
      .attr('width', size)
      .attr('height', size)
      .style('stroke', 'var(--blue-02)')
      .style('fill', 'var(--blue-03)');

    svg
      .append('rect')
      .attr('x', 10)
      .attr('y', 80)
      .attr('width', size)
      .attr('height', size)
      .style('stroke', 'var(--green-02)')
      .style('fill', 'var(--green-03)');

    svg
      .append('text')
      .attr('x', 37)
      .attr('y', 21)
      .attr('class', 'legend-router-tree')
      .text('Eager loaded routes')
      .attr('alignment-baseline', 'middle');

    svg
      .append('text')
      .attr('x', 37)
      .attr('y', 56)
      .attr('class', 'legend-router-tree')
      .text('Lazy Loaded Route')
      .attr('alignment-baseline', 'middle');

    svg
      .append('text')
      .attr('x', 37)
      .attr('y', 92)
      .attr('class', 'legend-router-tree')
      .text('Active Route')
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
          return `M${node.y},${node.x},C${(node.y + parent.y) / 2}, ${node.x} ${(node.y + parent.y) / 2},${parent.x} ${parent.y},${parent.x}`;
        }

        return `M${node.x},${node.y},C${(node.x + parent.x) / 2}, ${node.y} ${(node.x + parent.x) / 2},${parent.y} ${parent.x},${parent.y}`;
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
        const isMatched = filterRegex.test(label.toLowerCase());

        const nodeClasses = ['node-container'];
        if (node.data.isActive) {
          nodeClasses.push('node-element');
        } else if (node.data.isLazy) {
          nodeClasses.push('node-lazy');
        } else {
          nodeClasses.push('node-environment');
        }

        if (isMatched) {
          nodeClasses.push('node-search');
        }
        return nodeClasses.join(' ');
      })
      .text((node: RouterTreeD3Node) => {
        const label =
          (showFullPath
            ? node.data.path
            : node.data.path.replace(node.parent?.data.path || '', '')) || '';
        const lengthLimit = 25;
        const labelText =
          label.length > lengthLimit ? label.slice(0, lengthLimit - '...'.length) + '...' : label;

        return labelText;
      });

    svg.attr('height', '100%').attr('width', '100%');
  }
}
