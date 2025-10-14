/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {ChangeDetectionStrategy, Component, computed, input, linkedSignal} from '@angular/core';
import {DecimalPipe} from '@angular/common';
import {VisualizationMode} from '../shared/visualization-mode';
import {ExecutionDetailsComponent} from './execution-details/execution-details.component';
import {BargraphVisualizerComponent} from './bargraph-visualizer/bargraph-visualizer.component';
import {TreeMapVisualizerComponent} from './tree-map-visualizer/tree-map-visualizer.component';
import {FlamegraphVisualizerComponent} from './flamegraph-visualizer/flamegraph-visualizer.component';
import {SplitComponent} from '../../../../shared/split/split.component';
import {SplitAreaDirective} from '../../../../shared/split/splitArea.directive';
let RecordingVisualizerComponent = class RecordingVisualizerComponent {
  constructor() {
    this.visualizationMode = input.required();
    this.frame = input.required();
    this.changeDetection = input.required();
    this.cmpVisualizationModes = VisualizationMode;
    this.selectedNode = linkedSignal({
      source: this.visualizationMode,
      computation: () => null,
    });
    this.selectedEntry = computed(() => this.selectedNode()?.entry ?? null);
    this.selectedDirectives = computed(() => this.selectedNode()?.selectedDirectives ?? []);
    this.parentHierarchy = computed(() => this.selectedNode()?.parentHierarchy ?? []);
  }
  selectNode(selected) {
    this.selectedNode.set(selected);
  }
};
RecordingVisualizerComponent = __decorate(
  [
    Component({
      selector: 'ng-recording-visualizer',
      templateUrl: './recording-visualizer.component.html',
      styleUrls: ['./recording-visualizer.component.scss'],
      imports: [
        SplitComponent,
        SplitAreaDirective,
        FlamegraphVisualizerComponent,
        TreeMapVisualizerComponent,
        BargraphVisualizerComponent,
        ExecutionDetailsComponent,
        DecimalPipe,
      ],
      changeDetection: ChangeDetectionStrategy.OnPush,
    }),
  ],
  RecordingVisualizerComponent,
);
export {RecordingVisualizerComponent};
//# sourceMappingURL=recording-visualizer.component.js.map
