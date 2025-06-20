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
  readonly record = input.required<ProfilerFrame>();
  readonly estimatedFrameRate = input.required<number>();

  readonly visualizationMode = model.required<VisualizationMode>();
  readonly changeDetection = model.required<boolean>();

  VisMode = VisualizationMode;

  onVisualizationChange(e: Event) {
    const selected = parseInt((e.target as HTMLSelectElement).value, 10);
    this.visualizationMode.set(selected);
  }
}
