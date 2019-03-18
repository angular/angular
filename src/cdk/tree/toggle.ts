/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {Directive, HostListener, Input} from '@angular/core';

import {CdkTree, CdkTreeNode} from './tree';

/**
 * Node toggle to expand/collapse the node.
 */
@Directive({selector: '[cdkTreeNodeToggle]'})
export class CdkTreeNodeToggle<T> {
  /** Whether expand/collapse the node recursively. */
  @Input('cdkTreeNodeToggleRecursive')
  get recursive(): boolean { return this._recursive; }
  set recursive(value: boolean) { this._recursive = coerceBooleanProperty(value); }
  protected _recursive = false;

  constructor(protected _tree: CdkTree<T>,
              protected _treeNode: CdkTreeNode<T>) {}

  // We have to use a `HostListener` here in order to support both Ivy and ViewEngine.
  // In Ivy the `host` bindings will be merged when this class is extended, whereas in
  // ViewEngine they're overwritten.
  // TODO(crisbeto): we move this back into `host` once Ivy is turned on by default.
  // tslint:disable-next-line:no-host-decorator-in-concrete
  @HostListener('click', ['$event'])
  _toggle(event: Event): void {
    this.recursive
      ? this._tree.treeControl.toggleDescendants(this._treeNode.data)
      : this._tree.treeControl.toggle(this._treeNode.data);

    event.stopPropagation();
  }
}
