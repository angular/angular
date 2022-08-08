/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FocusMonitor} from '@angular/cdk/a11y';
import {UniqueSelectionDispatcher} from '@angular/cdk/collections';
import {
  Attribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  Directive,
  ElementRef,
  forwardRef,
  Inject,
  Optional,
  QueryList,
  ViewEncapsulation,
} from '@angular/core';
import {NG_VALUE_ACCESSOR} from '@angular/forms';
import {ANIMATION_MODULE_TYPE} from '@angular/platform-browser/animations';
import {
  MAT_RADIO_GROUP,
  _MatRadioGroupBase,
  _MatRadioButtonBase,
  MAT_RADIO_DEFAULT_OPTIONS,
  MatRadioDefaultOptions,
} from '@angular/material/radio';

/**
 * Provider Expression that allows mat-radio-group to register as a ControlValueAccessor. This
 * allows it to support [(ngModel)] and ngControl.
 * @docs-private
 */
export const MAT_RADIO_GROUP_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MatLegacyRadioGroup),
  multi: true,
};

/**
 * A group of radio buttons. May contain one or more `<mat-radio-button>` elements.
 */
@Directive({
  selector: 'mat-radio-group',
  exportAs: 'matRadioGroup',
  providers: [
    MAT_RADIO_GROUP_CONTROL_VALUE_ACCESSOR,
    {provide: MAT_RADIO_GROUP, useExisting: MatLegacyRadioGroup},
  ],
  host: {
    'role': 'radiogroup',
    'class': 'mat-radio-group',
  },
})
export class MatLegacyRadioGroup extends _MatRadioGroupBase<MatLegacyRadioButton> {
  @ContentChildren(forwardRef(() => MatLegacyRadioButton), {descendants: true})
  _radios: QueryList<MatLegacyRadioButton>;
}

/**
 * A Material design radio-button. Typically placed inside of `<mat-radio-group>` elements.
 */
@Component({
  selector: 'mat-radio-button',
  templateUrl: 'radio.html',
  styleUrls: ['radio.css'],
  inputs: ['disableRipple', 'tabIndex'],
  encapsulation: ViewEncapsulation.None,
  exportAs: 'matRadioButton',
  host: {
    'class': 'mat-radio-button',
    '[class.mat-radio-checked]': 'checked',
    '[class.mat-radio-disabled]': 'disabled',
    '[class._mat-animation-noopable]': '_noopAnimations',
    '[class.mat-primary]': 'color === "primary"',
    '[class.mat-accent]': 'color === "accent"',
    '[class.mat-warn]': 'color === "warn"',
    // Needs to be removed since it causes some a11y issues (see #21266).
    '[attr.tabindex]': 'null',
    '[attr.id]': 'id',
    '[attr.aria-label]': 'null',
    '[attr.aria-labelledby]': 'null',
    '[attr.aria-describedby]': 'null',
    // Note: under normal conditions focus shouldn't land on this element, however it may be
    // programmatically set, for example inside of a focus trap, in this case we want to forward
    // the focus to the native element.
    '(focus)': '_inputElement.nativeElement.focus()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatLegacyRadioButton extends _MatRadioButtonBase {
  constructor(
    @Optional() @Inject(MAT_RADIO_GROUP) radioGroup: MatLegacyRadioGroup,
    elementRef: ElementRef,
    changeDetector: ChangeDetectorRef,
    focusMonitor: FocusMonitor,
    radioDispatcher: UniqueSelectionDispatcher,
    @Optional() @Inject(ANIMATION_MODULE_TYPE) animationMode?: string,
    @Optional()
    @Inject(MAT_RADIO_DEFAULT_OPTIONS)
    providerOverride?: MatRadioDefaultOptions,
    @Attribute('tabindex') tabIndex?: string,
  ) {
    super(
      radioGroup,
      elementRef,
      changeDetector,
      focusMonitor,
      radioDispatcher,
      animationMode,
      providerOverride,
      tabIndex,
    );
  }
}
