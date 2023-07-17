/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AfterViewInit, Component, ElementRef, Input, ViewChild} from '@angular/core';
import * as d3 from 'd3';
import {Events, MessageBus, Route} from 'protocol';

@Component({
  selector: 'ng-router-tree',
  templateUrl: './router-tree.component.html',
  styleUrls: ['./router-tree.component.scss'],
})
export class RouterTreeComponent implements AfterViewInit {
  @ViewChild('svgContainer', {static: true}) private svgContainer: ElementRef;
  @ViewChild('mainGroup', {static: true}) private g: ElementRef;

  @Input()
  set routes(routes: Route[]) {
    this._routes = routes;
    this.render();
  }

  private _routes: Route[] = [];
  private tree: d3.TreeLayout<{}>;
  private tooltip: any;

  constructor(private _messageBus: MessageBus<Events>) {}

  ngAfterViewInit(): void {
    this._messageBus.emit('getRoutes');
  }

  render(): void {
    if (this._routes.length === 0 || !this.g) {
      return;
    }

    // cleanup old render
    this.tooltip?.remove?.();
    d3.select(this.g.nativeElement).selectAll('*').remove();

    this.tree = d3.tree();
    const svg = d3.select(this.svgContainer.nativeElement);
    svg.attr('height', 500).attr('width', 500);

    const g = d3.select(this.g.nativeElement);

    const svgPadding = 20;

    // Compute the new tree layout.
    this.tree.nodeSize([75, 200]);

    const root: any = this._routes[0];

    const nodes = this.tree(d3.hierarchy(
        root.children.length === 0 || root.children.length > 1 ? root : root.children[0],
        (d) => d.children));

    // Define the div for the tooltip
    this.tooltip = d3.select('body')
                       .append('div')
                       .attr('class', 'tooltip')
                       .style('opacity', 0)
                       .style('padding', '0');

    g.selectAll('.link')
        .data(nodes.descendants().slice(1))
        .enter()
        .append('path')
        .attr('class', 'link')
        .attr('d', (d) => `
            M${d.y},${d.x}
            C${(d.y + (d as any).parent.y) / 2},
              ${d.x} ${(d.y + (d as any).parent.y) / 2},
              ${(d as any).parent.x} ${(d as any).parent.y},
              ${(d as any).parent.x}`);

    // Declare the nodes
    const node =
        g.selectAll('g.node')
            .data(nodes.descendants())
            .enter()
            .append('g')
            .attr('class', 'node')
            .on('mouseover',
                (n) => {
                  const content = `
          <b>Name:</b> ${n.data.name}<br/>
          <b>Path:</b> ${n.data.path}<br/>
          <b>Auxiliary Route:</b> ${n.data.isAux}<br/>
          <b>Specificity:</b> ${n.data.specificity}<br/>
          <b>Handler:</b> ${n.data.handler}<br/>
        `;
                  this.tooltip.style('padding', '4px 8px').transition().style('opacity', 0.9);
                  this.tooltip.html(content)
                      .style('left', (d3 as any).event.pageX + 8 + 'px')
                      .style('top', (d3 as any).event.pageY + 8 + 'px');
                })
            .on('mouseout', () => this.tooltip.transition().style('opacity', 0))
            .attr('transform', (d) => `translate(${d.y},${d.x})`);

    node.append('circle')
        .attr('class', (d) => ((d.data as any).isAux ? 'node-aux-route' : 'node-route'))
        .attr('r', 6);

    node.append('text')
        .attr('dy', (d) => (d.depth === 0 || !d.children ? '0.35em' : '-1.50em'))
        .attr(
            'dx',
            (d: any):
                any => {
                  if (d.parent && d.children) {
                    return 6;
                  } else if (!d.parent && d.children) {
                    return -13;
                  } else if (d.parent && !d.children) {
                    return 13;
                  }
                })
        .attr('text-anchor', (d) => (d.children ? 'end' : 'start'))
        .text((d) => {
          const label = (d.data as any).name;
          return label.length > 20 ? label.slice(0, 17) + '...' : label;
        });

    // reset transform
    g.attr('transform', 'translate(0, 0)');

    const svgRect = this.svgContainer.nativeElement.getBoundingClientRect();
    const gElRect = this.g.nativeElement.getBoundingClientRect();

    g.attr('transform', `translate(
        ${svgRect.left - gElRect.left + svgPadding},
        ${svgRect.top - gElRect.top + svgPadding}
      )`);
    const height = gElRect.height + svgPadding * 2;
    const width = gElRect.width + svgPadding * 2;
    svg.attr('height', height).attr('width', width);
  }
}
