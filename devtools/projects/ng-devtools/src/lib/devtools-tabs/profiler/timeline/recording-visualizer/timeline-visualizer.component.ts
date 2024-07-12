/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, Component, effect, input} from '@angular/core';
import {ProfilerFrame} from 'protocol';

import {BargraphNode} from '../record-formatter/bargraph-formatter';
import {FlamegraphNode} from '../record-formatter/flamegraph-formatter';
import {VisualizationMode} from '../visualization-mode';
import {ExecutionDetailsComponent} from './execution-details.component';
import {MatToolbar} from '@angular/material/toolbar';
import {MatCard} from '@angular/material/card';
import {BargraphVisualizerComponent} from './bargraph-visualizer.component';
import {TreeMapVisualizerComponent} from './tree-map-visualizer.component';
import {FlamegraphVisualizerComponent} from './flamegraph-visualizer.component';
import {SplitAreaDirective} from '../../../../vendor/angular-split/lib/component/splitArea.directive';
import {SplitComponent} from '../../../../vendor/angular-split/lib/component/split.component';
import {DecimalPipe} from '@angular/common';

export interface SelectedEntry {
  entry: BargraphNode | FlamegraphNode;
  selectedDirectives: SelectedDirective[];
  parentHierarchy?: {name: string}[];
}

export interface SelectedDirective {
  directive: string;
  method: string;
  value: number;
}

@Component({
  selector: 'ng-timeline-visualizer',
  templateUrl: './timeline-visualizer.component.html',
  styleUrls: ['./timeline-visualizer.component.scss'],
  standalone: true,
  imports: [
    SplitComponent,
    SplitAreaDirective,
    FlamegraphVisualizerComponent,
    TreeMapVisualizerComponent,
    BargraphVisualizerComponent,
    MatCard,
    MatToolbar,
    ExecutionDetailsComponent,
    DecimalPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelineVisualizerComponent {
  readonly visualizationMode = input<VisualizationMode>();
  readonly frame = input.required<ProfilerFrame>();
  readonly changeDetection = input.required<boolean>();

  cmpVisualizationModes = VisualizationMode;

  selectedEntry: BargraphNode | FlamegraphNode | null = null;
  selectedDirectives: SelectedDirective[] = [];
  parentHierarchy: {name: string}[] = [];

  constructor() {
    effect(() => {
      const _ = this.visualizationMode();
      this.selectedEntry = null;
      this.selectedDirectives = [];
      this.parentHierarchy = [];
    });
  }

  handleNodeSelect({entry, parentHierarchy, selectedDirectives}: SelectedEntry): void {
    this.selectedEntry = entry;
    this.selectedDirectives = selectedDirectives;
    this.parentHierarchy = parentHierarchy ?? [];
  }
}
