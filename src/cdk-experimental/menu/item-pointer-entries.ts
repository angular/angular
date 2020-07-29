/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {QueryList, ElementRef} from '@angular/core';
import {fromEvent, Observable, defer} from 'rxjs';
import {mapTo, mergeAll, takeUntil, startWith, mergeMap} from 'rxjs/operators';

/** Item to track for mouse focus events. */
export interface FocusableElement {
  /** A reference to the element to be tracked. */
  _elementRef: ElementRef<HTMLElement>;
}

/**
 * Gets a stream of pointer (mouse) entries into the given items.
 * This should typically run outside the Angular zone.
 */
export function getItemPointerEntries<T extends FocusableElement>(
  items: QueryList<T>
): Observable<T> {
  return defer(() =>
    items.changes.pipe(
      startWith(items),
      mergeMap((list: QueryList<T>) =>
        list.map(element =>
          fromEvent(element._elementRef.nativeElement, 'mouseenter').pipe(
            mapTo(element),
            takeUntil(items.changes)
          )
        )
      ),
      mergeAll()
    )
  );
}
