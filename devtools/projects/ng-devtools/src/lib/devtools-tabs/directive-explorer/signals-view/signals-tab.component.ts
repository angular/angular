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
  effect,
  ElementRef,
  inject,
  input,
  linkedSignal,
  OnDestroy,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {SignalsGraphVisualizer} from './signals-visualizer';
import {
  DebugSignalGraph,
  DebugSignalGraphNode,
  ElementPosition,
  Events,
  MessageBus,
  PropType,
} from '../../../../../../protocol';
import {
  FlatNode,
  Property,
} from './signals-details/signals-value-tree/signals-value-tree.component';
import {FlatTreeControl} from '@angular/cdk/tree';
import {arrayifyProps, SignalDataSource} from './signal-data-source';
import {DataSource} from '@angular/cdk/collections';
import {MatTreeFlattener} from '@angular/material/tree';
import {MatIcon} from '@angular/material/icon';
import {ApplicationOperations} from '../../../application-operations/index';
import {FrameManager} from '../../../application-services/frame_manager';
import {SignalsDetailsComponent} from './signals-details/signals-details.component';
import {ButtonComponent} from '../../../shared/button/button.component';

@Component({
  templateUrl: './signals-tab.component.html',
  selector: 'ng-signals-tab',
  styleUrl: './signals-tab.component.scss',
  imports: [SignalsDetailsComponent, MatIcon, ButtonComponent],
})
export class SignalsTabComponent implements OnDestroy {
  private svgComponent = viewChild.required<ElementRef>('component');

  public currentElement = input<ElementPosition>();

  signalsVisualizer!: SignalsGraphVisualizer;

  private signalGraph = signal<DebugSignalGraph | null>(null);

  // selected is automatically reset to null whenever currentElement changes
  private selected = linkedSignal<string | null>(() => (this.currentElement(), null));

  private onResize = () => this.signalsVisualizer.resize();
  private observer = new ResizeObserver(this.onResize);

  private readonly messageBus = inject<MessageBus<Events>>(MessageBus);
  private readonly appOperations = inject(ApplicationOperations);
  private readonly frameManager = inject(FrameManager);

  readonly close = output<void>();

  protected selectedNode = computed(() => {
    const signalGraph = this.signalGraph();
    if (!signalGraph) {
      return undefined;
    }
    const selected = this.selected();
    if (!selected) {
      return undefined;
    }
    return signalGraph.nodes.find((node) => node.id === selected);
  });

  protected dataSource = computed<DataSource<FlatNode> | null>(() => {
    const selectedNode = this.selectedNode();
    if (!selectedNode) {
      return null;
    }

    return new SignalDataSource(
      selectedNode.preview,
      new MatTreeFlattener<Property, FlatNode, FlatNode>(
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
      {element: this.currentElement()!, signalId: selectedNode.id},
      this.messageBus,
    );
  });

  protected treeControl = computed<FlatTreeControl<FlatNode>>(() => {
    return new FlatTreeControl(
      (node) => node.level,
      (node) => node.expandable,
    );
  });

  protected empty = computed(() => !(this.signalGraph()?.nodes.length! > 0));

  constructor() {
    afterNextRender({
      write: () => {
        this.setUpSignalsVisualizer();

        this.observer.observe(this.svgComponent().nativeElement);
      },
    });

    this.messageBus.on('latestSignalGraph', (e) => {
      this.signalGraph.set(e);
      this.signalsVisualizer.render(e);
    });

    const refreshSignalGraph = () => {
      const currentElement = this.currentElement();
      if (currentElement) {
        this.messageBus.emit('getSignalGraph', [currentElement]);
      }
    };
    effect(refreshSignalGraph);
    this.messageBus.on('componentTreeDirty', refreshSignalGraph);

    effect(() => {
      const selected = this.selected();
      // this will do nothing on the first run
      this.signalsVisualizer?.setSelected(selected);
    });
  }

  setUpSignalsVisualizer() {
    this.signalsVisualizer = new SignalsGraphVisualizer(
      this.svgComponent().nativeElement,
      this.selected,
    );
  }

  ngOnDestroy(): void {
    this.observer.disconnect();
    this.signalsVisualizer.cleanup();
  }

  gotoSource(node: DebugSignalGraphNode) {
    const frame = this.frameManager.selectedFrame();
    this.appOperations.inspectSignal(
      {
        element: this.currentElement()!,
        signalId: node.id,
      },
      frame!,
    );
  }
}
