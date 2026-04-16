/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Component,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {MatIcon} from '@angular/material/icon';

import {SignalTransitiveDepsEvent} from './types';
import {Events, MessageBus} from '../../../../../../protocol';
import {
  convertToDevtoolsSignalGraph,
  DevtoolsSignalGraph,
  DevtoolsSignalGraphNode,
} from '../../../shared/signal-graph';
import {SignalsVisualizerComponent} from '../../../shared/signals-visualizer/signals-visualizer.component';
import {SignalDetailsComponent} from '../../../shared/signal-details/signal-details.component';
import {ButtonComponent} from '../../../shared/button/button.component';

@Component({
  selector: 'ng-signal-transitive-deps-pane',
  templateUrl: './signal-transitive-deps-pane.component.html',
  styleUrl: './signal-transitive-deps-pane.component.scss',
  imports: [SignalsVisualizerComponent, SignalDetailsComponent, MatIcon, ButtonComponent],
})
export class SignalTransitiveDepsPaneComponent {
  protected readonly visualizer = viewChild.required<SignalsVisualizerComponent>('visualizer');

  private readonly messageBus = inject<MessageBus<Events>>(MessageBus);

  protected readonly data = input.required<SignalTransitiveDepsEvent | null>();
  protected readonly close = output<void>();

  protected readonly graph = signal<DevtoolsSignalGraph | null>(null);
  protected readonly detailsVisible = signal<boolean>(false);

  protected readonly selectedNodeId = linkedSignal({
    source: this.data,
    computation: (source) => source?.signalNode.id ?? null,
  });

  protected readonly selectedNode = computed(() => {
    const graph = this.graph();
    const selectedNodeId = this.selectedNodeId();

    if (!graph || !selectedNodeId) {
      return null;
    }

    return graph.nodes.find((node) => node.id === selectedNodeId);
  });

  constructor() {
    effect(() => {
      const data = this.data();
      if (!data) {
        return;
      }
      this.messageBus.emit('getSignalTransitiveDependencies', [[data.signalNode]]);
    });

    this.messageBus.on('signalTransitiveDependencies', (graph) => {
      const converted = convertToDevtoolsSignalGraph(graph);
      this.graph.set(converted);
      this.detailsVisible.set(false);
    });
  }

  onNodeClick(node: DevtoolsSignalGraphNode) {
    this.selectedNodeId.set(node.id);
    this.detailsVisible.set(true);
  }

  expandCluster(clusterId: string) {
    this.visualizer().expandCluster(clusterId);
  }
}
