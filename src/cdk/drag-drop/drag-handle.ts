/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, ElementRef, Inject, Optional} from '@angular/core';
import {CDK_DRAG_PARENT} from './drag-parent';
import {toggleNativeDragInteractions} from './drag-styling';

/** Handle that can be used to drag and CdkDrag instance. */
@Directive({
  selector: '[cdkDragHandle]',
  host: {
    'class': 'cdk-drag-handle'
  }
})
export class CdkDragHandle {
  /** Closest parent draggable instance. */
  _parentDrag: {} | undefined;

  constructor(
    public element: ElementRef<HTMLElement>,
    @Inject(CDK_DRAG_PARENT) @Optional() parentDrag?: any) {

    this._parentDrag = parentDrag;
    toggleNativeDragInteractions(element.nativeElement, false);
  }
}
