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
  inject,
  input,
  linkedSignal,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {MatIcon} from '@angular/material/icon';

import {ApplicationOperations} from '../../../application-operations/index';
import {FrameManager} from '../../../application-services/frame_manager';
import {SignalsDetailsComponent} from './signals-details/signals-details.component';
import {ButtonComponent} from '../../../shared/button/button.component';
import {SignalGraphManager} from '../signal-graph/signal-graph-manager';
import {DevtoolsSignalGraph, DevtoolsSignalGraphNode} from '../signal-graph';
import {SignalsVisualizerComponent} from './signals-visualizer/signals-visualizer.component';

@Component({
  templateUrl: './signals-tab.component.html',
  selector: 'ng-signals-tab',
  styleUrl: './signals-tab.component.scss',
  imports: [SignalsVisualizerComponent, SignalsDetailsComponent, MatIcon, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignalsTabComponent {
  protected readonly visualizer = viewChild.required<SignalsVisualizerComponent>('visualizer');

  protected readonly signalGraph = inject(SignalGraphManager);
  private readonly appOperations = inject(ApplicationOperations);
  private readonly frameManager = inject(FrameManager);

  protected readonly preselectedNodeId = input<string | null>(null);
  protected readonly close = output<void>();

  // selected is automatically reset to null whenever `graph` changes
  protected readonly selectedNodeId = linkedSignal<DevtoolsSignalGraph | null, string | null>({
    source: this.signalGraph.graph,
    computation: (source, prev) => {
      if (prev?.value && source?.nodes.find((n) => n.id === prev.value)) {
        return prev.value;
      }
      return this.preselectedNodeId();
    },
  });

  protected selectedNode = computed(() => {
    const signalGraph = this.signalGraph.graph();
    if (!signalGraph) {
      return undefined;
    }
    const selectedNodeId = this.selectedNodeId();
    if (!selectedNodeId) {
      return undefined;
    }
    return signalGraph.nodes.find((node) => node.id === selectedNodeId);
  });

  protected readonly detailsVisible = signal(false);

  protected empty = computed(() => !(this.signalGraph.graph()?.nodes.length! > 0));

  onNodeClick(node: DevtoolsSignalGraphNode) {
    this.selectedNodeId.set(node.id);
    this.detailsVisible.set(true);
  }

  gotoSource(node: DevtoolsSignalGraphNode) {
    const frame = this.frameManager.selectedFrame();
    this.appOperations.inspectSignal(
      {
        element: this.signalGraph.element()!,
        signalId: node.id,
      },
      frame!,
    );
  }

  expandCluster(clusterId: string) {
    this.visualizer().expandCluster(clusterId);
  }
}
