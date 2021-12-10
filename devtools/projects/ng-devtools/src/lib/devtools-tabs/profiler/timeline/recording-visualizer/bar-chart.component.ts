/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {animate, animateChild, query, stagger, style, transition, trigger} from '@angular/animations';
import {Component, EventEmitter, Input, Output} from '@angular/core';

interface Data {
  label: string;
  value: number;
}

@Component({
  selector: 'ng-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss'],
  animations: [
    trigger(
        'appear',
        [transition(':enter', [style({width: 0}), animate('.3s ease', style({width: '*'}))])]),
    trigger('stagger', [transition(':enter', [query(':enter', stagger('.1s', [animateChild()]))])]),
  ],
})
export class BarChartComponent {
  @Input()
  set data(nodes: Data[]) {
    this.originalData = nodes;
    this.internalData = [];
    const max = nodes.reduce((a: number, c) => Math.max(a, c.value), -Infinity);
    for (const node of nodes) {
      this.internalData.push({
        label: node.label,
        value: (node.value / max) * 100,
      });
    }
  }
  @Input() color: string;
  @Output() barClick = new EventEmitter<Data>();

  originalData: Data[];
  internalData: Data[] = [];
}
