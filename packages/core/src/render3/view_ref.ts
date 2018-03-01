/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EmbeddedViewRef as viewEngine_EmbeddedViewRef, ViewRef as viewEngine_ViewRef} from '../linker/view_ref';

import {ComponentTemplate} from './interfaces/definition';
import {LViewNode} from './interfaces/node';
import {notImplemented} from './util';

export class ViewRef<T> implements viewEngine_EmbeddedViewRef<T> {
  context: T;
  rootNodes: any[];

  constructor(context: T|null) { this.context = context !; }

  /** @internal */
  _setComponentContext(context: T) { this.context = context; }

  destroy(): void { notImplemented(); }
  destroyed: boolean;
  onDestroy(callback: Function) { notImplemented(); }
  markForCheck(): void { notImplemented(); }
  detach(): void { notImplemented(); }
  detectChanges(): void { notImplemented(); }
  checkNoChanges(): void { notImplemented(); }
  reattach(): void { notImplemented(); }
}


export class EmbeddedViewRef<T> extends ViewRef<T> {
  /**
   * @internal
   */
  _lViewNode: LViewNode;

  constructor(viewNode: LViewNode, template: ComponentTemplate<T>, context: T) {
    super(context);
    this._lViewNode = viewNode;
  }
}

/**
 * Creates a ViewRef bundled with destroy functionality.
 *
 * @param context The context for this view
 * @returns The ViewRef
 */
export function createViewRef<T>(context: T): ViewRef<T> {
  // TODO: add detectChanges back in when implementing ChangeDetectorRef.detectChanges
  return addDestroyable(new ViewRef(context));
}

/** Interface for destroy logic. Implemented by addDestroyable. */
export interface DestroyRef<T> {
  /** Whether or not this object has been destroyed */
  destroyed: boolean;
  /** Destroy the instance and call all onDestroy callbacks. */
  destroy(): void;
  /** Register callbacks that should be called onDestroy */
  onDestroy(cb: Function): void;
}

/**
 * Decorates an object with destroy logic (implementing the DestroyRef interface)
 * and returns the enhanced object.
 *
 * @param obj The object to decorate
 * @returns The object with destroy logic
 */
export function addDestroyable<T, C>(obj: any): T&DestroyRef<C> {
  let destroyFn: Function[]|null = null;
  obj.destroyed = false;
  obj.destroy = function() {
    destroyFn && destroyFn.forEach((fn) => fn());
    this.destroyed = true;
  };
  obj.onDestroy = (fn: Function) => (destroyFn || (destroyFn = [])).push(fn);
  return obj;
}
