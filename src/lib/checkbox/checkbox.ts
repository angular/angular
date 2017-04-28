import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnDestroy,
  Output,
  Renderer2,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {coerceBooleanProperty} from '../core/coercion/boolean-property';
import {FocusOrigin, FocusOriginMonitor, MdRipple, RippleRef} from '../core';
import {mixinDisabled, CanDisable} from '../core/common-behaviors/disabled';


/** Monotonically increasing integer used to auto-generate unique ids for checkbox components. */
let nextId = 0;

/**
 * Provider Expression that allows md-checkbox to register as a ControlValueAccessor.
 * This allows it to support [(ngModel)].
 * @docs-private
 */
export const MD_CHECKBOX_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MdCheckbox),
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

/** Change event object emitted by MdCheckbox. */
export class MdCheckboxChange {
  /** The source MdCheckbox of the event. */
  source: MdCheckbox;
  /** The new `checked` value of the checkbox. */
  checked: boolean;
}

// Boilerplate for applying mixins to MdCheckbox.
export class MdCheckboxBase { }
export const _MdCheckboxMixinBase = mixinDisabled(MdCheckboxBase);


/**
 * A material design checkbox component. Supports all of the functionality of an HTML5 checkbox,
 * and exposes a similar API. A MdCheckbox can be either checked, unchecked, indeterminate, or
 * disabled. Note that all additional accessibility attributes are taken care of by the component,
 * so there is no need to provide them yourself. However, if you want to omit a label and still
 * have the checkbox be accessible, you may supply an [aria-label] input.
 * See: https://www.google.com/design/spec/components/selection-controls.html
 */
@Component({
  moduleId: module.id,
  selector: 'md-checkbox, mat-checkbox',
  templateUrl: 'checkbox.html',
  styleUrls: ['checkbox.css'],
  host: {
    'class': 'mat-checkbox',
    '[class.mat-checkbox-indeterminate]': 'indeterminate',
    '[class.mat-checkbox-checked]': 'checked',
    '[class.mat-checkbox-disabled]': 'disabled',
    '[class.mat-checkbox-label-before]': 'labelPosition == "before"',
  },
  providers: [MD_CHECKBOX_CONTROL_VALUE_ACCESSOR],
  inputs: ['disabled'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MdCheckbox extends _MdCheckboxMixinBase
    implements ControlValueAccessor, AfterViewInit, OnDestroy, CanDisable {
  /**
   * Attached to the aria-label attribute of the host element. In most cases, arial-labelledby will
   * take precedence so this may be omitted.
   */
  @Input('aria-label') ariaLabel: string = '';

  /**
   * Users can specify the `aria-labelledby` attribute which will be forwarded to the input element
   */
  @Input('aria-labelledby') ariaLabelledby: string = null;

  /** A unique id for the checkbox. If one is not supplied, it is auto-generated. */
  @Input() id: string = `md-checkbox-${++nextId}`;

  /** Whether the ripple effect on click should be disabled. */
  private _disableRipple: boolean;

  /** Whether the ripple effect for this checkbox is disabled. */
  @Input()
  get disableRipple(): boolean { return this._disableRipple; }
  set disableRipple(value) { this._disableRipple = coerceBooleanProperty(value); }

  /** ID of the native input element inside `<md-checkbox>` */
  get inputId(): string {
    return `input-${this.id}`;
  }

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

  /** Tabindex value that is passed to the underlying input element. */
  @Input() tabIndex: number = 0;

  /** Name value will be applied to the input element if present */
  @Input() name: string = null;

  /** Event emitted when the checkbox's `checked` value changes. */
  @Output() change: EventEmitter<MdCheckboxChange> = new EventEmitter<MdCheckboxChange>();

  /** Event emitted when the checkbox's `indeterminate` value changes. */
  @Output() indeterminateChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  /** The value attribute of the native input element */
  @Input() value: string ;

  /** The native `<input type="checkbox"> element */
  @ViewChild('input') _inputElement: ElementRef;

  @ViewChild('labelWrapper') _labelWrapper: ElementRef;

  /** Whether the checkbox has label */
  _hasLabel(): boolean {
    const labelText = this._labelWrapper.nativeElement.textContent || '';
    return !!labelText.trim().length;
  }

  /** Called when the checkbox is blurred. Needed to properly implement ControlValueAccessor. */
  @ViewChild(MdRipple) _ripple: MdRipple;

  /**
   * Called when the checkbox is blurred. Needed to properly implement ControlValueAccessor.
   * @docs-private
   */
  onTouched: () => any = () => {};

  private _currentAnimationClass: string = '';

  private _currentCheckState: TransitionCheckState = TransitionCheckState.Init;

  private _checked: boolean = false;

  private _indeterminate: boolean = false;

  private _color: string;

  private _controlValueAccessorChangeFn: (value: any) => void = (value) => {};

  /** Reference to the focused state ripple. */
  private _focusRipple: RippleRef;

  constructor(private _renderer: Renderer2,
              private _elementRef: ElementRef,
              private _changeDetectorRef: ChangeDetectorRef,
              private _focusOriginMonitor: FocusOriginMonitor) {
    super();
    this.color = 'accent';
  }

  ngAfterViewInit() {
    this._focusOriginMonitor
      .monitor(this._inputElement.nativeElement, this._renderer, false)
      .subscribe(focusOrigin => this._onInputFocusChange(focusOrigin));
  }

  ngOnDestroy() {
    this._focusOriginMonitor.stopMonitoring(this._inputElement.nativeElement);
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

  /** The color of the button. Can be `primary`, `accent`, or `warn`. */
  @Input()
  get color(): string { return this._color; }
  set color(value: string) { this._updateColor(value); }

  _updateColor(newColor: string) {
    this._setElementColor(this._color, false);
    this._setElementColor(newColor, true);
    this._color = newColor;
  }

  _setElementColor(color: string, isAdd: boolean) {
    if (color != null && color != '') {
      if (isAdd) {
        this._renderer.addClass(this._elementRef.nativeElement, `mat-${color}`);
      } else {
        this._renderer.removeClass(this._elementRef.nativeElement, `mat-${color}`);
      }
    }
  }

  _isRippleDisabled() {
    return this.disableRipple || this.disabled;
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

  private _transitionCheckState(newState: TransitionCheckState) {
    let oldState = this._currentCheckState;
    let renderer = this._renderer;
    let elementRef = this._elementRef;

    if (oldState === newState) {
      return;
    }
    if (this._currentAnimationClass.length > 0) {
      renderer.removeClass(elementRef.nativeElement, this._currentAnimationClass);
    }

    this._currentAnimationClass = this._getAnimationClassForCheckStateTransition(
        oldState, newState);
    this._currentCheckState = newState;

    if (this._currentAnimationClass.length > 0) {
      renderer.addClass(elementRef.nativeElement, this._currentAnimationClass);
    }
  }

  private _emitChangeEvent() {
    let event = new MdCheckboxChange();
    event.source = this;
    event.checked = this.checked;

    this._controlValueAccessorChangeFn(this.checked);
    this.change.emit(event);
  }

  /** Function is called whenever the focus changes for the input element. */
  private _onInputFocusChange(focusOrigin: FocusOrigin) {
    if (!this._focusRipple && focusOrigin === 'keyboard') {
      this._focusRipple = this._ripple.launch(0, 0, {persistent: true, centered: true});
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

    this._removeFocusRipple();

    if (!this.disabled) {
      // When user manually click on the checkbox, `indeterminate` is set to false.
      if (this._indeterminate) {
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
    }
  }

  /** Focuses the checkbox. */
  focus(): void {
    this._focusOriginMonitor.focusVia(this._inputElement.nativeElement, this._renderer, 'keyboard');
  }

  _onInteractionEvent(event: Event) {
    // We always have to stop propagation on the change event.
    // Otherwise the change event, from the input element, will bubble up and
    // emit its event object to the `change` output.
    event.stopPropagation();
  }

  private _getAnimationClassForCheckStateTransition(
      oldState: TransitionCheckState, newState: TransitionCheckState): string {
    let animSuffix: string;

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
