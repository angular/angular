import {Directive, ElementRef, Input} from '@angular/core';
import {Inject} from '@angular/core';



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
