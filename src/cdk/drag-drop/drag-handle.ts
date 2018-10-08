/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, ElementRef} from '@angular/core';
import {toggleNativeDragInteractions} from './drag-styling';

/** Handle that can be used to drag and CdkDrag instance. */
@Directive({
  selector: '[cdkDragHandle]',
  host: {
    'class': 'cdk-drag-handle'
  }
})
export class CdkDragHandle {
  constructor(public element: ElementRef<HTMLElement>) {
    toggleNativeDragInteractions(element.nativeElement, false);
  }
}
