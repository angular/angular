/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  animate,
  animateChild,
  query,
  stagger,
  style,
  transition,
  trigger,
} from '@angular/animations';
import {Component, EventEmitter, Input, Output} from '@angular/core';

import {BargraphNode} from '../record-formatter/bargraph-formatter/bargraph-formatter';
import {MatTooltip} from '@angular/material/tooltip';

interface BarData {
  label: string;
  count: number;
  width: number;
  time: number;

  text: string;
}

@Component({
  selector: 'ng-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss'],
  animations: [
    trigger('appear', [
      transition(':enter', [style({width: 0}), animate('.3s ease', style({width: '*'}))]),
    ]),
    trigger('stagger', [transition(':enter', [query(':enter', stagger('.1s', [animateChild()]))])]),
  ],
  standalone: true,
  imports: [MatTooltip],
})
export class BarChartComponent {
  @Input()
  set data(nodes: BargraphNode[]) {
    this.originalData = nodes;
    this.internalData = [];
    const max = nodes.reduce((a: number, c) => Math.max(a, c.value), -Infinity);
    for (const node of nodes) {
      this.internalData.push({
        label: node.label,
        count: node.count ?? 1,
        width: (node.value / max) * 100,
        time: node.value,
        text: createBarText(node),
      });
    }
  }
  @Input({required: true}) color!: string;
  @Output() barClick = new EventEmitter<BargraphNode>();

  originalData!: BargraphNode[];
  internalData: BarData[] = [];
}

export function createBarText(bar: BargraphNode) {
  return `${bar.label} | ${bar.value.toFixed(1)} ms | ${bar.count} ${
    bar.count === 1 ? 'instance' : 'instances'
  }`;
}
