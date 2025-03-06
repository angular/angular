/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as d3 from 'd3';
import {DebugSignalGraph, DebugSignalGraphNode} from 'protocol';

type SimulationNode = DebugSignalGraphNode & d3.SimulationNodeDatum;

interface SignalsGraphVisualizerConfig {
  nodeSize: [width: number, height: number];
  nodeLabelSize: [width: number, height: number];
}

let arrowDefId = 0;

export class SignalsGraphVisualizer {
  public config: SignalsGraphVisualizerConfig;

  constructor(
    private _containerElement: HTMLElement,
    private _graphElement: HTMLElement,
    {nodeSize = [200, 500], nodeLabelSize = [250, 60]}: Partial<SignalsGraphVisualizerConfig> = {},
  ) {
    this.config = {
      nodeSize,
      nodeLabelSize,
    };
  }

  private d3 = d3;

  private simulation: d3.Simulation<SimulationNode, undefined> | null = null;

  zoomController: d3.ZoomBehavior<HTMLElement, unknown> | null = null;

  zoomScale(scale: number) {
    if (this.zoomController) {
      this.zoomController.scaleTo(
        this.d3.select<HTMLElement, unknown>(this._containerElement),
        scale,
      );
    }
  }

  snapToNode(node: SimulationNode, scale = 1): void {
    const svg = this.d3.select(this._containerElement);
    const halfWidth = this._containerElement.clientWidth / 2;
    const halfHeight = this._containerElement.clientHeight / 2;
    const t = d3.zoomIdentity.translate(halfWidth - node.y!, halfHeight - node.x!).scale(scale);
    svg.transition().duration(500).call(this.zoomController!.transform, t);
  }

  get graphElement(): HTMLElement {
    return this._graphElement;
  }

  getNodeById(id: string): DebugSignalGraphNode | null {
    const selection = this.d3
      .select<HTMLElement, DebugSignalGraphNode>(this._containerElement)
      .select(`.node[data-id="${id}"]`);
    if (selection.empty()) {
      return null;
    }
    return selection.datum();
  }

  cleanup(): void {
    this.d3.select(this._graphElement).selectAll('*').remove();
    this.simulation?.stop();
    this.simulation = null;
  }

  render(injectorGraph: DebugSignalGraph): void {
    // cleanup old graph
    this.cleanup();

    const svg = this.d3.select(this._containerElement);
    const g = this.d3.select<HTMLElement, DebugSignalGraphNode>(this._graphElement);

    svg.attr('height', '100%').attr('width', '100%');

    const width = this._containerElement.clientWidth;
    const height = this._containerElement.clientHeight;

    this.zoomController = this.d3.zoom<HTMLElement, unknown>().scaleExtent([0.1, 2]);
    this.zoomController.on('start zoom end', (e: {transform: number}) => {
      g.attr('transform', e.transform);
    });
    svg.call(this.zoomController);

    const nodes = injectorGraph.nodes.map<SimulationNode>((x) => x);
    const links = injectorGraph.edges.map((e) => ({
      source: nodes[e.producer],
      target: nodes[e.consumer],
    }));

    const linkG = g.append('g').attr('stroke', '#999');

    linkG
      .append('animate')
      .attr('attributeName', 'stroke-dashoffset')
      .attr('dur', '1s')
      .attr('values', '0;20')
      .attr('repeatCount', 'indefinite');

    const link = linkG
      .selectAll()
      .data(links)
      .join('line')
      .attr('class', 'link')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '10');

    const node = g
      .append('g')
      .attr('fill', '#fff')
      .attr('stroke', '#555')
      .selectAll()
      .data(nodes)
      .join('g');

    node.append('rect').attr('width', 100).attr('height', 100);

    const nodePreview = node
      .append('foreignObject')
      .attr('width', 100)
      .attr('height', 100)
      .attr('x', 0)
      .attr('y', 0)
      .append('xhtml:div')
      .attr('class', 'node-label');

    nodePreview.append('div').text((x) => x.label!);
    nodePreview
      .append('div')
      .text((x) => (typeof x.value == 'object' ? JSON.stringify(x.value) : `${x.value}`));

    this.simulation = d3
      .forceSimulation<SimulationNode>(nodes)
      .force('link', d3.forceLink(links).distance(200))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .on('tick', ticked);

    function ticked() {
      link
        .attr('x1', (d) => d.source.x!)
        .attr('y1', (d) => d.source.y!)
        .attr('x2', (d) => d.target.x!)
        .attr('y2', (d) => d.target.y!);
      node.attr('transform', (d) => `translate(${(d.x ?? 0) - 50},${(d.y ?? 0) - 50})`);
    }
  }

  resize() {
    const width = this._containerElement.clientWidth;
    const height = this._containerElement.clientHeight;
    this.simulation?.force('center', d3.forceCenter(width / 2, height / 2));
    this.simulation?.restart();
  }
}
