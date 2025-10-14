/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {ChangeDetectionStrategy, Component, computed, input, output} from '@angular/core';
let BarChartComponent = class BarChartComponent {
  constructor() {
    this.data = input([]);
    this.internalData = computed(() => {
      const nodes = this.data() ?? [];
      const values = [];
      const max = nodes.reduce((a, c) => Math.max(a, c.value), -Infinity);
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
    this.barClick = output();
  }
};
BarChartComponent = __decorate(
  [
    Component({
      selector: 'ng-bar-chart',
      templateUrl: './bar-chart.component.html',
      styleUrls: ['./bar-chart.component.scss'],
      changeDetection: ChangeDetectionStrategy.OnPush,
    }),
  ],
  BarChartComponent,
);
export {BarChartComponent};
export function createBarText(bar) {
  return `${bar.label} | ${bar.value.toFixed(1)} ms | ${bar.count} ${bar.count === 1 ? 'instance' : 'instances'}`;
}
//# sourceMappingURL=bar-chart.component.js.map
