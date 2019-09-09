/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, ElementRef, Inject, OnDestroy} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {MatTabLabelWrapper as BaseMatTabLabelWrapper} from '@angular/material/tabs';
import {MatInkBarFoundation, MatInkBarItem} from './ink-bar';

/**
 * Used in the `mat-tab-group` view to display tab labels.
 * @docs-private
 */
@Directive({
  selector: '[matTabLabelWrapper]',
  inputs: ['disabled'],
  host: {
    '[class.mat-mdc-tab-disabled]': 'disabled',
    '[attr.aria-disabled]': '!!disabled',
  }
})
export class MatTabLabelWrapper extends BaseMatTabLabelWrapper implements MatInkBarItem, OnDestroy {
  _foundation: MatInkBarFoundation;

  constructor(public elementRef: ElementRef, @Inject(DOCUMENT) _document: any) {
    super(elementRef);
    this._foundation = new MatInkBarFoundation(elementRef, _document);
    this._foundation.init();
  }

  ngOnDestroy() {
    this._foundation.destroy();
  }

  /** Sets focus on the wrapper element */
  focus(): void {
    this.elementRef.nativeElement.focus();
  }
}
