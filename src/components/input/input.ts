import {
  forwardRef,
  Component,
  HostBinding,
  Input,
  Provider,
  Directive,
  AfterContentInit,
  ContentChild,
  SimpleChange,
  ContentChildren,
  ViewChild,
  ElementRef,
  QueryList,
  OnChanges,
  EventEmitter,
  Output,
} from '@angular/core';
import {
  NG_VALUE_ACCESSOR,
  ControlValueAccessor
} from '@angular/common';
import {BooleanFieldValue} from '@angular2-material/core/annotations/field-value';
import {MdError} from '@angular2-material/core/errors/error';
import {Observable} from 'rxjs/Observable';


const noop = () => {};

const MD_INPUT_CONTROL_VALUE_ACCESSOR = new Provider(NG_VALUE_ACCESSOR, {
  useExisting: forwardRef(() => MdInput),
  multi: true
});

// Invalid input type. Using one of these will throw an MdInputUnsupportedTypeError.
const MD_INPUT_INVALID_INPUT_TYPE = [
  'file',
  'radio',
  'checkbox',
];


let nextUniqueId = 0;


export class MdInputPlaceholderConflictError extends MdError {
  constructor() {
    super('Placeholder attribute and child element were both specified.');
  }
}

export class MdInputUnsupportedTypeError extends MdError {
  constructor(type: string) {
    super(`Input type "${type}" isn't supported by md-input.`);
  }
}

export class MdInputDuplicatedHintError extends MdError {
  constructor(align: string) {
    super(`A hint was already declared for 'align="${align}"'.`);
  }
}



/**
 * The placeholder directive. The content can declare this to implement more
 * complex placeholders.
 */
@Directive({
  selector: 'md-placeholder'
})
export class MdPlaceholder {}


/** The hint directive, used to tag content as hint labels (going under the input). */
@Directive({
  selector: 'md-hint',
  host: {
    '[class.md-right]': 'align == "end"',
    '[class.md-hint]': 'true'
  }
})
export class MdHint {
  // Whether to align the hint label at the start or end of the line.
  @Input() align: 'start' | 'end' = 'start';
}


/**
 * Component that represents a text input. It encapsulates the <input> HTMLElement and
 * improve on its behaviour, along with styling it according to the Material Design.
 */
@Component({
  moduleId: module.id,
  selector: 'md-input',
  templateUrl: 'input.html',
  styleUrls: ['input.css'],
  providers: [MD_INPUT_CONTROL_VALUE_ACCESSOR],
  host: {'(click)' : 'focus()'}
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
  @Input('aria-disabled') @BooleanFieldValue() ariaDisabled: boolean;
  @Input('aria-required') @BooleanFieldValue() ariaRequired: boolean;
  @Input('aria-invalid') @BooleanFieldValue() ariaInvalid: boolean;

  /**
   * Content directives.
   */
  @ContentChild(MdPlaceholder) private _placeholderChild: MdPlaceholder;
  @ContentChildren(MdHint) private _hintChildren: QueryList<MdHint>;

  /** Readonly properties. */
  get focused() { return this._focused; }
  get empty() { return this._value == null || this._value === ''; }
  get characterCount(): number {
    return this.empty ? 0 : ('' + this._value).length;
  }
  get inputId(): string { return `${this.id}-input`; }

  /**
   * Bindings.
   */
  @Input() align: 'start' | 'end' = 'start';
  @Input() dividerColor: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() @BooleanFieldValue() floatingPlaceholder: boolean = true;
  @Input() hintLabel: string = '';

  @Input() autoComplete: string;
  @Input() @BooleanFieldValue() autoFocus: boolean = false;
  @Input() @BooleanFieldValue() disabled: boolean = false;
  @Input() id: string = `md-input-${nextUniqueId++}`;
  @Input() list: string = null;
  @Input() max: string = null;
  @Input() maxLength: number = null;
  @Input() min: string = null;
  @Input() minLength: number = null;
  @Input() placeholder: string = null;
  @Input() @BooleanFieldValue() readOnly: boolean = false;
  @Input() @BooleanFieldValue() required: boolean = false;
  @Input() @BooleanFieldValue() spellCheck: boolean = false;
  @Input() step: number = null;
  @Input() tabIndex: number = null;
  @Input() type: string = 'text';
  @Input() name: string = null;

  private _blurEmitter: EventEmitter<FocusEvent> = new EventEmitter<FocusEvent>();
  private _focusEmitter: EventEmitter<FocusEvent> = new EventEmitter<FocusEvent>();

  @Output('blur')
  get onBlur(): Observable<FocusEvent> {
    return this._blurEmitter.asObservable();
  }

  @Output('focus')
  get onFocus(): Observable<FocusEvent> {
    return this._focusEmitter.asObservable();
  }

  get value(): any { return this._value; };
  @Input() set value(v: any) {
    v = this._convertValueForInputType(v);
    if (v !== this._value) {
      this._value = v;
      this._onChangeCallback(v);
    }
  }

  // This is to remove the `align` property of the `md-input` itself. Otherwise HTML5
  // might place it as RTL when we don't want to. We still want to use `align` as an
  // Input though, so we use HostBinding.
  @HostBinding('attr.align') private get _align(): any { return null; }


  @ViewChild('input') private _inputElement: ElementRef;

  /** Set focus on input */
  focus() {
    this._inputElement.nativeElement.focus();
  }

  /** @internal */
  handleFocus(event: FocusEvent) {
    this._focused = true;
    this._focusEmitter.emit(event);
  }

  /** @internal */
  handleBlur(event: FocusEvent) {
    this._focused = false;
    this._onTouchedCallback();
    this._blurEmitter.emit(event);
  }

  /** @internal */
  handleChange(event: Event) {
    this.value = (<HTMLInputElement>event.target).value;
    this._onTouchedCallback();
  }

  /** @internal */
  hasPlaceholder(): boolean {
    return !!this.placeholder || this._placeholderChild != null;
  }

  /**
   * Implemented as part of ControlValueAccessor.
   * TODO: internal
   */
  writeValue(value: any) {
    this._value = value;
  }

  /**
   * Implemented as part of ControlValueAccessor.
   * TODO: internal
   */
  registerOnChange(fn: any) {
    this._onChangeCallback = fn;
  }

  /**
   * Implemented as part of ControlValueAccessor.
   * TODO: internal
   */
  registerOnTouched(fn: any) {
    this._onTouchedCallback = fn;
  }

  /** TODO: internal */
  ngAfterContentInit() {
    this._validateConstraints();

    // Trigger validation when the hint children change.
    this._hintChildren.changes.subscribe(() => {
      this._validateConstraints();
    });
  }

  /** TODO: internal */
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

export const MD_INPUT_DIRECTIVES = [MdPlaceholder, MdInput, MdHint];
