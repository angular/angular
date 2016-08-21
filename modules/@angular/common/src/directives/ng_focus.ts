/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, ElementRef, Inject, Input} from '@angular/core';

/**
 * The `NgFocus` directive conditionally set focus on your HTML element based on
 * an expression's evaluation result.
 *
 * ```
 * import {Component} from '@angular/core';
 * import {NgClass} from '@angular/common';
 *
 * @Component({
 *   selector: 'toggle-button',
 *   inputs: ['isDisabled'],
 *   template: `
 *      <input [ngFocus]="isOn" >`
 *   `,
 *   directives: [NgFocus]
 * })
 * class FocusMe {
 *   isOn = false;
 *
 * }
 * ```
 *
 * @stable
 */
@Directive({selector: '[ngFocus]'})
export class NgFocus {
  @Input()
  focus: boolean;

  constructor(@Inject(ElementRef) private element: ElementRef) {}

  protected ngOnChanges() {
    if (this.focus)
      this.element.nativeElement.focus();
    else
      this.element.nativeElement.blur();
  }
}
