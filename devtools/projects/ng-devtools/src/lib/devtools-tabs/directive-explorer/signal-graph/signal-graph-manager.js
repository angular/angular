/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {effect, inject, Injectable, Injector, signal} from '@angular/core';
import {MessageBus} from '../../../../../../protocol';
/**
 * Keeps the signal graph of a provided element/component.
 */
let SignalGraphManager = class SignalGraphManager {
  constructor() {
    this.injector = inject(Injector);
    this.messageBus = inject(MessageBus);
    this.signalGraph = signal(null);
    /** Target element. */
    this.element = signal(undefined);
    /* Signal graph of `element`. */
    this.graph = this.signalGraph.asReadonly();
    this.lastesSignalGraphMessageUnlistenFn = this.messageBus.on('latestSignalGraph', (graph) => {
      this.signalGraph.set(graph);
    });
  }
  /**
   * Listen for element/component change by a provided signal
   * and update the signal graph according to it.
   * @param element
   */
  listen(element) {
    this.unlisten();
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
      this.element = signal(undefined);
    };
  }
  /**
   * Unlisten the currently listened element.
   */
  unlisten() {
    this.unlistenFn?.();
  }
  destroy() {
    this.unlisten();
    this.lastesSignalGraphMessageUnlistenFn?.();
  }
};
SignalGraphManager = __decorate([Injectable()], SignalGraphManager);
export {SignalGraphManager};
//# sourceMappingURL=signal-graph-manager.js.map
