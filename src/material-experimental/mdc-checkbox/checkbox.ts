/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Attribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  forwardRef,
  Inject,
  NgZone,
  Optional,
  ViewEncapsulation,
} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {
  MAT_CHECKBOX_DEFAULT_OPTIONS,
  MatCheckboxDefaultOptions,
  _MatCheckboxBase,
} from '@angular/material/checkbox';
import {CanColor, CanDisable} from '@angular/material/core';
import {ANIMATION_MODULE_TYPE} from '@angular/platform-browser/animations';

export const MAT_CHECKBOX_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MatCheckbox),
  multi: true,
};

/** Change event object emitted by MatCheckbox. */
export class MatCheckboxChange {
  /** The source MatCheckbox of the event. */
  source: MatCheckbox;
  /** The new `checked` value of the checkbox. */
  checked: boolean;
}

@Component({
  selector: 'mat-checkbox',
  templateUrl: 'checkbox.html',
  styleUrls: ['checkbox.css'],
  host: {
    'class': 'mat-mdc-checkbox',
    '[attr.tabindex]': 'null',
    '[attr.aria-label]': 'null',
    '[attr.aria-labelledby]': 'null',
    '[class._mat-animation-noopable]': `_animationMode === 'NoopAnimations'`,
    '[class.mdc-checkbox--disabled]': 'disabled',
    '[id]': 'id',
    // Add classes that users can use to more easily target disabled or checked checkboxes.
    '[class.mat-mdc-checkbox-disabled]': 'disabled',
    '[class.mat-mdc-checkbox-checked]': 'checked',
  },
  providers: [MAT_CHECKBOX_CONTROL_VALUE_ACCESSOR],
  inputs: ['disableRipple', 'color', 'tabIndex'],
  exportAs: 'matCheckbox',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatCheckbox
  extends _MatCheckboxBase<MatCheckboxChange>
  implements ControlValueAccessor, CanColor, CanDisable
{
  protected _animationClasses = {
    uncheckedToChecked: 'mdc-checkbox--anim-unchecked-checked',
    uncheckedToIndeterminate: 'mdc-checkbox--anim-unchecked-indeterminate',
    checkedToUnchecked: 'mdc-checkbox--anim-checked-unchecked',
    checkedToIndeterminate: 'mdc-checkbox--anim-checked-indeterminate',
    indeterminateToChecked: 'mdc-checkbox--anim-indeterminate-checked',
    indeterminateToUnchecked: 'mdc-checkbox--anim-indeterminate-unchecked',
  };

  constructor(
    elementRef: ElementRef<HTMLElement>,
    changeDetectorRef: ChangeDetectorRef,
    ngZone: NgZone,
    @Attribute('tabindex') tabIndex: string,
    @Optional() @Inject(ANIMATION_MODULE_TYPE) animationMode?: string,
    @Optional()
    @Inject(MAT_CHECKBOX_DEFAULT_OPTIONS)
    options?: MatCheckboxDefaultOptions,
  ) {
    super(
      'mat-mdc-checkbox-',
      elementRef,
      changeDetectorRef,
      ngZone,
      tabIndex,
      animationMode,
      options,
    );
  }

  /** Focuses the checkbox. */
  focus() {
    this._inputElement.nativeElement.focus();
  }

  protected _createChangeEvent(isChecked: boolean) {
    const event = new MatCheckboxChange();
    event.source = this;
    event.checked = isChecked;
    return event;
  }

  protected _getAnimationTargetElement() {
    return this._inputElement?.nativeElement;
  }

  _onInputClick() {
    super._handleInputClick();
  }

  /**
   *  Prevent click events that come from the `<label/>` element from bubbling. This prevents the
   *  click handler on the host from triggering twice when clicking on the `<label/>` element. After
   *  the click event on the `<label/>` propagates, the browsers dispatches click on the associated
   *  `<input/>`. By preventing clicks on the label by bubbling, we ensure only one click event
   *  bubbles when the label is clicked.
   */
  _preventBubblingFromLabel(event: MouseEvent) {
    if (!!event.target && this._labelElement.nativeElement.contains(event.target as HTMLElement)) {
      event.stopPropagation();
    }
  }
}
