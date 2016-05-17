import {Directive, ElementRef} from '@angular/core';

/**
 * Used in the `md-tab-group` view to display tab labels
 * @internal
 */
@Directive({
  selector: '[md-tab-label-wrapper]'
})
export class MdTabLabelWrapper {
  constructor(public elementRef: ElementRef) {}

  /**
   * Sets focus on the wrapper element
   */
  focus(): void {
    this.elementRef.nativeElement.focus();
  }
}
