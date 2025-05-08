import {
  afterNextRender,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {SignalsGraphVisualizer} from './signals-visualizer';
import {DebugSignalGraph, ElementPosition, Events, MessageBus, PropType} from 'protocol';
import {FlatNode, Property, SignalsValueTreeComponent} from './signals-value-tree.component';
import {FlatTreeControl} from '@angular/cdk/tree';
import {arrayifyProps, SignalDataSource} from './signal-data-source';
import {DataSource} from '@angular/cdk/collections';
import {MatTreeFlattener} from '@angular/material/tree';
import {MatIcon} from '@angular/material/icon';
import {ApplicationOperations} from '../../../application-operations/index';
import {FrameManager} from '../../../application-services/frame_manager';

@Component({
  templateUrl: './signals-tab.component.html',
  selector: 'ng-signals-tab',
  styleUrl: './signals-tab.component.scss',
  imports: [SignalsValueTreeComponent, MatIcon],
})
export class SignalsTabComponent {
  private svgComponent = viewChild.required<ElementRef>('component');

  public currentElement = input<ElementPosition>();

  signalsVisualizer!: SignalsGraphVisualizer;

  private readonly _messageBus = inject<MessageBus<Events>>(MessageBus);

  private signalGraph = signal<DebugSignalGraph | null>(null);

  private selected = signal<string | null>(null);

  private _appOperations = inject(ApplicationOperations);
  private readonly _frameManager = inject(FrameManager);

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
    const selected = this.selected();
    const selectedNode = this.selectedNode();
    if (!selectedNode || !selected) {
      return null;
    }

    let out = new SignalDataSource(
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
      {element: this.currentElement()!, signalId: selected},
      this._messageBus,
    );

    return out;
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

        const observer = new ResizeObserver(onResize);
        observer.observe(this.svgComponent().nativeElement);
      },
    });

    const onResize = () => {
      this.signalsVisualizer.resize();
    };
    this._messageBus.on('latestSignalGraph', (e) => {
      this.signalGraph.set(e);
      this.signalsVisualizer.render(e);
    });

    effect(() => {
      const currentElement = this.currentElement();
      if (currentElement) {
        this._messageBus.emit('getSignalGraph', [currentElement]);
      }
      this.selected.set(null);
    });
    this._messageBus.on('componentTreeDirty', () => {
      const currentElement = this.currentElement();
      if (currentElement) {
        this._messageBus.emit('getSignalGraph', [currentElement]);
      }
    });

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

  gotoSource() {
    const selected = this.selected();
    if (!selected) {
      return;
    }
    const frame = this._frameManager.selectedFrame();
    this._appOperations.inspectSignal(
      {
        element: this.currentElement()!,
        signalId: selected,
      },
      frame!,
    );
  }

  toggleLogging() {
    const selected = this.selected();
    if (!selected) {
      return;
    }
    this._messageBus.emit('toggleLogging', [{element: this.currentElement()!, signalId: selected}]);
  }
}
