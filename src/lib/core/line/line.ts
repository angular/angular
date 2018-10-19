/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  NgModule,
  Directive,
  ElementRef,
  QueryList,
} from '@angular/core';
import {startWith} from 'rxjs/operators';
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
export function setLines(lines: QueryList<MatLine>, element: ElementRef<HTMLElement>) {
  // Note: doesn't need to unsubscribe, because `changes`
  // gets completed by Angular when the view is destroyed.
  lines.changes.pipe(startWith<QueryList<MatLine>>(lines)).subscribe(({length}) => {
    setClass(element, 'mat-2-line', false);
    setClass(element, 'mat-3-line', false);
    setClass(element, 'mat-multi-line', false);

    if (length === 2 || length === 3) {
      setClass(element, `mat-${length}-line`, true);
    } else if (length > 3) {
      setClass(element, `mat-multi-line`, true);
    }
  });
}

/** Adds or removes a class from an element. */
function setClass(element: ElementRef<HTMLElement>, className: string, isAdd: boolean): void {
  const classList = element.nativeElement.classList;
  isAdd ? classList.add(className) : classList.remove(className);
}

/**
 * Helper that takes a query list of lines and sets the correct class on the host.
 * @docs-private
 * @deprecated Use `setLines` instead.
 * @breaking-change 8.0.0
 */
export class MatLineSetter {
  constructor(lines: QueryList<MatLine>, element: ElementRef<HTMLElement>) {
    setLines(lines, element);
  }
}

@NgModule({
  imports: [MatCommonModule],
  exports: [MatLine, MatCommonModule],
  declarations: [MatLine],
})
export class MatLineModule { }
