/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {CdkTreeNodeToggle} from '@angular/cdk/tree';
import {Directive, Input} from '@angular/core';

/**
 * Wrapper for the CdkTree's toggle with Material design styles.
 */
@Directive({
  selector: '[matTreeNodeToggle]',
  providers: [{provide: CdkTreeNodeToggle, useExisting: MatTreeNodeToggle}],
})
// tslint:disable-next-line: coercion-types
export class MatTreeNodeToggle<T, K = T> extends CdkTreeNodeToggle<T, K> {
  @Input('matTreeNodeToggleRecursive')
  override get recursive(): boolean {
    return this._recursive;
  }
  override set recursive(value: boolean) {
    // TODO: when we remove support for ViewEngine, change this setter to an input
    // alias in the decorator metadata.
    this._recursive = coerceBooleanProperty(value);
  }
}
