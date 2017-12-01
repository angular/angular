/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FocusMonitor, FocusOrigin} from '@angular/cdk/a11y';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {
  AfterViewInit,
  Attribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Inject,
  Input,
  OnDestroy,
  Optional,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {
  CanColor,
  CanDisable,
  CanDisableRipple,
  HasTabIndex,
  MatRipple,
  mixinColor,
  mixinDisabled,
  mixinDisableRipple,
  mixinTabIndex,
  RippleConfig,
  RippleRef,
} from '@angular/material/core';
import {MAT_CHECKBOX_CLICK_ACTION, MatCheckboxClickAction} from './checkbox-config';


// Increasing integer for generating unique ids for checkbox components.
let nextUniqueId = 0;

/**
 * Provider Expression that allows mat-checkbox to register as a ControlValueAccessor.
 * This allows it to support [(ngModel)].
 * @docs-private
 */
export const MAT_CHECKBOX_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MatCheckbox),
  multi: true
};

/**
 * Represents the different states that require custom transitions between them.
 * @docs-private
 */
export enum TransitionCheckState {
  /** The initial state of the component before any user interaction. */
  Init,
  /** The state representing the component when it's becoming checked. */
  Checked,
  /** The state representing the component when it's becoming unchecked. */
  Unchecked,
  /** The state representing the component when it's becoming indeterminate. */
  Indeterminate
}

/** Change event object emitted by MatCheckbox. */
export class MatCheckboxChange {
  /** The source MatCheckbox of the event. */
  source: MatCheckbox;
  /** The new `checked` value of the checkbox. */
  checked: boolean;
}

// Boilerplate for applying mixins to MatCheckbox.
/** @docs-private */
export class MatCheckboxBase {
  constructor(public _elementRef: ElementRef) {}
}
export const _MatCheckboxMixinBase =
  mixinTabIndex(mixinColor(mixinDisableRipple(mixinDisabled(MatCheckboxBase)), 'accent'));


/**
 * A material design checkbox component. Supports all of the functionality of an HTML5 checkbox,
 * and exposes a similar API. A MatCheckbox can be either checked, unchecked, indeterminate, or
 * disabled. Note that all additional accessibility attributes are taken care of by the component,
 * so there is no need to provide them yourself. However, if you want to omit a label and still
 * have the checkbox be accessible, you may supply an [aria-label] input.
 * See: https://www.google.com/design/spec/components/selection-controls.html
 */
@Component({
  moduleId: module.id,
  selector: 'mat-checkbox',
  templateUrl: 'checkbox.html',
  styleUrls: ['checkbox.css'],
  exportAs: 'matCheckbox',
  host: {
    'class': 'mat-checkbox',
    '[id]': 'id',
    '[class.mat-checkbox-indeterminate]': 'indeterminate',
    '[class.mat-checkbox-checked]': 'checked',
    '[class.mat-checkbox-disabled]': 'disabled',
    '[class.mat-checkbox-label-before]': 'labelPosition == "before"',
  },
  providers: [MAT_CHECKBOX_CONTROL_VALUE_ACCESSOR],
  inputs: ['disabled', 'disableRipple', 'color', 'tabIndex'],
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MatCheckbox extends _MatCheckboxMixinBase implements ControlValueAccessor,
    AfterViewInit, OnDestroy, CanColor, CanDisable, HasTabIndex, CanDisableRipple {

  /**
   * Attached to the aria-label attribute of the host element. In most cases, arial-labelledby will
   * take precedence so this may be omitted.
   */
  @Input('aria-label') ariaLabel: string = '';

  /**
   * Users can specify the `aria-labelledby` attribute which will be forwarded to the input element
   */
  @Input('aria-labelledby') ariaLabelledby: string | null = null;

  private _uniqueId: string = `mat-checkbox-${++nextUniqueId}`;

  /** A unique id for the checkbox input. If none is supplied, it will be auto-generated. */
  @Input() id: string = this._uniqueId;

  /** Returns the unique id for the visual hidden input. */
  get inputId(): string { return `${this.id || this._uniqueId}-input`; }

  private _required: boolean;

  /** Whether the checkbox is required. */
  @Input()
  get required(): boolean { return this._required; }
  set required(value) { this._required = coerceBooleanProperty(value); }

  /**
   * Whether or not the checkbox should appear before or after the label.
   * @deprecated
   */
  @Input()
  get align(): 'start' | 'end' {
    // align refers to the checkbox relative to the label, while labelPosition refers to the
    // label relative to the checkbox. As such, they are inverted.
    return this.labelPosition == 'after' ? 'start' : 'end';
  }

  set align(v) {
    this.labelPosition = (v == 'start') ? 'after' : 'before';
  }

  /** Whether the label should appear after or before the checkbox. Defaults to 'after' */
  @Input() labelPosition: 'before' | 'after' = 'after';

  /** Name value will be applied to the input element if present */
  @Input() name: string | null = null;

  /** Event emitted when the checkbox's `checked` value changes. */
  @Output() change: EventEmitter<MatCheckboxChange> = new EventEmitter<MatCheckboxChange>();

  /** Event emitted when the checkbox's `indeterminate` value changes. */
  @Output() indeterminateChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  /** The value attribute of the native input element */
  @Input() value: string;

  /** The native `<input type="checkbox"> element */
  @ViewChild('input') _inputElement: ElementRef;

  /** Called when the checkbox is blurred. Needed to properly implement ControlValueAccessor. */
  @ViewChild(MatRipple) _ripple: MatRipple;

  /** Ripple configuration for the mouse ripples and focus indicators. */
  _rippleConfig: RippleConfig = {centered: true, radius: 25, speedFactor: 1.5};

  /**
   * Called when the checkbox is blurred. Needed to properly implement ControlValueAccessor.
   * @docs-private
   */
  onTouched: () => any = () => {};

  private _currentAnimationClass: string = '';

  private _currentCheckState: TransitionCheckState = TransitionCheckState.Init;

  private _checked: boolean = false;

  private _indeterminate: boolean = false;

  private _controlValueAccessorChangeFn: (value: any) => void = () => {};

  /** Reference to the focused state ripple. */
  private _focusRipple: RippleRef | null;

  constructor(elementRef: ElementRef,
              private _changeDetectorRef: ChangeDetectorRef,
              private _focusMonitor: FocusMonitor,
              @Attribute('tabindex') tabIndex: string,
              @Optional() @Inject(MAT_CHECKBOX_CLICK_ACTION)
                  private _clickAction: MatCheckboxClickAction) {
    super(elementRef);

    this.tabIndex = parseInt(tabIndex) || 0;
  }

  ngAfterViewInit() {
    this._focusMonitor
      .monitor(this._inputElement.nativeElement, false)
      .subscribe(focusOrigin => this._onInputFocusChange(focusOrigin));
  }

  ngOnDestroy() {
    this._focusMonitor.stopMonitoring(this._inputElement.nativeElement);
  }

  /**
   * Whether the checkbox is checked.
   */
  @Input() get checked() {
    return this._checked;
  }

  set checked(checked: boolean) {
    if (checked != this.checked) {
      this._checked = checked;
      this._changeDetectorRef.markForCheck();
    }
  }

  /**
   * Whether the checkbox is indeterminate. This is also known as "mixed" mode and can be used to
   * represent a checkbox with three states, e.g. a checkbox that represents a nested list of
   * checkable items. Note that whenever checkbox is manually clicked, indeterminate is immediately
   * set to false.
   */
  @Input() get indeterminate() {
    return this._indeterminate;
  }

  set indeterminate(indeterminate: boolean) {
    let changed =  indeterminate != this._indeterminate;
    this._indeterminate = indeterminate;

    if (changed) {
      if (this._indeterminate) {
        this._transitionCheckState(TransitionCheckState.Indeterminate);
      } else {
        this._transitionCheckState(
          this.checked ? TransitionCheckState.Checked : TransitionCheckState.Unchecked);
      }
      this.indeterminateChange.emit(this._indeterminate);
    }
  }

  _isRippleDisabled() {
    return this.disableRipple || this.disabled;
  }

  /** Method being called whenever the label text changes. */
  _onLabelTextChange() {
    // This method is getting called whenever the label of the checkbox changes.
    // Since the checkbox uses the OnPush strategy we need to notify it about the change
    // that has been recognized by the cdkObserveContent directive.
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Sets the model value. Implemented as part of ControlValueAccessor.
   * @param value Value to be set to the model.
   */
  writeValue(value: any) {
    this.checked = !!value;
  }

  /**
   * Registers a callback to be triggered when the value has changed.
   * Implemented as part of ControlValueAccessor.
   * @param fn Function to be called on change.
   */
  registerOnChange(fn: (value: any) => void) {
    this._controlValueAccessorChangeFn = fn;
  }

  /**
   * Registers a callback to be triggered when the control has been touched.
   * Implemented as part of ControlValueAccessor.
   * @param fn Callback to be triggered when the checkbox is touched.
   */
  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  /**
   * Sets the checkbox's disabled state. Implemented as a part of ControlValueAccessor.
   * @param isDisabled Whether the checkbox should be disabled.
   */
  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
    this._changeDetectorRef.markForCheck();
  }

  _getAriaChecked(): 'true' | 'false' | 'mixed' {
    return this.checked ? 'true' : (this.indeterminate ? 'mixed' : 'false');
  }

  private _transitionCheckState(newState: TransitionCheckState) {
    let oldState = this._currentCheckState;
    let element: HTMLElement = this._elementRef.nativeElement;

    if (oldState === newState) {
      return;
    }
    if (this._currentAnimationClass.length > 0) {
      element.classList.remove(this._currentAnimationClass);
    }

    this._currentAnimationClass = this._getAnimationClassForCheckStateTransition(
        oldState, newState);
    this._currentCheckState = newState;

    if (this._currentAnimationClass.length > 0) {
      element.classList.add(this._currentAnimationClass);
    }
  }

  private _emitChangeEvent() {
    let event = new MatCheckboxChange();
    event.source = this;
    event.checked = this.checked;

    this._controlValueAccessorChangeFn(this.checked);
    this.change.emit(event);
  }

  /** Function is called whenever the focus changes for the input element. */
  private _onInputFocusChange(focusOrigin: FocusOrigin) {
    if (!this._focusRipple && focusOrigin === 'keyboard') {
      this._focusRipple = this._ripple.launch(0, 0, {persistent: true, ...this._rippleConfig});
    } else if (!focusOrigin) {
      this._removeFocusRipple();
      this.onTouched();
    }
  }

  /** Toggles the `checked` state of the checkbox. */
  toggle(): void {
    this.checked = !this.checked;
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

    // If resetIndeterminate is false, and the current state is indeterminate, do nothing on click
    if (!this.disabled && this._clickAction !== 'noop') {
      // When user manually click on the checkbox, `indeterminate` is set to false.
      if (this.indeterminate && this._clickAction !== 'check') {

        Promise.resolve().then(() => {
          this._indeterminate = false;
          this.indeterminateChange.emit(this._indeterminate);
        });
      }

      this.toggle();
      this._transitionCheckState(
          this._checked ? TransitionCheckState.Checked : TransitionCheckState.Unchecked);

      // Emit our custom change event if the native input emitted one.
      // It is important to only emit it, if the native input triggered one, because
      // we don't want to trigger a change event, when the `checked` variable changes for example.
      this._emitChangeEvent();
    } else if (!this.disabled && this._clickAction === 'noop') {
      // Reset native input when clicked with noop. The native checkbox becomes checked after
      // click, reset it to be align with `checked` value of `mat-checkbox`.
      this._inputElement.nativeElement.checked = this.checked;
      this._inputElement.nativeElement.indeterminate = this.indeterminate;
    }
  }

  /** Focuses the checkbox. */
  focus(): void {
    this._focusMonitor.focusVia(this._inputElement.nativeElement, 'keyboard');
  }

  _onInteractionEvent(event: Event) {
    // We always have to stop propagation on the change event.
    // Otherwise the change event, from the input element, will bubble up and
    // emit its event object to the `change` output.
    event.stopPropagation();
  }

  private _getAnimationClassForCheckStateTransition(
      oldState: TransitionCheckState, newState: TransitionCheckState): string {
    let animSuffix: string = '';

    switch (oldState) {
      case TransitionCheckState.Init:
        // Handle edge case where user interacts with checkbox that does not have [(ngModel)] or
        // [checked] bound to it.
        if (newState === TransitionCheckState.Checked) {
          animSuffix = 'unchecked-checked';
        } else if (newState == TransitionCheckState.Indeterminate) {
          animSuffix = 'unchecked-indeterminate';
        } else {
          return '';
        }
        break;
      case TransitionCheckState.Unchecked:
        animSuffix = newState === TransitionCheckState.Checked ?
            'unchecked-checked' : 'unchecked-indeterminate';
        break;
      case TransitionCheckState.Checked:
        animSuffix = newState === TransitionCheckState.Unchecked ?
            'checked-unchecked' : 'checked-indeterminate';
        break;
      case TransitionCheckState.Indeterminate:
        animSuffix = newState === TransitionCheckState.Checked ?
            'indeterminate-checked' : 'indeterminate-unchecked';
        break;
    }

    return `mat-checkbox-anim-${animSuffix}`;
  }

  /** Fades out the focus state ripple. */
  private _removeFocusRipple(): void {
    if (this._focusRipple) {
      this._focusRipple.fadeOut();
      this._focusRipple = null;
    }
  }
}
