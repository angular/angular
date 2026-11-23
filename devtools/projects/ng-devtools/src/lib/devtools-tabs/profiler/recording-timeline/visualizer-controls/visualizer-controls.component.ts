/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, input, model} from '@angular/core';
import {DecimalPipe} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';

import {ProfilerFrame} from '../../../../../../../protocol';
import {VisualizationMode} from '../shared/visualization-mode';

const VIS_INFO: {[key in VisualizationMode]: string} = {
  [VisualizationMode.BarGraph]:
    'The bar chart displays the processing time of the components during the selected CD cycle(s) in descending order.',
  [VisualizationMode.FlameGraph]:
    'The flame graph displays the full component tree hierarchy for the selected cycle(s). During this period, processed components shift from blue to orange. The closer to orange a component is, the longer it took to process. You can expand and explore deeply nested nodes by double-clicking a bar.',
  [VisualizationMode.TreeMap]:
    'The tree map displays the hierarchy of the processed components during the selected CD cycle(s). Note that you may need to expand the DevTools viewport to explore more deeply nested items.',
};

@Component({
  selector: 'ng-visualizer-controls',
  templateUrl: './visualizer-controls.component.html',
  styleUrl: './visualizer-controls.component.scss',
  imports: [DecimalPipe, MatIcon, MatTooltip],
})
export class VisualizerControlsComponent {
  protected readonly record = input.required<ProfilerFrame>();
  protected readonly frameRate = input.required<number>();

  protected readonly visualizationMode = model.required<VisualizationMode>();
  protected readonly changeDetection = model.required<boolean>();

  protected readonly VisMode = VisualizationMode;
  protected readonly VIS_INFO = VIS_INFO;

  protected onVisualizationChange(value: string) {
    const selected = parseInt(value, 10);
    this.visualizationMode.set(selected);
  }
}
