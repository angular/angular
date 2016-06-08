import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    Output,
    Provider,
    Renderer,
    ViewEncapsulation,
    forwardRef,
    AfterContentInit
} from '@angular/core';
import {NG_VALUE_ACCESSOR, ControlValueAccessor} from '@angular/common';

/**
 * Monotonically increasing integer used to auto-generate unique ids for checkbox components.
 */
let nextId = 0;

/**
 * Provider Expression that allows md-checkbox to register as a ControlValueAccessor. This allows it
 * to support [(ngModel)] and ngControl.
 */
const MD_CHECKBOX_CONTROL_VALUE_ACCESSOR = new Provider(
    NG_VALUE_ACCESSOR, {
      useExisting: forwardRef(() => MdCheckbox),
      multi: true
    });

/**
 * Represents the different states that require custom transitions between them.
 */
enum TransitionCheckState {
  /** The initial state of the component before any user interaction. */
  Init,
  /** The state representing the component when it's becoming checked. */
  Checked,
  /** The state representing the component when it's becoming unchecked. */
  Unchecked,
  /** The state representing the component when it's becoming indeterminate. */
  Indeterminate
}

// A simple change event emitted by the MdCheckbox component.
export class MdCheckboxChange {
  source: MdCheckbox;
  checked: boolean;
}

/**
 * A material design checkbox component. Supports all of the functionality of an HTML5 checkbox,
 * and exposes a similar API. An MdCheckbox can be either checked, unchecked, indeterminate, or
 * disabled. Note that all additional accessibility attributes are taken care of by the component,
 * so there is no need to provide them yourself. However, if you want to omit a label and still
 * have the checkbox be accessible, you may supply an [aria-label] input.
 * See: https://www.google.com/design/spec/components/selection-controls.html
 */
@Component({
  moduleId: module.id,
  selector: 'md-checkbox',
  templateUrl: 'checkbox.html',
  styleUrls: ['checkbox.css'],
  host: {
    '[class.md-checkbox-indeterminate]': 'indeterminate',
    '[class.md-checkbox-checked]': 'checked',
    '[class.md-checkbox-disabled]': 'disabled',
    '[class.md-checkbox-align-end]': 'align == "end"',
    '[class.md-checkbox-focused]': 'hasFocus',
  },
  providers: [MD_CHECKBOX_CONTROL_VALUE_ACCESSOR],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MdCheckbox implements AfterContentInit, ControlValueAccessor {
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

  /** ID to be applied to the `input` element */
  get inputId(): string {
    return `input-${this.id}`;
  }

  /** Whether or not the checkbox should come before or after the label. */
  @Input() align: 'start' | 'end' = 'start';

  /**
   * Whether the checkbox is disabled. When the checkbox is disabled it cannot be interacted with.
   * The correct ARIA attributes are applied to denote this to assistive technology.
   */
  @Input() disabled: boolean = false;

  /**
   * The tabindex attribute for the checkbox. Note that when the checkbox is disabled, the attribute
   * on the host element will be removed. It will be placed back when the checkbox is re-enabled.
   */
  @Input() tabindex: number = 0;

  /** Name value will be applied to the input element if present */
  @Input() name: string = null;

  /** Event emitted when the checkbox's `checked` value changes. */
  @Output() change: EventEmitter<MdCheckboxChange> = new EventEmitter<MdCheckboxChange>();

  /** Called when the checkbox is blurred. Needed to properly implement ControlValueAccessor. */
  onTouched: () => any = () => {};

  /** Whether the `checked` state has been set to its initial value. */
  private _isInitialized: boolean = false;

  private _currentAnimationClass: string = '';

  private _currentCheckState: TransitionCheckState = TransitionCheckState.Init;

  private _checked: boolean = false;

  private _indeterminate: boolean = false;

  private _controlValueAccessorChangeFn: (value: any) => void = (value) => {};

  hasFocus: boolean = false;

  constructor(private _renderer: Renderer, private _elementRef: ElementRef) {}

  /**
   * Whether the checkbox is checked. Note that setting `checked` will immediately set
   * `indeterminate` to false.
   */
  @Input() get checked() {
    return this._checked;
  }

  set checked(checked: boolean) {
    if (checked != this.checked) {
      this._indeterminate = false;
      this._checked = checked;
      this._transitionCheckState(
          this._checked ? TransitionCheckState.Checked : TransitionCheckState.Unchecked);

      // Only fire a change event if this isn't the first time the checked property is ever set.
      if (this._isInitialized) {
        this._emitChangeEvent();
      }
    }
  }

  /** TODO: internal */
  ngAfterContentInit() {
    this._isInitialized = true;
  }

  /**
   * Whether the checkbox is indeterminate. This is also known as "mixed" mode and can be used to
   * represent a checkbox with three states, e.g. a checkbox that represents a nested list of
   * checkable items. Note that whenever `checked` is set, indeterminate is immediately set to
   * false. This differs from the web platform in that indeterminate state on native
   * checkboxes is only remove when the user manually checks the checkbox (rather than setting the
   * `checked` property programmatically). However, we feel that this behavior is more accommodating
   * to the way consumers would envision using this component.
   */
  @Input() get indeterminate() {
    return this._indeterminate;
  }

  set indeterminate(indeterminate: boolean) {
    this._indeterminate = indeterminate;
    if (this._indeterminate) {
      this._transitionCheckState(TransitionCheckState.Indeterminate);
    } else {
      this._transitionCheckState(
          this.checked ? TransitionCheckState.Checked : TransitionCheckState.Unchecked);
    }
  }

  /**
   * Implemented as part of ControlValueAccessor.
   * TODO: internal
   */
  writeValue(value: any) {
    this.checked = !!value;
  }

  /**
   * Implemented as part of ControlValueAccessor.
   * TODO: internal
   */
  registerOnChange(fn: (value: any) => void) {
    this._controlValueAccessorChangeFn = fn;
  }

  /**
   * Implemented as part of ControlValueAccessor.
   * TODO: internal
   */
  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  private _transitionCheckState(newState: TransitionCheckState) {
    let oldState = this._currentCheckState;
    let renderer = this._renderer;
    let elementRef = this._elementRef;

    if (oldState === newState) {
      return;
    }
    if (this._currentAnimationClass.length > 0) {
      renderer.setElementClass(elementRef.nativeElement, this._currentAnimationClass, false);
    }

    this._currentAnimationClass = this._getAnimationClassForCheckStateTransition(
        oldState, newState);
    this._currentCheckState = newState;

    if (this._currentAnimationClass.length > 0) {
      renderer.setElementClass(elementRef.nativeElement, this._currentAnimationClass, true);
    }
  }

  private _emitChangeEvent() {
    let event = new MdCheckboxChange();
    event.source = this;
    event.checked = this.checked;

    this._controlValueAccessorChangeFn(this.checked);
    this.change.emit(event);
  }

  /**
   * Informs the component when the input has focus so that we can style accordingly
   * @internal
   */
  onInputFocus() {
    this.hasFocus = true;
  }

  /**
   * Informs the component when we lose focus in order to style accordingly
   * @internal
   */
  onInputBlur() {
    this.hasFocus = false;
    this.onTouched();
  }

  /**
   * Toggles the `checked` value between true and false
   */
  toggle() {
    this.checked = !this.checked;
  }

  /**
   * Event handler for checkbox input element.
   * Toggles checked state if element is not disabled.
   * @param event
   * @internal
   */
  onInteractionEvent(event: Event) {
    // We always have to stop propagation on the change event.
    // Otherwise the change event, from the input element, will bubble up and
    // emit its event object to the `change` output.
    event.stopPropagation();

    if (!this.disabled) {
      this.toggle();
    }
  }

  private _getAnimationClassForCheckStateTransition(
      oldState: TransitionCheckState, newState: TransitionCheckState): string {
    var animSuffix: string;

    switch (oldState) {
    case TransitionCheckState.Init:
      // Handle edge case where user interacts with checkbox that does not have [(ngModel)] or
      // [checked] bound to it.
      if (newState === TransitionCheckState.Checked) {
        animSuffix = 'unchecked-checked';
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

    return `md-checkbox-anim-${animSuffix}`;
  }
}

export const MD_CHECKBOX_DIRECTIVES = [MdCheckbox];
