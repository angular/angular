import {
  forwardRef,
  Component,
  HostBinding,
  Input,
  AfterContentInit,
  ContentChild,
  SimpleChange,
  ContentChildren,
  ViewChild,
  ElementRef,
  Renderer,
  QueryList,
  OnChanges,
  EventEmitter,
  Output,
  NgModule,
  ModuleWithProviders,
  ViewEncapsulation
} from '@angular/core';
import {NG_VALUE_ACCESSOR, ControlValueAccessor, FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {MdError, coerceBooleanProperty} from '../core';
import {Observable} from 'rxjs/Observable';
import {MdPlaceholder, MdInputContainer, MdHint, MdInputDirective} from './input-container';
import {MdTextareaAutosize} from './autosize';
import {PlatformModule} from '../core/platform/index';


const noop = () => {};


export const MD_INPUT_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MdInput),
  multi: true
};

// Invalid input type. Using one of these will throw an MdInputUnsupportedTypeError.
const MD_INPUT_INVALID_INPUT_TYPE = [
  'file',
  'radio',
  'checkbox',
];


let nextUniqueId = 0;

/** @docs-private */
export class MdInputPlaceholderConflictError extends MdError {
  constructor() {
    super('Placeholder attribute and child element were both specified.');
  }
}

/** @docs-private */
export class MdInputUnsupportedTypeError extends MdError {
  constructor(type: string) {
    super(`Input type "${type}" isn't supported by md-input.`);
  }
}

/** @docs-private */
export class MdInputDuplicatedHintError extends MdError {
  constructor(align: string) {
    super(`A hint was already declared for 'align="${align}"'.`);
  }
}


/**
 * Component that represents a text input. It encapsulates the <input> HTMLElement and
 * improve on its behaviour, along with styling it according to the Material Design.
 * @deprecated
 * @docs-private
 */
@Component({
  moduleId: module.id,
  selector: 'md-input, md-textarea',
  templateUrl: 'input.html',
  styleUrls: ['input.css'],
  providers: [MD_INPUT_CONTROL_VALUE_ACCESSOR],
  host: {'(click)' : 'focus()'},
  encapsulation: ViewEncapsulation.None,
})
export class MdInput implements ControlValueAccessor, AfterContentInit, OnChanges {
  private _focused: boolean = false;
  private _value: any = '';

  /** Callback registered via registerOnTouched (ControlValueAccessor) */
  private _onTouchedCallback: () => void = noop;
  /** Callback registered via registerOnChange (ControlValueAccessor) */
  private _onChangeCallback: (_: any) => void = noop;

  /**
   * Aria related inputs.
   */
  @Input('aria-label') ariaLabel: string;
  @Input('aria-labelledby') ariaLabelledBy: string;

  private _ariaDisabled: boolean;
  private _ariaRequired: boolean;
  private _ariaInvalid: boolean;

  /** Mirrors the native `aria-disabled` attribute. */
  @Input('aria-disabled')
  get ariaDisabled(): boolean { return this._ariaDisabled; }
  set ariaDisabled(value) { this._ariaDisabled = coerceBooleanProperty(value); }

  /** Mirrors the native `aria-required` attribute. */
  @Input('aria-required')
  get ariaRequired(): boolean { return this._ariaRequired; }
  set ariaRequired(value) { this._ariaRequired = coerceBooleanProperty(value); }

  /** Mirrors the native `aria-invalid` attribute. */
  @Input('aria-invalid')
  get ariaInvalid(): boolean { return this._ariaInvalid; }
  set ariaInvalid(value) { this._ariaInvalid = coerceBooleanProperty(value); }

  /**
   * Content directives.
   */
  @ContentChild(MdPlaceholder) _placeholderChild: MdPlaceholder;
  @ContentChildren(MdHint) _hintChildren: QueryList<MdHint>;

  /** Readonly properties. */

  /** Whether the element is focused. */
  get focused() { return this._focused; }

  /** Whether the element is empty. */
  get empty() { return (this._value == null || this._value === '') && this.type !== 'date'; }

  /** Amount of characters inside the element. */
  get characterCount(): number {
    return this.empty ? 0 : ('' + this._value).length;
  }

  /** Unique element id. */
  get inputId(): string { return `${this.id}-input`; }

  /** Alignment of the input container's content. */
  @Input() align: 'start' | 'end' = 'start';

  /** Color of the input divider, based on the theme. */
  @Input() dividerColor: 'primary' | 'accent' | 'warn' = 'primary';

  /** Text for the input hint. */
  @Input() hintLabel: string = '';

  /** Mirrors the native `autocomplete` attribute. */
  @Input() autocomplete: string;

  /** Mirrors the native `autocorrect` attribute. */
  @Input() autocorrect: string;

  /** Mirrors the native `autocapitalize` attribute. */
  @Input() autocapitalize: string;

  /** Unique id for the input element. */
  @Input() id: string = `md-input-${nextUniqueId++}`;

  /** Mirrors the native `list` attribute. */
  @Input() list: string = null;

  /** Mirrors the native `max` attribute. */
  @Input() max: string | number = null;

  /** Mirrors the native `maxlength` attribute. */
  @Input() maxlength: number = null;

  /** Mirrors the native `min` attribute. */
  @Input() min: string | number = null;

  /** Mirrors the native `minlength` attribute. */
  @Input() minlength: number = null;

  /** Mirrors the native `placeholder` attribute. */
  @Input() placeholder: string = null;

  /** Mirrors the native `step` attribute. */
  @Input() step: number = null;

  /** Mirrors the native `tabindex` attribute. */
  @Input() tabindex: number = null;

  /** Mirrors the native `type` attribute. */
  @Input() type: string = 'text';

  /** Mirrors the native `name` attribute. */
  @Input() name: string = null;

  // textarea-specific
  /** Mirrors the native `rows` attribute. */
  @Input() rows: number = null;

  /** Mirrors the native `cols` attribute. */
  @Input() cols: number = null;

  /** Whether to do a soft or hard wrap of the text.. */
  @Input() wrap: 'soft' | 'hard' = null;

  private _floatingPlaceholder: boolean = true;
  private _autofocus: boolean = false;
  private _disabled: boolean = false;
  private _readonly: boolean = false;
  private _required: boolean = false;
  private _spellcheck: boolean = false;

  /** Text for the floating placeholder. */
  @Input()
  get floatingPlaceholder(): boolean { return this._floatingPlaceholder; }
  set floatingPlaceholder(value) { this._floatingPlaceholder = coerceBooleanProperty(value); }

  /** Whether to automatically focus the input. */
  @Input()
  get autofocus(): boolean { return this._autofocus; }
  set autofocus(value) { this._autofocus = coerceBooleanProperty(value); }

  /** Whether the input is disabled. */
  @Input()
  get disabled(): boolean { return this._disabled; }
  set disabled(value) { this._disabled = coerceBooleanProperty(value); }

  /** Whether the input is readonly. */
  @Input()
  get readonly(): boolean { return this._readonly; }
  set readonly(value) { this._readonly = coerceBooleanProperty(value); }

  /** Whether the input is required. */
  @Input()
  get required(): boolean { return this._required; }
  set required(value) { this._required = coerceBooleanProperty(value); }

  /** Whether spellchecking is enable on the input. */
  @Input()
  get spellcheck(): boolean { return this._spellcheck; }
  set spellcheck(value) { this._spellcheck = coerceBooleanProperty(value); }


  private _blurEmitter: EventEmitter<FocusEvent> = new EventEmitter<FocusEvent>();
  private _focusEmitter: EventEmitter<FocusEvent> = new EventEmitter<FocusEvent>();

  /** Event emitted when the input is blurred. */
  @Output('blur')
  get onBlur(): Observable<FocusEvent> {
    return this._blurEmitter.asObservable();
  }

  /** Event emitted when the input is focused. */
  @Output('focus')
  get onFocus(): Observable<FocusEvent> {
    return this._focusEmitter.asObservable();
  }

  /** Value of the input. */
  @Input()
  get value(): any { return this._value; };
  set value(v: any) {
    v = this._convertValueForInputType(v);
    if (v !== this._value) {
      this._value = v;
      this._onChangeCallback(v);
    }
  }

  // This is to remove the `align` property of the `md-input` itself. Otherwise HTML5
  // might place it as RTL when we don't want to. We still want to use `align` as an
  // Input though, so we use HostBinding.
  @HostBinding('attr.align') get _align(): any { return null; }


  @ViewChild('input') _inputElement: ElementRef;

  _elementType: 'input' | 'textarea';

  constructor(elementRef: ElementRef, private _renderer: Renderer) {
    // Set the element type depending on normalized selector used(md-input / md-textarea)
    this._elementType = elementRef.nativeElement.nodeName.toLowerCase() === 'md-input' ?
        'input' :
        'textarea';
  }

  /** Set focus on input */
  focus() {
    this._renderer.invokeElementMethod(this._inputElement.nativeElement, 'focus');
  }

  _handleFocus(event: FocusEvent) {
    this._focused = true;
    this._focusEmitter.emit(event);
  }

  _handleBlur(event: FocusEvent) {
    this._focused = false;
    this._onTouchedCallback();
    this._blurEmitter.emit(event);
  }

  _handleChange(event: Event) {
    this.value = (<HTMLInputElement>event.target).value;
    this._onTouchedCallback();
  }

  _hasPlaceholder(): boolean {
    return !!this.placeholder || this._placeholderChild != null;
  }

  /**
   * Sets the model value of the input. Implemented as part of ControlValueAccessor.
   * @param value Value to be set.
   */
  writeValue(value: any) {
    this._value = value;
  }

  /**
   * Registers a callback to be triggered when the input value has changed.
   * Implemented as part of ControlValueAccessor.
   * @param fn Callback to be registered.
   */
  registerOnChange(fn: any) {
    this._onChangeCallback = fn;
  }

  /**
   * Registers a callback to be triggered when the input has been touched.
   * Implemented as part of ControlValueAccessor.
   * @param fn Callback to be registered.
   */
  registerOnTouched(fn: any) {
    this._onTouchedCallback = fn;
  }

  /**
   * Sets whether the input is disabled.
   * Implemented as a part of ControlValueAccessor.
   * @param isDisabled Whether the input should be disabled.
   */
  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }

  ngAfterContentInit() {
    this._validateConstraints();

    // Trigger validation when the hint children change.
    this._hintChildren.changes.subscribe(() => {
      this._validateConstraints();
    });
  }

  ngOnChanges(changes: {[key: string]: SimpleChange}) {
    this._validateConstraints();
  }

  /**
   * Convert the value passed in to a value that is expected from the type of the md-input.
   * This is normally performed by the *_VALUE_ACCESSOR in forms, but since the type is bound
   * on our internal input it won't work locally.
   * @private
   */
  private _convertValueForInputType(v: any): any {
    switch (this.type) {
      case 'number': return parseFloat(v);
      default: return v;
    }
  }

  /**
   * Ensure that all constraints defined by the API are validated, or throw errors otherwise.
   * Constraints for now:
   *   - placeholder attribute and <md-placeholder> are mutually exclusive.
   *   - type attribute is not one of the forbidden types (see constant at the top).
   *   - Maximum one of each `<md-hint>` alignment specified, with the attribute being
   *     considered as align="start".
   * @private
   */
  private _validateConstraints() {
    if (this.placeholder != '' && this.placeholder != null && this._placeholderChild != null) {
      throw new MdInputPlaceholderConflictError();
    }
    if (MD_INPUT_INVALID_INPUT_TYPE.indexOf(this.type) != -1) {
      throw new MdInputUnsupportedTypeError(this.type);
    }

    if (this._hintChildren) {
      // Validate the hint labels.
      let startHint: MdHint = null;
      let endHint: MdHint = null;
      this._hintChildren.forEach((hint: MdHint) => {
        if (hint.align == 'start') {
          if (startHint || this.hintLabel) {
            throw new MdInputDuplicatedHintError('start');
          }
          startHint = hint;
        } else if (hint.align == 'end') {
          if (endHint) {
            throw new MdInputDuplicatedHintError('end');
          }
          endHint = hint;
        }
      });
    }
  }
}


@NgModule({
  declarations: [
    MdInput,
    MdPlaceholder,
    MdInputContainer,
    MdHint,
    MdTextareaAutosize,
    MdInputDirective
  ],
  imports: [
    CommonModule,
    FormsModule,
    PlatformModule,
  ],
  exports: [
    MdInput,
    MdPlaceholder,
    MdInputContainer,
    MdHint,
    MdTextareaAutosize,
    MdInputDirective
  ],
})
export class MdInputModule {
  /** @deprecated */
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdInputModule,
      providers: [],
    };
  }
}
