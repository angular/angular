/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  Directive,
  ElementRef,
  forwardRef,
  Inject,
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
import {RippleAnimationConfig} from '@angular/material/core';
import {numbers} from '@material/ripple';

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
  multi: true
};

/** Configuration for the ripple animation. */
const RIPPLE_ANIMATION_CONFIG: RippleAnimationConfig = {
  enterDuration: numbers.DEACTIVATION_TIMEOUT_MS,
  exitDuration: numbers.FG_DEACTIVATION_MS
};

/**
 * A group of radio buttons. May contain one or more `<mat-radio-button>` elements.
 */
@Directive({
  selector: 'mat-radio-group',
  exportAs: 'matRadioGroup',
  providers: [MAT_RADIO_GROUP_CONTROL_VALUE_ACCESSOR],
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
    '[attr.tabindex]': 'disabled ? null : -1',
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

  /** Configuration for the underlying ripple. */
  _rippleAnimation: RippleAnimationConfig = RIPPLE_ANIMATION_CONFIG;

  _radioFoundation = new MDCRadioFoundation(this._radioAdapter);
  _classes: {[key: string]: boolean} = {};

  constructor(@Optional() radioGroup: MatRadioGroup,
              elementRef: ElementRef,
              _changeDetector: ChangeDetectorRef,
              _focusMonitor: FocusMonitor,
              _radioDispatcher: UniqueSelectionDispatcher,
              @Optional() @Inject(ANIMATION_MODULE_TYPE) _animationMode?: string,
              @Optional() @Inject(MAT_RADIO_DEFAULT_OPTIONS)
              _providerOverride?: MatRadioDefaultOptions) {
    super(radioGroup, elementRef, _changeDetector, _focusMonitor,
        _radioDispatcher, _animationMode, _providerOverride);
  }

  ngAfterViewInit() {
    super.ngAfterViewInit();
    this._radioFoundation.init();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this._radioFoundation.destroy();
  }

  private _setClass(cssClass: string, active: boolean) {
    this._classes = {...this._classes, [cssClass]: active};
    this._changeDetector.markForCheck();
  }

  /**
   * Overrides the parent function so that the foundation can be set with the current disabled
   * state.
   */
  protected _setDisabled(value: boolean) {
    super._setDisabled(value);
    this._radioFoundation.setDisabled(this.disabled);
  }
}
