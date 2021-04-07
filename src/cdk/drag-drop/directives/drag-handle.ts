/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion';
import {
  Directive,
  ElementRef,
  Inject,
  InjectionToken,
  Input,
  OnDestroy,
  Optional,
  SkipSelf,
} from '@angular/core';
import {Subject} from 'rxjs';
import {CDK_DRAG_PARENT} from '../drag-parent';
import {assertElementNode} from './assertions';

/**
 * Injection token that can be used to reference instances of `CdkDragHandle`. It serves as
 * alternative token to the actual `CdkDragHandle` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const CDK_DRAG_HANDLE = new InjectionToken<CdkDragHandle>('CdkDragHandle');

/** Handle that can be used to drag a CdkDrag instance. */
@Directive({
  selector: '[cdkDragHandle]',
  host: {
    'class': 'cdk-drag-handle'
  },
  providers: [{provide: CDK_DRAG_HANDLE, useExisting: CdkDragHandle}],
})
export class CdkDragHandle implements OnDestroy {
  /** Closest parent draggable instance. */
  _parentDrag: {} | undefined;

  /** Emits when the state of the handle has changed. */
  readonly _stateChanges = new Subject<CdkDragHandle>();

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
    @Inject(CDK_DRAG_PARENT) @Optional() @SkipSelf() parentDrag?: any) {

    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      assertElementNode(element.nativeElement, 'cdkDragHandle');
    }

    this._parentDrag = parentDrag;
  }

  ngOnDestroy() {
    this._stateChanges.complete();
  }

  static ngAcceptInputType_disabled: BooleanInput;
}
