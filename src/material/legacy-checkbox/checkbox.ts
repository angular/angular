/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FocusMonitor, FocusOrigin} from '@angular/cdk/a11y';
import {
  AfterViewInit,
  Attribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  forwardRef,
  Inject,
  NgZone,
  OnDestroy,
  Optional,
  ViewEncapsulation,
} from '@angular/core';
import {NG_VALUE_ACCESSOR} from '@angular/forms';
import {ANIMATION_MODULE_TYPE} from '@angular/platform-browser/animations';
import {
  _MatCheckboxBase,
  MAT_CHECKBOX_DEFAULT_OPTIONS,
  MatCheckboxDefaultOptions,
} from '@angular/material/checkbox';

/** Change event object emitted by a checkbox. */
export class MatLegacyCheckboxChange {
  /** The source checkbox of the event. */
  source: MatLegacyCheckbox;
  /** The new `checked` value of the checkbox. */
  checked: boolean;
}
/**
 * Provider Expression that allows mat-checkbox to register as a ControlValueAccessor.
 * This allows it to support [(ngModel)].
 * @docs-private
 */
export const MAT_LEGACY_CHECKBOX_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MatLegacyCheckbox),
  multi: true,
};

/**
 * A material design checkbox component. Supports all of the functionality of an HTML5 checkbox,
 * and exposes a similar API. A checkbox can be either checked, unchecked, indeterminate, or
 * disabled. Note that all additional accessibility attributes are taken care of by the component,
 * so there is no need to provide them yourself. However, if you want to omit a label and still
 * have the checkbox be accessible, you may supply an [aria-label] input.
 * See: https://material.io/design/components/selection-controls.html
 */
@Component({
  selector: 'mat-checkbox',
  templateUrl: 'checkbox.html',
  styleUrls: ['checkbox.css'],
  exportAs: 'matCheckbox',
  host: {
    'class': 'mat-checkbox',
    '[id]': 'id',
    '[attr.tabindex]': 'null',
    '[attr.aria-label]': 'null',
    '[attr.aria-labelledby]': 'null',
    '[class.mat-checkbox-indeterminate]': 'indeterminate',
    '[class.mat-checkbox-checked]': 'checked',
    '[class.mat-checkbox-disabled]': 'disabled',
    '[class.mat-checkbox-label-before]': 'labelPosition == "before"',
    '[class._mat-animation-noopable]': `_animationMode === 'NoopAnimations'`,
  },
  providers: [MAT_LEGACY_CHECKBOX_CONTROL_VALUE_ACCESSOR],
  inputs: ['disableRipple', 'color', 'tabIndex'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatLegacyCheckbox
  extends _MatCheckboxBase<MatLegacyCheckboxChange>
  implements AfterViewInit, OnDestroy
{
  protected _animationClasses = {
    uncheckedToChecked: 'mat-checkbox-anim-unchecked-checked',
    uncheckedToIndeterminate: 'mat-checkbox-anim-unchecked-indeterminate',
    checkedToUnchecked: 'mat-checkbox-anim-checked-unchecked',
    checkedToIndeterminate: 'mat-checkbox-anim-checked-indeterminate',
    indeterminateToChecked: 'mat-checkbox-anim-indeterminate-checked',
    indeterminateToUnchecked: 'mat-checkbox-anim-indeterminate-unchecked',
  };

  constructor(
    elementRef: ElementRef<HTMLElement>,
    changeDetectorRef: ChangeDetectorRef,
    private _focusMonitor: FocusMonitor,
    ngZone: NgZone,
    @Attribute('tabindex') tabIndex: string,
    @Optional() @Inject(ANIMATION_MODULE_TYPE) animationMode?: string,
    @Optional()
    @Inject(MAT_CHECKBOX_DEFAULT_OPTIONS)
    options?: MatCheckboxDefaultOptions,
  ) {
    super('mat-checkbox-', elementRef, changeDetectorRef, ngZone, tabIndex, animationMode, options);
  }

  protected _createChangeEvent(isChecked: boolean) {
    const event = new MatLegacyCheckboxChange();
    event.source = this;
    event.checked = isChecked;
    return event;
  }

  protected _getAnimationTargetElement() {
    return this._elementRef.nativeElement;
  }

  override ngAfterViewInit() {
    super.ngAfterViewInit();

    this._focusMonitor.monitor(this._elementRef, true).subscribe(focusOrigin => {
      if (!focusOrigin) {
        this._onBlur();
      }
    });
  }

  ngOnDestroy() {
    this._focusMonitor.stopMonitoring(this._elementRef);
  }

  /**
   * Event handler for checkbox input element.
   * Toggles checked state if element is not disabled.
   * Do not toggle on (change) event since IE doesn't fire change event when
   *   indeterminate checkbox is clicked.
   * @param event
   */
  _onInputClick(event: Event) {
    // We have to stop propagation for click events on the visual hidden input element.
    // By default, when a user clicks on a label element, a generated click event will be
    // dispatched on the associated input element. Since we are using a label element as our
    // root container, the click event on the `checkbox` will be executed twice.
    // The real click event will bubble up, and the generated click event also tries to bubble up.
    // This will lead to multiple click events.
    // Preventing bubbling for the second event will solve that issue.
    event.stopPropagation();
    super._handleInputClick();
  }

  /** Focuses the checkbox. */
  focus(origin?: FocusOrigin, options?: FocusOptions): void {
    if (origin) {
      this._focusMonitor.focusVia(this._inputElement, origin, options);
    } else {
      this._inputElement.nativeElement.focus(options);
    }
  }
}
