/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {ChangeDetectionStrategy, Component, computed, input, output} from '@angular/core';
import {BarGraphFormatter} from '../../record-formatter/bargraph-formatter/index';
import {formatDirectiveProfile} from '../profile-formatter/profile-formatter';
import {BarChartComponent} from './bar-chart/bar-chart.component';
let BargraphVisualizerComponent = class BargraphVisualizerComponent {
  constructor() {
    this.nodeSelect = output();
    this._formatter = new BarGraphFormatter();
    this.frame = input.required();
    this.profileRecords = computed(() => this._formatter.formatFrame(this.frame()));
  }
  formatEntryData(bargraphNode) {
    return formatDirectiveProfile(bargraphNode.directives ?? []);
  }
  selectNode(node) {
    this.nodeSelect.emit({
      entry: node,
      parentHierarchy: node.parents.map((element) => {
        return {name: element.directives[0].name};
      }),
      selectedDirectives: this.formatEntryData(node),
    });
  }
};
BargraphVisualizerComponent = __decorate(
  [
    Component({
      selector: 'ng-bargraph-visualizer',
      templateUrl: './bargraph-visualizer.component.html',
      styleUrls: ['./bargraph-visualizer.component.scss'],
      imports: [BarChartComponent],
      changeDetection: ChangeDetectionStrategy.OnPush,
    }),
  ],
  BargraphVisualizerComponent,
);
export {BargraphVisualizerComponent};
//# sourceMappingURL=bargraph-visualizer.component.js.map
