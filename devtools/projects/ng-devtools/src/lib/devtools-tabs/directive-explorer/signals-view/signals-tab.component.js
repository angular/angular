/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {
  afterNextRender,
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
import {SignalsGraphVisualizer} from './signals-visualizer';
import {MessageBus, PropType} from '../../../../../../protocol';
import {FlatTreeControl} from '@angular/cdk/tree';
import {arrayifyProps, SignalDataSource} from './signal-data-source';
import {MatTreeFlattener} from '@angular/material/tree';
import {MatIcon} from '@angular/material/icon';
import {ApplicationOperations} from '../../../application-operations/index';
import {FrameManager} from '../../../application-services/frame_manager';
import {SignalsDetailsComponent} from './signals-details/signals-details.component';
import {ButtonComponent} from '../../../shared/button/button.component';
import {SignalGraphManager} from '../signal-graph/signal-graph-manager';
let SignalsTabComponent = class SignalsTabComponent {
  constructor() {
    this.signalGraph = inject(SignalGraphManager);
    this.svgComponent = viewChild.required('component');
    this.preselectedNodeId = input(null);
    // selected is automatically reset to null whenever `graph` changes
    this.selected = linkedSignal({
      source: this.signalGraph.graph,
      computation: () => this.preselectedNodeId(),
    });
    this.onResize = () => this.signalsVisualizer?.resize();
    this.observer = new ResizeObserver(this.onResize);
    this.messageBus = inject(MessageBus);
    this.appOperations = inject(ApplicationOperations);
    this.frameManager = inject(FrameManager);
    this.close = output();
    this.selectedNode = computed(() => {
      const signalGraph = this.signalGraph.graph();
      if (!signalGraph) {
        return undefined;
      }
      const selected = this.selected();
      if (!selected) {
        return undefined;
      }
      return signalGraph.nodes.find((node) => node.id === selected);
    });
    this.dataSource = computed(() => {
      const selectedNode = this.selectedNode();
      if (!selectedNode) {
        return null;
      }
      return new SignalDataSource(
        selectedNode.preview,
        new MatTreeFlattener(
          (node, level) => ({
            expandable: node.descriptor.expandable,
            prop: node,
            level,
          }),
          (node) => node.level,
          (node) => node.expandable,
          (prop) => {
            const descriptor = prop.descriptor;
            if (descriptor.type === PropType.Object || descriptor.type === PropType.Array) {
              return arrayifyProps(descriptor.value || {}, prop);
            }
            return;
          },
        ),
        this.treeControl(),
        {element: this.signalGraph.element(), signalId: selectedNode.id},
        this.messageBus,
      );
    });
    this.detailsVisible = signal(false);
    this.treeControl = computed(() => {
      return new FlatTreeControl(
        (node) => node.level,
        (node) => node.expandable,
      );
    });
    this.empty = computed(() => !(this.signalGraph.graph()?.nodes.length > 0));
    const renderGraph = () => {
      const graph = this.signalGraph.graph();
      if (graph) {
        this.signalsVisualizer?.render(graph);
      }
    };
    const setSelected = () => {
      const selected = this.selected();
      if (selected) {
        this.signalsVisualizer?.setSelected(selected);
      }
    };
    afterNextRender({
      write: () => {
        this.setUpSignalsVisualizer();
        renderGraph();
        setSelected();
        this.observer.observe(this.svgComponent().nativeElement);
      },
    });
    effect(renderGraph);
    effect(setSelected);
    effect(() => {
      // Reset the visualizer when the element changes.
      this.signalGraph.element();
      this.signalsVisualizer?.reset();
    });
  }
  setUpSignalsVisualizer() {
    this.signalsVisualizer = new SignalsGraphVisualizer(this.svgComponent().nativeElement);
    this.signalsVisualizer.onNodeClick((node) => {
      this.selected.set(node.id);
      this.detailsVisible.set(true);
    });
  }
  ngOnDestroy() {
    this.observer.disconnect();
    this.signalsVisualizer?.cleanup();
  }
  gotoSource(node) {
    const frame = this.frameManager.selectedFrame();
    this.appOperations.inspectSignal(
      {
        element: this.signalGraph.element(),
        signalId: node.id,
      },
      frame,
    );
  }
};
SignalsTabComponent = __decorate(
  [
    Component({
      templateUrl: './signals-tab.component.html',
      selector: 'ng-signals-tab',
      styleUrl: './signals-tab.component.scss',
      imports: [SignalsDetailsComponent, MatIcon, ButtonComponent],
    }),
  ],
  SignalsTabComponent,
);
export {SignalsTabComponent};
//# sourceMappingURL=signals-tab.component.js.map
