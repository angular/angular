/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Input} from '@angular/core';
import {ProfilerFrame} from 'protocol';

import {BargraphNode} from '../record-formatter/bargraph-formatter';
import {FlamegraphNode} from '../record-formatter/flamegraph-formatter';
import {VisualizationMode} from '../visualization-mode';

export interface SelectedEntry {
  entry: BargraphNode|FlamegraphNode;
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
})
export class TimelineVisualizerComponent {
  @Input()
  set visualizationMode(mode: VisualizationMode) {
    this._visualizationMode = mode;
    this.selectedEntry = null;
    this.selectedDirectives = [];
    this.parentHierarchy = [];
  }
  @Input() frame: ProfilerFrame;
  @Input() changeDetection: boolean;

  cmpVisualizationModes = VisualizationMode;

  selectedEntry: BargraphNode|FlamegraphNode|null = null;
  selectedDirectives: SelectedDirective[] = [];
  parentHierarchy: {name: string}[] = [];

  /** @internal */
  _visualizationMode: VisualizationMode;

  handleNodeSelect({entry, parentHierarchy, selectedDirectives}: SelectedEntry): void {
    this.selectedEntry = entry;
    this.selectedDirectives = selectedDirectives;
    this.parentHierarchy = parentHierarchy ?? [];
  }
}
