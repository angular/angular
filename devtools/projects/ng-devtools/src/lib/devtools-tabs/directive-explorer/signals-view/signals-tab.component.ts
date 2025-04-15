import {
  afterNextRender,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import {SignalsGraphVisualizer} from './signals-visualizer';
import {DirectivePosition, ElementPosition, Events, MessageBus} from 'protocol';

@Component({
  templateUrl: './signals-tab.component.html',
  selector: 'ng-signals-tab',
  styleUrl: './signals-tab.component.scss',
  imports: [],
})
export class SignalsTabComponent {
  private svgComponent = viewChild.required<ElementRef>('component');

  public currentElement = input<ElementPosition>();

  signalsVisualizer!: SignalsGraphVisualizer;

  private readonly _messageBus = inject<MessageBus<Events>>(MessageBus);

  protected empty = signal(false);

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
      this.empty.set(!(e.nodes?.length > 0));
      this.signalsVisualizer.render(e);
    });

    effect(() => {
      this._messageBus.emit('getSignalGraph', [this.currentElement()]);
    });
    this._messageBus.on('componentTreeDirty', () => {
      this._messageBus.emit('getSignalGraph', [this.currentElement()]);
    });
  }

  setUpSignalsVisualizer() {
    this.signalsVisualizer = new SignalsGraphVisualizer(this.svgComponent().nativeElement);
  }
}
