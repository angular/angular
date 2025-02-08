/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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
import {ChangeDetectionStrategy, Component, computed, input, output} from '@angular/core';

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
  imports: [MatTooltip],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarChartComponent {
  readonly data = input<BargraphNode[]>([]);

  readonly internalData = computed(() => {
    const nodes = this.data() ?? [];
    const values: BarData[] = [];
    const max = nodes.reduce((a: number, c) => Math.max(a, c.value), -Infinity);
    for (const node of nodes) {
      values.push({
        label: node.label,
        count: node.count ?? 1,
        width: (node.value / max) * 100,
        time: node.value,
        text: createBarText(node),
      });
    }
    return values;
  });

  readonly color = input.required<string>();
  readonly barClick = output<BargraphNode>();
}

export function createBarText(bar: BargraphNode) {
  return `${bar.label} | ${bar.value.toFixed(1)} ms | ${bar.count} ${
    bar.count === 1 ? 'instance' : 'instances'
  }`;
}
