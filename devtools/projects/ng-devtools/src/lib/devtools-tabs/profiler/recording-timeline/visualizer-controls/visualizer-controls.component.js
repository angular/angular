/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {ChangeDetectionStrategy, Component, input, model} from '@angular/core';
import {DecimalPipe} from '@angular/common';
import {VisualizationMode} from '../shared/visualization-mode';
let VisualizerControlsComponent = class VisualizerControlsComponent {
  constructor() {
    this.record = input.required();
    this.estimatedFrameRate = input.required();
    this.visualizationMode = model.required();
    this.changeDetection = model.required();
    this.VisMode = VisualizationMode;
  }
  onVisualizationChange(value) {
    const selected = parseInt(value, 10);
    this.visualizationMode.set(selected);
  }
};
VisualizerControlsComponent = __decorate(
  [
    Component({
      selector: 'ng-visualizer-controls',
      templateUrl: './visualizer-controls.component.html',
      styleUrl: './visualizer-controls.component.scss',
      imports: [DecimalPipe],
      changeDetection: ChangeDetectionStrategy.OnPush,
    }),
  ],
  VisualizerControlsComponent,
);
export {VisualizerControlsComponent};
//# sourceMappingURL=visualizer-controls.component.js.map
