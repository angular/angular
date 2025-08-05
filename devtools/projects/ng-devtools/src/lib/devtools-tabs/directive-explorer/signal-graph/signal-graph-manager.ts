/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {effect, inject, Injectable, Injector, Signal, signal} from '@angular/core';
import {DebugSignalGraph, ElementPosition, MessageBus} from '../../../../../../protocol';

/**
 * Keeps the signal graph of a provided element/component.
 */
@Injectable()
export class SignalGraphManager {
  private readonly injector = inject(Injector);
  private readonly messageBus = inject(MessageBus);
  private readonly signalGraph = signal<DebugSignalGraph | null>(null);
  private unlistenFn?: () => void;

  /** Target element. */
  element: Signal<ElementPosition | undefined> = signal(undefined);

  /* Signal graph of `element`. */
  readonly graph = this.signalGraph.asReadonly();

  constructor() {
    this.messageBus.on('latestSignalGraph', (graph: DebugSignalGraph) => {
      this.signalGraph.set(graph);
    });
  }

  /**
   * Listen for element/component change by a provided signal
   * and update the signal graph according to it.
   * @param element
   */
  listen(element: Signal<ElementPosition | undefined>) {
    if (this.unlistenFn) {
      this.unlistenFn();
    }

    this.element = element;
    const refreshSignalGraph = () => {
      const el = element();
      if (el) {
        this.messageBus.emit('getSignalGraph', [el]);
      }
    };
    const effectRef = effect(refreshSignalGraph, {injector: this.injector});
    const unlistenBusEvent = this.messageBus.on('componentTreeDirty', refreshSignalGraph);

    this.unlistenFn = () => {
      effectRef.destroy();
      unlistenBusEvent();
    };
  }
}
