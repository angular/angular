/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {effect, Signal, WritableSignal} from '@angular/core';
import * as d3 from 'd3';
import {DebugSignalGraph, DebugSignalGraphNode} from 'protocol';

type SimulationNode = DebugSignalGraphNode & d3.SimulationNodeDatum;

interface SignalsGraphVisualizerConfig {
  nodeSize: [width: number, height: number];
  nodeLabelSize: [width: number, height: number];
}

export class SignalsGraphVisualizer {
  public config: SignalsGraphVisualizerConfig;

  private linkg: d3.Selection<SVGGElement, unknown, null, undefined>;
  private nodeg: d3.Selection<SVGGElement, unknown, null, undefined>;

  private simulation: d3.Simulation<SimulationNode, undefined>;

  zoomController: d3.ZoomBehavior<HTMLElement, unknown> | null = null;

  // preserve nodes so that we can preserve x,y positions
  private nodes: SimulationNode[] = [];

  constructor(
    private _containerElement: HTMLElement,
    private _selected: WritableSignal<string | null>,
    {nodeSize = [100, 75], nodeLabelSize = [250, 60]}: Partial<SignalsGraphVisualizerConfig> = {},
  ) {
    this.config = {
      nodeSize,
      nodeLabelSize,
    };

    const svg = d3.select(this._containerElement);
    svg.attr('height', '100%').attr('width', '100%');
    const g = svg.append('g');

    this.linkg = g.append('g').attr('stroke', '#999');

    this.linkg
      .append('animate')
      .attr('attributeName', 'stroke-dashoffset')
      .attr('dur', '1s')
      .attr('values', '0;20')
      .attr('repeatCount', 'indefinite');

    this.nodeg = g.append('g').attr('fill', '#fff').attr('stroke', '#555');

    this.zoomController = d3.zoom<HTMLElement, unknown>().scaleExtent([0.1, 2]);
    this.zoomController.on('start zoom end', (e: {transform: number}) => {
      g.attr('transform', e.transform);
    });

    const width = this._containerElement.clientWidth;
    const height = this._containerElement.clientHeight;

    this.simulation = d3
      .forceSimulation<SimulationNode>(this.nodes)
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2));

    svg.call(this.zoomController);
  }

  setSelected(selected: string | null) {
    this.nodeg
      .selectAll('foreignObject')
      .select('div')
      .classed('selected', (d) => (d as SimulationNode).id == selected);
  }

  zoomScale(scale: number) {
    if (this.zoomController) {
      const svg = d3.select(this._containerElement);
      this.zoomController.scaleTo(svg, scale);
    }
  }

  cleanup(): void {
    this.simulation.force('link', null).nodes([]).on('tick', null).stop();
  }

  render(injectorGraph: DebugSignalGraph): void {
    const oldNodes = this.nodes;
    this.nodes = injectorGraph.nodes.map((n) => {
      const prev = oldNodes.find((x) => x.id == n.id) ?? {};
      return {
        ...prev, // preserve x,y,vx,vy,fx,fy
        ...n,
      };
    });

    const links = injectorGraph.edges.map((e) => ({
      source: this.nodes[e.producer],
      target: this.nodes[e.consumer],
    }));

    const link = this.linkg
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('class', 'link')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '10');

    const selected = this._selected();
    const node = this.nodeg
      .selectAll<SVGForeignObjectElement, SimulationNode>('foreignObject')
      .data(this.nodes, (d) => d.id)
      .join(
        (e) => {
          const obj = e.append('foreignObject');
          const outer = obj
            .append('xhtml:div')
            .on('click', (e, x) => this._selected.set(x.id))
            .attr(
              'class',
              (x) => `node-label kind-${x.kind} ${x.id == selected ? 'selected' : ''}`,
            );
          outer
            .append('div')
            .classed('header', true)
            .text((x) => x.label ?? 'Unnamed');
          outer
            .append('div')
            .classed('body', true)
            .text((x) => x.preview.preview);
          return obj;
        },
        (obj) => {
          obj.select('.header').text((x) => x.label ?? 'Unnamed');
          obj.select('.body').text((x) => x.preview.preview);
          return obj;
        },
      )
      .attr('width', this.config.nodeSize[0])
      .attr('height', this.config.nodeSize[1]);

    const ticked = () => {
      link
        .attr('x1', (d) => d.source.x!)
        .attr('y1', (d) => d.source.y!)
        .attr('x2', (d) => d.target.x!)
        .attr('y2', (d) => d.target.y!);
      node
        .attr('x', (d) => (d.x ?? 0) - this.config.nodeSize[0] / 2)
        .attr('y', (d) => (d.y ?? 0) - this.config.nodeSize[1] / 2);
    };
    this.simulation
      .nodes(this.nodes)
      .force('link', d3.forceLink(links).distance(125))
      .on('tick', ticked)
      .alpha(1)
      .restart();
  }

  resize() {
    const width = this._containerElement.clientWidth;
    const height = this._containerElement.clientHeight;
    this.simulation.force('center', d3.forceCenter(width / 2, height / 2));
    this.simulation.restart();
  }
}
