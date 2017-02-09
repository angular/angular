import {
  Component,
  ViewEncapsulation,
  Input,
  ElementRef,
  Renderer,
} from '@angular/core';

export type MdPseudoCheckboxState = 'unchecked' | 'checked' | 'indeterminate';

/**
 * Component that shows a simplified checkbox without including any kind of "real" checkbox.
 * Meant to be used when the checkbox is purely decorative and a large number of them will be
 * included, such as for the options in a multi-select. Uses no SVGs or complex animations.
 *
 * Note that this component will be completely invisible to screen-reader users. This is *not*
 * interchangeable with <md-checkbox> and should *not* be used if the user would directly interact
 * with the checkbox. The pseudo-checkbox should only be used as an implementation detail of
 * more complex components that appropriately handle selected / checked state.
 * @docs-private
 */
@Component({
  moduleId: module.id,
  encapsulation: ViewEncapsulation.None,
  selector: 'md-pseudo-checkbox, mat-pseudo-checkbox',
  styleUrls: ['pseudo-checkbox.css'],
  template: '',
  host: {
    '[class.mat-pseudo-checkbox]': 'true',
    '[class.mat-pseudo-checkbox-indeterminate]': 'state === "indeterminate"',
    '[class.mat-pseudo-checkbox-checked]': 'state === "checked"',
    '[class.mat-pseudo-checkbox-disabled]': 'disabled',
  },
})
export class MdPseudoCheckbox {
  /** Display state of the checkbox. */
  @Input() state: MdPseudoCheckboxState = 'unchecked';

  /** Whether the checkbox is disabled. */
  @Input() disabled: boolean = false;

  /** Color of the checkbox. */
  @Input()
  get color(): string { return this._color; };
  set color(value: string) {
    if (value) {
      let nativeElement = this._elementRef.nativeElement;

      this._renderer.setElementClass(nativeElement, `mat-${this.color}`, false);
      this._renderer.setElementClass(nativeElement, `mat-${value}`, true);
      this._color = value;
    }
  }

  private _color: string;

  constructor(private _elementRef: ElementRef, private _renderer: Renderer) {
    this.color = 'accent';
  }
}
