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

import {ApplicationOperations} from '../../../application-operations/index';
import {FrameManager} from '../../../application-services/frame_manager';
import {SignalDetailsComponent} from '../../../shared/signal-details/signal-details.component';
import {ButtonComponent} from '../../../shared/button/button.component';
import {SignalGraphManager} from '../signal-graph-manager/signal-graph-manager';
import {DevtoolsSignalGraphNode} from '../../../shared/signal-graph';
import {SignalsVisualizerComponent} from '../../../shared/signals-visualizer/signals-visualizer.component';
import {ElementPosition} from '../../../../../../protocol';

type SelectedNodeSource = {
  element: ElementPosition | undefined;
  externallySelectedNodeId: string | null;
};

@Component({
  templateUrl: './signal-graph-pane.component.html',
  selector: 'ng-signal-graph-pane',
  styleUrl: './signal-graph-pane.component.scss',
  imports: [SignalsVisualizerComponent, SignalDetailsComponent, MatIcon, ButtonComponent],
})
export class SignalGraphPaneComponent {
  protected readonly visualizer = viewChild.required<SignalsVisualizerComponent>('visualizer');

  protected readonly signalGraph = inject(SignalGraphManager);
  private readonly appOperations = inject(ApplicationOperations);
  private readonly frameManager = inject(FrameManager);

  constructor() {
    effect(() => {
      const element = this.signalGraph.element();
      const graph = this.signalGraph.graph();
      if (element && graph) {
        const frame = this.frameManager.selectedFrame();
        this.appOperations.getActiveSignalBreakpoints(frame!).then((positions) => {
          const activeIds = new Set<string>();
          for (const pos of positions) {
            if (JSON.stringify(pos.element) === JSON.stringify(element)) {
              activeIds.add(pos.signalId);
            }
          }
          this.activeBreakpoints.set(activeIds);
        });
      }
    });
  }

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

  // Track active breakpoints for the currently inspected component graph.
  protected readonly activeBreakpoints = signal(new Set<string>());

  protected hasBreakpoint(node: DevtoolsSignalGraphNode | undefined): boolean {
    if (!node) return false;
    return this.activeBreakpoints().has(node.id);
  }

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

  setBreakpoint(node: DevtoolsSignalGraphNode) {
    const frame = this.frameManager.selectedFrame();
    this.appOperations.setSignalBreakpoint(
      {
        element: this.signalGraph.element()!,
        signalId: node.id,
      },
      frame!,
    );
    this.activeBreakpoints.update((set) => {
      const newSet = new Set(set);
      newSet.add(node.id);
      return newSet;
    });
  }

  removeBreakpoint(node: DevtoolsSignalGraphNode) {
    const frame = this.frameManager.selectedFrame();
    this.appOperations.removeSignalBreakpoint(
      {
        element: this.signalGraph.element()!,
        signalId: node.id,
      },
      frame!,
    );
    this.activeBreakpoints.update((set) => {
      const newSet = new Set(set);
      newSet.delete(node.id);
      return newSet;
    });
  }

  expandCluster(clusterId: string) {
    this.visualizer().expandCluster(clusterId);
  }

  highlightDeps({node, direction}: {node: DevtoolsSignalGraphNode; direction: 'up' | 'down'}) {
    this.visualizer().highlightDependencies(node, direction);
  }
}
