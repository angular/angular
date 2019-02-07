/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directionality} from '@angular/cdk/bidi';
import {coerceNumberProperty} from '@angular/cdk/coercion';
import {Directive, ElementRef, Input, OnDestroy, Optional, Renderer2} from '@angular/core';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {CdkTree, CdkTreeNode} from './tree';

/** Regex used to split a string on its CSS units. */
const cssUnitPattern = /([A-Za-z%]+)$/;

/**
 * Indent for the children tree dataNodes.
 * This directive will add left-padding to the node to show hierarchy.
 */
@Directive({
  selector: '[cdkTreeNodePadding]',
})
export class CdkTreeNodePadding<T> implements OnDestroy {
  /** Subject that emits when the component has been destroyed. */
  private _destroyed = new Subject<void>();

  /** CSS units used for the indentation value. */
  indentUnits = 'px';

  /** The level of depth of the tree node. The padding will be `level * indent` pixels. */
  @Input('cdkTreeNodePadding')
  get level(): number { return this._level; }
  set level(value: number) {
    this._level = coerceNumberProperty(value);
    this._setPadding();
  }
  _level: number;

  /**
   * The indent for each level. Can be a number or a CSS string.
   * Default number 40px from material design menu sub-menu spec.
   */
  @Input('cdkTreeNodePaddingIndent')
  get indent(): number | string { return this._indent; }
  set indent(indent: number | string) {
    let value = indent;
    let units = 'px';

    if (typeof indent === 'string') {
      const parts = indent.split(cssUnitPattern);
      value = parts[0];
      units = parts[1] || units;
    }

    this.indentUnits = units;
    this._indent = coerceNumberProperty(value);
    this._setPadding();
  }
  _indent: number = 40;

  constructor(private _treeNode: CdkTreeNode<T>,
              private _tree: CdkTree<T>,
              private _renderer: Renderer2,
              private _element: ElementRef<HTMLElement>,
              @Optional() private _dir: Directionality) {
    this._setPadding();
    if (_dir) {
      _dir.change.pipe(takeUntil(this._destroyed)).subscribe(() => this._setPadding());
    }
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  /** The padding indent value for the tree node. Returns a string with px numbers if not null. */
  _paddingIndent(): string|null {
    const nodeLevel = (this._treeNode.data && this._tree.treeControl.getLevel)
      ? this._tree.treeControl.getLevel(this._treeNode.data)
      : null;
    const level = this._level || nodeLevel;
    return level ? `${level * this._indent}${this.indentUnits}` : null;
  }

  _setPadding() {
    const element = this._element.nativeElement;
    const padding = this._paddingIndent();
    const paddingProp = this._dir && this._dir.value === 'rtl' ? 'paddingRight' : 'paddingLeft';
    const resetProp = paddingProp === 'paddingLeft' ? 'paddingRight' : 'paddingLeft';

    this._renderer.setStyle(element, paddingProp, padding);
    this._renderer.setStyle(element, resetProp, '');
  }
}
