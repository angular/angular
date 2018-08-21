/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, TemplateRef, Input} from '@angular/core';

/**
 * Element that will be used as a template for the placeholder of a CdkDrag when
 * it is being dragged. The placeholder is displayed in place of the element being dragged.
 */
@Directive({
  selector: 'ng-template[cdkDragPlaceholder]'
})
export class CdkDragPlaceholder<T = any> {
  /** Context data to be added to the placeholder template instance. */
  @Input() data: T;
  constructor(public templateRef: TemplateRef<T>) {}
}
