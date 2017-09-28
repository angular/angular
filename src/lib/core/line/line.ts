/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  NgModule,
  Directive,
  Renderer2,
  ElementRef,
  QueryList,
} from '@angular/core';
import {MatCommonModule} from '../common-behaviors/common-module';


/**
 * Shared directive to count lines inside a text area, such as a list item.
 * Line elements can be extracted with a @ContentChildren(MatLine) query, then
 * counted by checking the query list's length.
 */
@Directive({
  selector: '[mat-line], [matLine]',
  host: {'class': 'mat-line'}
})
export class MatLine {}

/**
 * Helper that takes a query list of lines and sets the correct class on the host.
 * @docs-private
 */
export class MatLineSetter {
  constructor(private _lines: QueryList<MatLine>, private _renderer: Renderer2,
              private _element: ElementRef) {
    this._setLineClass(this._lines.length);

    this._lines.changes.subscribe(() => {
      this._setLineClass(this._lines.length);
    });
  }

  private _setLineClass(count: number): void {
    this._resetClasses();
    if (count === 2 || count === 3) {
      this._setClass(`mat-${count}-line`, true);
    } else if (count > 3) {
      this._setClass(`mat-multi-line`, true);
    }
  }

  private _resetClasses(): void {
    this._setClass('mat-2-line', false);
    this._setClass('mat-3-line', false);
    this._setClass('mat-multi-line', false);
  }

  private _setClass(className: string, isAdd: boolean): void {
    if (isAdd) {
      this._renderer.addClass(this._element.nativeElement, className);
    } else {
      this._renderer.removeClass(this._element.nativeElement, className);
    }
  }

}

@NgModule({
  imports: [MatCommonModule],
  exports: [MatLine, MatCommonModule],
  declarations: [MatLine],
})
export class MatLineModule { }
