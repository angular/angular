/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, ElementRef, Inject, Optional, Input, OnDestroy} from '@angular/core';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {Subject} from 'rxjs';
import {CDK_DRAG_PARENT} from '../drag-parent';
import {toggleNativeDragInteractions} from '../drag-styling';

/** Handle that can be used to drag and CdkDrag instance. */
@Directive({
  selector: '[cdkDragHandle]',
  host: {
    'class': 'cdk-drag-handle'
  }
})
export class CdkDragHandle implements OnDestroy {
  /** Closest parent draggable instance. */
  _parentDrag: {} | undefined;

  /** Emits when the state of the handle has changed. */
  _stateChanges = new Subject<CdkDragHandle>();

  /** Whether starting to drag through this handle is disabled. */
  @Input('cdkDragHandleDisabled')
  get disabled(): boolean { return this._disabled; }
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
    this._stateChanges.next(this);
  }
  private _disabled = false;

  constructor(
    public element: ElementRef<HTMLElement>,
    @Inject(CDK_DRAG_PARENT) @Optional() parentDrag?: any) {

    this._parentDrag = parentDrag;
    toggleNativeDragInteractions(element.nativeElement, false);
  }

  ngOnDestroy() {
    this._stateChanges.complete();
  }
}
