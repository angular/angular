import {Directive, ElementRef, Renderer, Input} from '@angular/core';
import {coerceBooleanProperty} from '../core/coercion/boolean-property';


/**
 * Used in the `md-tab-group` view to display tab labels.
 * @docs-private
 */
@Directive({
  selector: '[md-tab-label-wrapper], [mat-tab-label-wrapper]',
  host: {
    '[class.mat-tab-disabled]': 'disabled'
  }
})
export class MdTabLabelWrapper {
  constructor(public elementRef: ElementRef, private _renderer: Renderer) {}

  /** Whether the tab label is disabled.  */
  private _disabled: boolean = false;

  /** Whether the element is disabled. */
  @Input()
  get disabled() { return this._disabled; }
  set disabled(value: any) { this._disabled = coerceBooleanProperty(value); }

  /** Sets focus on the wrapper element */
  focus(): void {
    this._renderer.invokeElementMethod(this.elementRef.nativeElement, 'focus');
  }

  getOffsetLeft(): number {
    return this.elementRef.nativeElement.offsetLeft;
  }

  getOffsetWidth(): number {
    return this.elementRef.nativeElement.offsetWidth;
  }
}
