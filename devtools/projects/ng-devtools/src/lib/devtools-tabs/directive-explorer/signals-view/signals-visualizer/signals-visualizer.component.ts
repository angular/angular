/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  afterNextRender,
  ChangeDetectionStrategy,
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

import {
  DevtoolsSignalGraph,
  DevtoolsSignalGraphCluster,
  DevtoolsSignalGraphNode,
} from '../../signal-graph';
import {SignalsGraphVisualizer} from './signals-visualizer';
import {ElementPosition} from '../../../../../../../protocol';
import {ButtonComponent} from '../../../../shared/button/button.component';

@Component({
  selector: 'ng-signals-visualizer',
  templateUrl: './signals-visualizer.component.html',
  styleUrl: './signals-visualizer.component.scss',
  imports: [ButtonComponent, MatIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignalsVisualizerComponent {
  protected readonly svgHost = viewChild.required<ElementRef>('host');

  private signalsVisualizer?: SignalsGraphVisualizer;

  protected readonly graph = input.required<DevtoolsSignalGraph | null>();
  protected readonly selectedNodeId = input.required<string | null>();
  protected readonly element = input.required<ElementPosition | undefined>();
  protected readonly nodeClick = output<DevtoolsSignalGraphNode>();
  protected readonly clusterCollapse = output<void>();

  private readonly expandedClustersIds = signal<Set<string>>(new Set());
  protected readonly expandedClusters = computed<DevtoolsSignalGraphCluster[]>(() => {
    const clusterIds = this.expandedClustersIds();
    const graph = untracked(this.graph);
    if (!clusterIds || !graph) {
      return [];
    }
    return Array.from(clusterIds).map((id) => graph.clusters[id]);
  });

  private onResize = () => this.signalsVisualizer?.resize();
  private observer = new ResizeObserver(this.onResize);

  constructor() {
    const injector = inject(Injector);

    afterNextRender({
      write: () => {
        this.setUpSignalsVisualizer();

        runInInjectionContext(injector, () => {
          effect(() => {
            const graph = this.graph();
            this.signalsVisualizer!.render(graph!);
          });

          effect(() => {
            const selected = this.selectedNodeId();
            this.signalsVisualizer!.setSelected(selected);
          });

          effect(() => {
            this.element();
            // Reset the visualizer when the element changes.
            //
            // Since `reset` triggers callbacks that
            // use signals, we untrack the call.
            untracked(() => this.signalsVisualizer!.reset());
          });
        });
        this.observer.observe(this.svgHost().nativeElement);
      },
    });

    inject(DestroyRef).onDestroy(() => {
      this.observer.disconnect();
      this.signalsVisualizer?.cleanup();
    });
  }

  expandCluster(id: string) {
    this.signalsVisualizer?.setClusterState(id, true);
  }

  protected collapseCluster(id: string) {
    this.signalsVisualizer?.setClusterState(id, false);
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
    });
  }
}
