/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  AfterViewInit,
  Attribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  Directive,
  ElementRef,
  forwardRef,
  Inject,
  InjectionToken,
  OnDestroy,
  Optional,
  QueryList,
  ViewEncapsulation,
} from '@angular/core';
import {MDCRadioAdapter, MDCRadioFoundation} from '@material/radio';
import {
  MAT_RADIO_DEFAULT_OPTIONS,
  _MatRadioButtonBase,
  MatRadioDefaultOptions,
  _MatRadioGroupBase,
} from '@angular/material/radio';
import {FocusMonitor} from '@angular/cdk/a11y';
import {UniqueSelectionDispatcher} from '@angular/cdk/collections';
import {ANIMATION_MODULE_TYPE} from '@angular/platform-browser/animations';
import {NG_VALUE_ACCESSOR} from '@angular/forms';

// Re-export symbols used by the base Material radio component so that users do not need to depend
// on both packages.
export {MatRadioChange, MAT_RADIO_DEFAULT_OPTIONS} from '@angular/material/radio';

/**
 * Provider Expression that allows mat-radio-group to register as a ControlValueAccessor. This
 * allows it to support [(ngModel)] and ngControl.
 * @docs-private
 */
export const MAT_RADIO_GROUP_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MatRadioGroup),
  multi: true,
};

/**
 * Injection token that can be used to inject instances of `MatRadioGroup`. It serves as
 * alternative token to the actual `MatRadioGroup` class which could cause unnecessary
 * retention of the class and its component metadata.
 */
export const MAT_RADIO_GROUP = new InjectionToken<_MatRadioGroupBase<_MatRadioButtonBase>>(
  'MatRadioGroup',
);

/**
 * A group of radio buttons. May contain one or more `<mat-radio-button>` elements.
 */
@Directive({
  selector: 'mat-radio-group',
  exportAs: 'matRadioGroup',
  providers: [
    MAT_RADIO_GROUP_CONTROL_VALUE_ACCESSOR,
    {provide: MAT_RADIO_GROUP, useExisting: MatRadioGroup},
  ],
  host: {
    'role': 'radiogroup',
    'class': 'mat-mdc-radio-group',
  },
})
export class MatRadioGroup extends _MatRadioGroupBase<MatRadioButton> {
  /** Child radio buttons. */
  @ContentChildren(forwardRef(() => MatRadioButton), {descendants: true})
  _radios: QueryList<MatRadioButton>;
}

@Component({
  selector: 'mat-radio-button',
  templateUrl: 'radio.html',
  styleUrls: ['radio.css'],
  host: {
    'class': 'mat-mdc-radio-button',
    '[attr.id]': 'id',
    '[class.mat-primary]': 'color === "primary"',
    '[class.mat-accent]': 'color === "accent"',
    '[class.mat-warn]': 'color === "warn"',
    '[class.mat-mdc-radio-checked]': 'checked',
    '[class._mat-animation-noopable]': '_noopAnimations',
    // Needs to be removed since it causes some a11y issues (see #21266).
    '[attr.tabindex]': 'null',
    '[attr.aria-label]': 'null',
    '[attr.aria-labelledby]': 'null',
    '[attr.aria-describedby]': 'null',
    // Note: under normal conditions focus shouldn't land on this element, however it may be
    // programmatically set, for example inside of a focus trap, in this case we want to forward
    // the focus to the native element.
    '(focus)': '_inputElement.nativeElement.focus()',
  },
  inputs: ['disableRipple', 'tabIndex'],
  exportAs: 'matRadioButton',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatRadioButton extends _MatRadioButtonBase implements AfterViewInit, OnDestroy {
  private _radioAdapter: MDCRadioAdapter = {
    addClass: (className: string) => this._setClass(className, true),
    removeClass: (className: string) => this._setClass(className, false),
    setNativeControlDisabled: (disabled: boolean) => {
      if (this.disabled !== disabled) {
        this.disabled = disabled;
        this._changeDetector.markForCheck();
      }
    },
  };

  _radioFoundation = new MDCRadioFoundation(this._radioAdapter);
  _classes: {[key: string]: boolean} = {};

  constructor(
    @Optional() @Inject(MAT_RADIO_GROUP) radioGroup: MatRadioGroup,
    elementRef: ElementRef,
    _changeDetector: ChangeDetectorRef,
    _focusMonitor: FocusMonitor,
    _radioDispatcher: UniqueSelectionDispatcher,
    @Optional() @Inject(ANIMATION_MODULE_TYPE) animationMode?: string,
    @Optional()
    @Inject(MAT_RADIO_DEFAULT_OPTIONS)
    _providerOverride?: MatRadioDefaultOptions,
    @Attribute('tabindex') tabIndex?: string,
  ) {
    super(
      radioGroup,
      elementRef,
      _changeDetector,
      _focusMonitor,
      _radioDispatcher,
      animationMode,
      _providerOverride,
      tabIndex,
    );
  }

  override ngAfterViewInit() {
    super.ngAfterViewInit();
    this._radioFoundation.init();
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    this._radioFoundation.destroy();
  }

  private _setClass(cssClass: string, active: boolean) {
    this._classes = {...this._classes, [cssClass]: active};
    this._changeDetector.markForCheck();
  }

  /**
   * Overrides the parent function so that the foundation can be set with the current
   * disabled state.
   */
  protected override _setDisabled(value: boolean) {
    super._setDisabled(value);
    this._radioFoundation.setDisabled(this.disabled);
  }
}
