import {Directive, ElementRef, Renderer} from '@angular/core';


/** Used in the `md-tab-group` view to display tab labels */
@Directive({
  selector: '[md-tab-label-wrapper], [mat-tab-label-wrapper]'
})
export class MdTabLabelWrapper {
  constructor(public elementRef: ElementRef, private _renderer: Renderer) {}

  /**
   * Sets focus on the wrapper element
   */
  focus(): void {
    this._renderer.invokeElementMethod(this.elementRef.nativeElement, 'focus');
  }
}
