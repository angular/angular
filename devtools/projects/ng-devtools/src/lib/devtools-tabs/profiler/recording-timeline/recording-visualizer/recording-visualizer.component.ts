/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, computed, input, linkedSignal} from '@angular/core';
import {DecimalPipe} from '@angular/common';

import {ProfilerFrame} from '../../../../../../../protocol';

import {VisualizationMode} from '../shared/visualization-mode';
import {SelectedEntry} from './recording-visualizer-types';

import {ExecutionDetailsComponent} from './execution-details/execution-details.component';
import {BargraphVisualizerComponent} from './bargraph-visualizer/bargraph-visualizer.component';
import {TreeMapVisualizerComponent} from './tree-map-visualizer/tree-map-visualizer.component';
import {FlamegraphVisualizerComponent} from './flamegraph-visualizer/flamegraph-visualizer.component';
import {SplitComponent} from '../../../../shared/split/split.component';
import {SplitAreaDirective} from '../../../../shared/split/splitArea.directive';

@Component({
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
})
export class RecordingVisualizerComponent {
  readonly visualizationMode = input.required<VisualizationMode>();
  readonly frame = input.required<ProfilerFrame>();
  readonly changeDetection = input.required<boolean>();

  readonly cmpVisualizationModes = VisualizationMode;

  private readonly selectedNodeCleanUpDeps = computed(
    // We don't care about the output format as long as
    // the value is different when a dependency changes
    // (i.e. it acts as a hash).
    // NOTE: It's safe to stringify the frames since they
    // are valid JSON objects that are also exported as part
    // of the profiler results report.
    () => JSON.stringify(this.frame()) + this.visualizationMode(),
  );
  private readonly selectedNode = linkedSignal<string, SelectedEntry | null>({
    source: this.selectedNodeCleanUpDeps,
    computation: () => null,
  });

  readonly selectedEntry = computed(() => this.selectedNode()?.entry ?? null);
  readonly selectedDirectives = computed(() => this.selectedNode()?.selectedDirectives ?? []);
  readonly parentHierarchy = computed(() => this.selectedNode()?.parentHierarchy ?? []);

  selectNode(selected: SelectedEntry): void {
    this.selectedNode.set(selected);
  }
}
