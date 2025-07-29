/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, input, model} from '@angular/core';
import {DecimalPipe} from '@angular/common';

import {ProfilerFrame} from '../../../../../../../protocol';
import {VisualizationMode} from '../shared/visualization-mode';

@Component({
  selector: 'ng-visualizer-controls',
  templateUrl: './visualizer-controls.component.html',
  styleUrl: './visualizer-controls.component.scss',
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisualizerControlsComponent {
  protected readonly record = input.required<ProfilerFrame>();
  protected readonly estimatedFrameRate = input.required<number>();

  protected readonly visualizationMode = model.required<VisualizationMode>();
  protected readonly changeDetection = model.required<boolean>();

  protected readonly VisMode = VisualizationMode;

  protected onVisualizationChange(value: string) {
    const selected = parseInt(value, 10);
    this.visualizationMode.set(selected);
  }
}
