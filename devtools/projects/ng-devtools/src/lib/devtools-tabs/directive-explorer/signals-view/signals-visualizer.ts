/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {WritableSignal} from '@angular/core';
import {DebugSignalGraph, DebugSignalGraphNode} from '../../../../../../protocol';
import * as d3 from 'd3';
import {graphlib, render as dagreRender} from 'dagre-d3-es';

export class SignalsGraphVisualizer {
  private graph: graphlib.Graph;
  private drender: ReturnType<typeof dagreRender>;

  zoomController: d3.ZoomBehavior<SVGSVGElement, unknown>;

  private animationMap: Map<string, number> = new Map();

  private timeouts: Set<number> = new Set();

  constructor(
    private svg: SVGSVGElement,
    private selected: WritableSignal<string | null>,
  ) {
    this.graph = new graphlib.Graph({directed: true});
    this.graph.setGraph({});
    this.graph.graph().rankdir = 'TB';
    this.graph.graph().ranksep = 50;
    this.graph.graph().nodesep = 5;

    this.graph.setDefaultEdgeLabel(() => ({}));

    this.drender = dagreRender();

    const d3svg = d3.select(this.svg);
    d3svg.attr('height', '100%').attr('width', '100%');
    this.resize();

    const g = d3svg.append('g');

    this.zoomController = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.1, 2]);
    this.zoomController.on('start zoom end', (e: {transform: number}) => {
      g.attr('transform', e.transform);
    });

    d3svg.call(this.zoomController);
  }

  setSelected(selected: string | null) {
    d3.select(this.svg)
      .select('.output .nodes')
      .selectAll<SVGGElement, string>('g.node')
      .classed('selected', (d) => d === selected);
  }

  zoomScale(scale: number) {
    if (this.zoomController) {
      const svg = d3.select(this.svg);
      this.zoomController.scaleTo(svg, scale);
    }
  }

  cleanup(): void {
    for (const timeout of this.timeouts) {
      clearTimeout(timeout);
    }
  }

  updateNodeAnimations(updatedNodes: string[], timeout: number) {
    this.timeouts.delete(timeout);

    for (const id of updatedNodes) {
      const count = this.animationMap.get(id) ?? 0;
      if (count > 0) {
        this.animationMap.set(id, count - 1);
      }
    }

    d3.select(this.svg)
      .select('.output .nodes')
      .selectAll<SVGGElement, string>('g.node')
      .select('.label foreignObject .node-label')
      .filter((d) => !this.animationMap.get(d))
      .classed('animating', false);
  }

  reset() {
    for (const node of this.graph.nodes()) {
      this.graph.removeNode(node);
    }
    this.animationMap.clear();
    this.cleanup();
    this.timeouts.clear();
  }

  render(injectorGraph: DebugSignalGraph): void {
    const updatedNodes: string[] = [];
    let matchedNodeId = false;
    for (const oldNode of this.graph.nodes()) {
      if (!injectorGraph.nodes.find((n) => n.id == oldNode)) {
        this.graph.removeNode(oldNode);
        this.animationMap.delete(oldNode);
      } else {
        matchedNodeId = true;
      }
    }

    const createNode = (node: DebugSignalGraphNode) => {
      const outer = document.createElement('div');
      outer.onclick = () => this.selected.set(node.id);
      outer.className = `node-label kind-${node.kind}`;
      const header = document.createElement('div');
      header.className = 'header';
      header.textContent = node.label ?? 'Unnamed';
      const body = document.createElement('div');
      body.className = 'body';
      body.textContent = getBodyText(node);
      outer.appendChild(header);
      outer.appendChild(body);
      return outer;
    };
    for (const n of injectorGraph.nodes) {
      const prev = this.graph.node(n.id);
      if (prev) {
        if (n.epoch !== prev.epoch) {
          updatedNodes.push(n.id);
          const count = this.animationMap.get(n.id) ?? 0;
          this.animationMap.set(n.id, count + 1);
          prev.epoch = n.epoch;
          d3.select(prev.label).classed('animating', true);
          const body = prev.label.querySelector('.body');
          body.textContent = getBodyText(n);
        }
      } else {
        this.graph.setNode(n.id, {
          label: createNode(n),
          labelType: 'html',
          shape: 'rect',
          padding: 0,
          style: 'fill: none;',
          epoch: n.epoch,
          rx: 8,
          ry: 8,
        });
      }
    }

    const timeout = setTimeout(() => {
      this.updateNodeAnimations(updatedNodes, timeout);
    }, 250);
    this.timeouts.add(timeout);

    const newEdgeIds = new Set();
    for (const edge of injectorGraph.edges) {
      const producerId = injectorGraph.nodes[edge.producer].id;
      const consumerId = injectorGraph.nodes[edge.consumer].id;

      const edgeId = `${btoa(producerId)}-${btoa(consumerId)}`;
      newEdgeIds.add(edgeId);

      if (!this.graph.hasEdge(producerId, consumerId, undefined)) {
        this.graph.setEdge(producerId, consumerId, {
          curve: d3.curveBasis,
          style: 'stroke: gray; fill:none; stroke-width: 1px; stroke-dasharray: 5, 5;',
          arrowheadStyle: 'fill: gray',
        });
      }
    }
    for (const edge of this.graph.edges()) {
      if (!newEdgeIds.has(`${btoa(edge.v)}-${btoa(edge.w)}`)) {
        this.graph.removeEdge(edge.v, edge.w, undefined);
      }
    }

    if (matchedNodeId) {
      this.graph.graph().transition = (selection: any) => {
        return selection.transition().duration(500);
      };
    } else {
      this.graph.graph().transition = undefined;
    }

    const g = d3.select(this.svg).select('g');

    this.drender(g, this.graph);

    // if there are no nodes, we reset the transform to 0
    const {width, height} = this.graph.graph();
    const xTransform = isFinite(width) ? -width / 2 : 0;
    const yTransform = isFinite(height) ? -height / 2 : 0;
    g.select('.output').attr('transform', `translate(${xTransform}, ${yTransform})`);
  }

  resize() {
    const svg = d3.select(this.svg);
    svg.attr('viewBox', [
      -this.svg.clientWidth / 2,
      -this.svg.clientHeight / 2,
      this.svg.clientWidth,
      this.svg.clientHeight,
    ]);
  }
}

function getBodyText(node: DebugSignalGraphNode): string {
  if (node.kind === 'signal' || node.kind === 'computed') {
    return node.preview.preview;
  }

  if (node.kind === 'template') {
    return '</>';
  }

  if (node.kind === 'effect') {
    return '() => {}';
  }

  return '';
}
