/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EmbeddedViewRef as viewEngine_EmbeddedViewRef} from '../linker/view_ref';

import {detectChanges} from './instructions';
import {ComponentTemplate} from './interfaces/definition';
import {LViewNode} from './interfaces/node';
import {LView, LViewFlags} from './interfaces/view';
import {notImplemented} from './util';

export class ViewRef<T> implements viewEngine_EmbeddedViewRef<T> {
  context: T;
  rootNodes: any[];

  constructor(private _view: LView, context: T|null, ) { this.context = context !; }

  /** @internal */
  _setComponentContext(context: T) { this.context = context; }

  destroy(): void { notImplemented(); }
  destroyed: boolean;
  onDestroy(callback: Function) { notImplemented(); }
  markForCheck(): void { notImplemented(); }

  /**
   * Detaches a view from the change detection tree.
   *
   * Detached views will not be checked during change detection runs, even if the view
   * is dirty. This can be used in combination with detectChanges to implement local
   * change detection checks.
   */
  detach(): void { this._view.flags &= ~LViewFlags.Attached; }

  /**
   * Re-attaches a view to the change detection tree.
   *
   * This can be used to re-attach views that were previously detached from the tree
   * using detach(). Views are attached to the tree by default.
   */
  reattach(): void { this._view.flags |= LViewFlags.Attached; }

  detectChanges(): void { detectChanges(this.context); }

  checkNoChanges(): void { notImplemented(); }
}


export class EmbeddedViewRef<T> extends ViewRef<T> {
  /**
   * @internal
   */
  _lViewNode: LViewNode;

  constructor(viewNode: LViewNode, template: ComponentTemplate<T>, context: T) {
    super(viewNode.data, context);
    this._lViewNode = viewNode;
  }
}

/**
 * Creates a ViewRef bundled with destroy functionality.
 *
 * @param context The context for this view
 * @returns The ViewRef
 */
export function createViewRef<T>(view: LView, context: T): ViewRef<T> {
  // TODO: add detectChanges back in when implementing ChangeDetectorRef.detectChanges
  return addDestroyable(new ViewRef(view, context));
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
