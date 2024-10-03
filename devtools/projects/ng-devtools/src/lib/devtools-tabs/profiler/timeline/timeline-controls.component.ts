/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ProfilerFrame} from 'protocol';

import {VisualizationMode} from './visualization-mode';
import {MatButton} from '@angular/material/button';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatOption} from '@angular/material/core';
import {MatSelect} from '@angular/material/select';
import {MatInput} from '@angular/material/input';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {DecimalPipe} from '@angular/common';

@Component({
  selector: 'ng-timeline-controls',
  templateUrl: './timeline-controls.component.html',
  styleUrls: ['./timeline-controls.component.scss'],
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    MatOption,
    MatCheckbox,
    MatButton,
    DecimalPipe,
  ],
})
export class TimelineControlsComponent {
  @Input() record: ProfilerFrame | undefined;
  @Input({required: true}) estimatedFrameRate!: number;
  @Input({required: true}) visualizationMode!: VisualizationMode;
  @Input({required: true}) empty!: boolean;
  @Input({required: true}) changeDetection!: boolean;
  @Output() changeVisualizationMode = new EventEmitter<VisualizationMode>();
  @Output() exportProfile = new EventEmitter<void>();
  @Output() toggleChangeDetection = new EventEmitter<boolean>();
  @Output() filter = new EventEmitter<string>();

  flameGraphMode = VisualizationMode.FlameGraph;
  treeMapMode = VisualizationMode.TreeMap;
  barGraphMode = VisualizationMode.BarGraph;
}
