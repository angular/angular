/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  output,
  runInInjectionContext,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';

import {
  DevtoolsSignalGraph,
  DevtoolsSignalGraphCluster,
  DevtoolsSignalGraphNode,
  getNodeLabel,
  isClusterNode,
  isSignalNode,
} from '../signal-graph';
import {DependenciesHighlightEvent, SignalsGraphVisualizer} from './signals-visualizer';
import {ElementPosition} from '../../../../../protocol';
import {ButtonComponent} from '../button/button.component';
import {FilterComponent, FilterFn} from '../filter/filter.component';
import {
  signalNodeFilterFnGenerator,
  SignalNodeFilterSource,
} from './signal-node-filter-fn-generator';

const FILTER_INFO_TOOLTIP = 'You can filter signals by type via `type:<TYPE>`.';

@Component({
  selector: 'ng-signals-visualizer',
  templateUrl: './signals-visualizer.component.html',
  styleUrl: './signals-visualizer.component.scss',
  imports: [ButtonComponent, MatIcon, MatTooltip, FilterComponent],
})
export class SignalsVisualizerComponent {
  protected readonly svgHost = viewChild.required<ElementRef>('host');

  private signalsVisualizer?: SignalsGraphVisualizer;

  protected readonly graph = input.required<DevtoolsSignalGraph | null>();
  protected readonly selectedNodeId = input.required<string | null>();
  protected readonly externallySelectedNodeId = input<string | null>(null);
  protected readonly element = input.required<ElementPosition | undefined>();
  protected readonly nodeClick = output<DevtoolsSignalGraphNode>();
  protected readonly clusterCollapse = output<void>();
  protected readonly searchedNodeFound = output<void>();

  protected readonly searchExpanded = signal<boolean>(false);
  protected readonly currentlyMatchedIndex = signal<number>(-1);
  protected readonly matchedNodes = signal<string[]>([]); // Node IDs
  protected readonly highlightedNodeLabel = signal<string | null>(null);
  private readonly expandedClustersIds = signal<Set<string>>(new Set());
  protected readonly expandedClusters = computed<DevtoolsSignalGraphCluster[]>(() => {
    const clusterIds = this.expandedClustersIds();
    const graph = untracked(this.graph);
    if (!clusterIds || !graph) {
      return [];
    }
    return Array.from(clusterIds).map((id) => graph.clusters[id]);
  });

  protected readonly filterGenerator = signalNodeFilterFnGenerator;
  protected readonly FILTER_INFO_TOOLTIP = FILTER_INFO_TOOLTIP;

  constructor() {
    const injector = inject(Injector);

    afterNextRender({
      write: () => {
        this.setUpSignalsVisualizer();

        runInInjectionContext(injector, () => {
          let lastGraphUpdateElement: ElementPosition | undefined;

          effect(() => {
            const graph = this.graph();
            this.signalsVisualizer!.render(graph!);
            const currElement = untracked(this.element);

            // Snap to root node only if the element changes.
            if (lastGraphUpdateElement !== currElement) {
              this.signalsVisualizer!.snapToRootNode();
            }
            lastGraphUpdateElement = currElement;
          });

          effect(() => {
            const selected = this.selectedNodeId();
            this.signalsVisualizer!.setSelected(selected);
          });

          let lastElement: ElementPosition | undefined;

          effect(() => {
            const currElement = this.element();
            if (lastElement && lastElement !== currElement) {
              // Reset the visualizer when the element changes.
              // Since `reset` triggers callbacks that
              // use signals, we untrack the call.
              untracked(() => this.signalsVisualizer!.reset());
            }
            lastElement = currElement;
          });

          effect(() => {
            const id = this.externallySelectedNodeId();

            // Only snap to externally selected node ID.
            // We don't want to snap to nodes that were
            // selected via the visualization itself.
            if (id) {
              this.signalsVisualizer!.snapToNode(id);
            }
          });

          effect(() => {
            if (!this.searchExpanded()) {
              this.currentlyMatchedIndex.set(-1);
              this.matchedNodes.set([]);
            }
          });
        });
      },
    });

    inject(DestroyRef).onDestroy(() => {
      this.signalsVisualizer?.cleanup();
    });
  }

  expandCluster(id: string) {
    this.signalsVisualizer?.setClusterState(id, true);
  }

  highlightDependencies(node: DevtoolsSignalGraphNode, direction: 'up' | 'down') {
    this.signalsVisualizer?.highlightDependencies(node, direction);
  }

  unhighlightDependencies() {
    this.signalsVisualizer?.unhighlightDependencies();
  }

  protected collapseCluster(id: string) {
    this.signalsVisualizer?.setClusterState(id, false);
  }

  protected handleFilter(filterFn: FilterFn<SignalNodeFilterSource>): void {
    this.currentlyMatchedIndex.set(-1);
    this.matchedNodes.set([]);

    for (const node of this.graph()?.nodes || []) {
      let label = node.label || '';

      if (isSignalNode(node) && node.clusterId) {
        if (this.expandedClustersIds().has(node.clusterId)) {
          // Get the label of nodes part of a cluster.
          label = getNodeLabel(node);
        } else {
          // Exclude nodes that are part of a collapsed cluster.
          continue;
        }
      }

      // Exclude expanded synthetic cluster nodes.
      if (isClusterNode(node) && this.expandedClustersIds().has(node.id)) {
        continue;
      }

      const matches = filterFn({label, type: isSignalNode(node) ? node.kind : node.clusterType});

      if (matches.length) {
        // At this stage, we keep only the node IDs
        // since we don't perform text highlighting based
        // on the actual string match, similarly to the
        // component tree filter.
        this.matchedNodes.update((matched) => [...matched, node.id]);
      }
    }

    // Select the first match, if there are any.
    if (this.matchedNodes().length) {
      this.navigateMatchedNode('next');
    } else {
      // Unhighlight the last selected node, if there isn't a match.
      this.signalsVisualizer?.setSelected(null);
    }
  }

  navigateMatchedNode(dir: 'next' | 'prev') {
    const dirIdx = dir === 'next' ? 1 : -1;
    const matchedNodes = this.matchedNodes();

    const newMatchedIdx =
      (this.currentlyMatchedIndex() + dirIdx + matchedNodes.length) % matchedNodes.length;
    const newMatchId = matchedNodes[newMatchedIdx];

    // Snap to the node and highlight it.
    this.signalsVisualizer?.snapToNode(newMatchId);
    this.signalsVisualizer?.setSelected(newMatchId);

    this.currentlyMatchedIndex.set(newMatchedIdx);
    this.searchedNodeFound.emit();
  }

  private setUpSignalsVisualizer() {
    this.signalsVisualizer = new SignalsGraphVisualizer(this.svgHost().nativeElement);

    this.signalsVisualizer.onNodeClick((node) => {
      this.nodeClick.emit(node);
    });

    this.signalsVisualizer.onClustersStateChange((expandedClusters) => {
      const collapsed = new Set(this.expandedClustersIds());
      for (const expanded of Array.from(expandedClusters)) {
        collapsed.delete(expanded);
      }

      this.expandedClustersIds.set(expandedClusters);

      if (collapsed.size) {
        this.clusterCollapse.emit();
      }

      this.searchExpanded.set(false);
    });

    this.signalsVisualizer.onDependenciesHighlight((e: DependenciesHighlightEvent) => {
      if (e.state === 'highlighted') {
        const label = getNodeLabel(e.node);
        this.highlightedNodeLabel.set(label);
      } else {
        this.highlightedNodeLabel.set(null);
      }
    });
  }
}
