/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export abstract class GraphRenderer<T, U> {
  abstract render(graph: T): void;
  abstract getNodeById(id: string): U | null;
  abstract snapToNode(node: U): void;
  abstract snapToRoot(): void;
  abstract zoomScale(scale: number): void;
  abstract root: U | null;
  abstract get graphElement(): HTMLElement;

  protected nodeClickListeners: ((pointerEvent: PointerEvent, node: U) => void)[] = [];
  protected nodeMouseoverListeners: ((pointerEvent: PointerEvent, node: U) => void)[] = [];
  protected nodeMouseoutListeners: ((pointerEvent: PointerEvent, node: U) => void)[] = [];

  cleanup(): void {
    this.nodeClickListeners = [];
    this.nodeMouseoverListeners = [];
    this.nodeMouseoutListeners = [];
  }

  onNodeClick(cb: (pointerEvent: PointerEvent, node: U) => void): void {
    this.nodeClickListeners.push(cb);
  }

  onNodeMouseover(cb: (pointerEvent: PointerEvent, node: U) => void): void {
    this.nodeMouseoverListeners.push(cb);
  }

  onNodeMouseout(cb: (pointerEvent: PointerEvent, node: U) => void): void {
    this.nodeMouseoutListeners.push(cb);
  }
}
