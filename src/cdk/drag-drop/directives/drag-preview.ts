/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion';
import {Directive, InjectionToken, Input, TemplateRef} from '@angular/core';

/**
 * Injection token that can be used to reference instances of `CdkDragPreview`. It serves as
 * alternative token to the actual `CdkDragPreview` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const CDK_DRAG_PREVIEW = new InjectionToken<CdkDragPreview>('CdkDragPreview');

/**
 * Element that will be used as a template for the preview
 * of a CdkDrag when it is being dragged.
 */
@Directive({
  selector: 'ng-template[cdkDragPreview]',
  providers: [{provide: CDK_DRAG_PREVIEW, useExisting: CdkDragPreview}],
})
export class CdkDragPreview<T = any> {
  /** Context data to be added to the preview template instance. */
  @Input() data: T;

  /** Whether the preview should preserve the same size as the item that is being dragged. */
  @Input()
  get matchSize(): boolean {
    return this._matchSize;
  }
  set matchSize(value: BooleanInput) {
    this._matchSize = coerceBooleanProperty(value);
  }
  private _matchSize = false;

  constructor(public templateRef: TemplateRef<T>) {}
}
