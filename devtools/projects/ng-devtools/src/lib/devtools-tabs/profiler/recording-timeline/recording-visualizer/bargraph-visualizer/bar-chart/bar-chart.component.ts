/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, computed, input, output} from '@angular/core';
import {DecimalPipe} from '@angular/common';

import {BargraphNode} from '../../../record-formatter/bargraph-formatter/bargraph-formatter';
import {ElementProfile} from '../../../../../../../../../protocol';

interface BarData {
  label: string;
  count: number;
  width: number;
  time: number;
  original: ElementProfile;
}

@Component({
  selector: 'ng-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrl: './bar-chart.component.scss',
  imports: [DecimalPipe],
})
export class BarChartComponent {
  readonly data = input<BargraphNode[]>([]);

  /** The `ElementProfile` that corresponds to a bar graph node to highlight. */
  readonly highlighted = input<ElementProfile | null>(null);

  readonly internalData = computed(() => {
    const nodes = this.data() ?? [];
    const values: BarData[] = [];
    const max = nodes.reduce((a: number, c) => Math.max(a, c.value), -Infinity);
    for (const node of nodes) {
      values.push({
        label: node.label,
        count: node.count ?? 1,
        width: Math.max(1, (node.value / max) * 100),
        time: node.value,
        original: node.original,
      });
    }
    return values;
  });

  readonly barClick = output<BargraphNode>();
}
