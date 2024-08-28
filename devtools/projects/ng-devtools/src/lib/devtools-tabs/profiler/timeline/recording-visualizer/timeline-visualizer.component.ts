/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  signal,
  untracked,
} from '@angular/core';
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

interface SelectedNode {
  visualizationMode: VisualizationMode;
  node: SelectedEntry;
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
  readonly visualizationMode = input.required<VisualizationMode>();
  readonly frame = input.required<ProfilerFrame>();
  readonly changeDetection = input.required<boolean>();

  cmpVisualizationModes = VisualizationMode;
  private readonly selectedNodeWithVizMode = signal<SelectedNode | null>(null);
  private readonly selectedNode = computed(() => {
    const nodeWithMode = this.selectedNodeWithVizMode();

    if (this.visualizationMode() !== nodeWithMode?.visualizationMode) return null;

    return nodeWithMode.node;
  });
  readonly selectedEntry = computed(() => this.selectedNode()?.entry ?? null);
  readonly selectedDirectives = computed(() => this.selectedNode()?.selectedDirectives ?? []);
  readonly parentHierarchy = computed(() => this.selectedNode()?.parentHierarchy ?? []);

  constructor() {
    effect(() => {
      const nodeWithMode = untracked(this.selectedNodeWithVizMode);
      if (nodeWithMode?.visualizationMode !== this.visualizationMode()) {
        this.selectedNodeWithVizMode.set(null);
      }
    });
  }

  handleNodeSelect(selected: SelectedEntry): void {
    this.selectedNodeWithVizMode.set({
      visualizationMode: this.visualizationMode(),
      node: selected,
    });
  }
}
