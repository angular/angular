import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MessageBus, Events } from 'protocol';
import * as d3 from 'd3';

@Component({
  selector: 'ng-router-tree',
  templateUrl: './router-tree.component.html',
  styleUrls: ['./router-tree.component.scss'],
})
export class RouterTreeComponent implements OnInit {
  @ViewChild('svgContainer', { static: true }) private svgContainer: ElementRef;
  @ViewChild('mainGroup', { static: true }) private g: ElementRef;

  routes: any[] = [];
  private tree: d3.TreeLayout<{}>;

  constructor(private _messageBus: MessageBus<Events>) {
    this._messageBus.emit('getRoutes');
  }

  ngOnInit(): void {
    this._messageBus.on('updateRouterTree', (routes) => {
      this.routes = routes;
      if (routes && this.g) {
        d3.select(this.g.nativeElement).selectAll('*').remove();
      }
      this.render();
    });
  }

  render(): void {
    if (this.routes.length === 0) {
      return;
    }

    this.tree = d3.tree();
    const svg = d3.select(this.svgContainer.nativeElement);
    svg.attr('height', 500).attr('width', 500);

    const g = d3.select(this.g.nativeElement);

    const svgPadding = 20;

    // Compute the new tree layout.
    this.tree.nodeSize([75, 200]);

    const root: any = this.routes[0];

    const nodes = this.tree(
      d3.hierarchy(root.children.length === 0 || root.children.length > 1 ? root : root.children[0], (d) => d.children)
    );

    // Define the div for the tooltip
    const div = d3.select('body').append('div').attr('class', 'tooltip').style('opacity', 0);

    g.selectAll('.link')
      .data(nodes.descendants().slice(1))
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr(
        'd',
        (d) => `
            M${d.y},${d.x}
            C${(d.y + d.parent.y) / 2},
              ${d.x} ${(d.y + d.parent.y) / 2},
              ${d.parent.x} ${d.parent.y},
              ${d.parent.x}`
      );

    // Declare the nodes
    const node = g
      .selectAll('g.node')
      .data(nodes.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .on('mouseover', (n) => {
        const content = `
          <b>Name:</b> ${n.data.name}<br/>
          <b>Path:</b> ${n.data.path}<br/>
          <b>Auxiliary Route:</b> ${n.data.isAux}<br/>
          <b>Specificity:</b> ${n.data.specificity}<br/>
          <b>Handler:</b> ${n.data.handler}<br/>
        `;
        div.transition().style('opacity', 0.9);
        div
          .html(content)
          .style('left', d3.event.pageX + 8 + 'px')
          .style('top', d3.event.pageY + 8 + 'px');
      })
      .on('mouseout', () => div.transition().style('opacity', 0))
      .attr('transform', (d) => `translate(${d.y},${d.x})`);

    node
      .append('circle')
      .attr('class', (d) => ((d.data as any).isAux ? 'node-aux-route' : 'node-route'))
      .attr('r', 6);

    node
      .append('text')
      .attr('dy', (d) => (d.depth === 0 || !d.children ? '0.35em' : '-1.50em'))
      .attr('dx', (d) => {
        if (d.parent && d.children) {
          return 6;
        } else if (!d.parent && d.children) {
          return -13;
        } else if (d.parent && !d.children) {
          return 13;
        }
      })
      .attr('text-anchor', (d) => (d.children ? 'end' : 'start'))
      .text((d) => (d.data as any).name)
      .attr('class', 'monospace');

    // reset transform
    g.attr('transform', 'translate(0, 0)');

    const svgRect = this.svgContainer.nativeElement.getBoundingClientRect();
    const gElRect = this.g.nativeElement.getBoundingClientRect();

    g.attr(
      'transform',
      `translate(
        ${svgRect.left - gElRect.left + svgPadding},
        ${svgRect.top - gElRect.top + svgPadding}
      )`
    );
    const height = gElRect.height + svgPadding * 2;
    const width = gElRect.width + svgPadding * 2;
    svg.attr('height', height).attr('width', width);
  }
}
