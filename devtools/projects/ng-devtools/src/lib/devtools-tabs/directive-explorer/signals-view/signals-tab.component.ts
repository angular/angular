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
import {DevtoolsSignalGraphNode} from '../signal-graph';
import {SignalsVisualizerComponent} from './signals-visualizer/signals-visualizer.component';
import {ElementPosition} from '../../../../../../protocol';

type SelectedNodeSource = {
  element: ElementPosition | undefined;
  externallySelectedNodeId: string | null;
};

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

  protected readonly close = output<void>();

  // Source for selected node ID.
  // Use only for triggering behavior dependent on external node ID changes.
  protected readonly externallySelectedNodeId = input<{id: string} | null>(null);

  private readonly selectedNodeSource = computed<SelectedNodeSource>(() => ({
    element: this.signalGraph.element(),
    externallySelectedNodeId: this.externallySelectedNodeId()?.id ?? null,
  }));

  // Use a single source of truth for the selected node ID.
  // The selected node ID computation is triggered either
  // by an element (graph) change or externally selected node ID change.
  protected readonly selectedNodeId = linkedSignal<SelectedNodeSource, string | null>({
    source: this.selectedNodeSource,
    computation: (source, prev) => {
      // If the element changes, this means we have a new graph => reset
      if (prev?.value && source.element !== prev.source.element) {
        return null;
      }
      // In all other cases (e.g. initialization,  externally selected node change),
      // use the externally selected node as a value.
      return source.externallySelectedNodeId;
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

  highlightDeps({node, direction}: {node: DevtoolsSignalGraphNode; direction: 'up' | 'down'}) {
    this.visualizer().highlightDependencies(node, direction);
  }
}
