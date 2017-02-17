import {
  Component,
  Input,
  Directive,
  AfterContentInit,
  ContentChild,
  ContentChildren,
  ElementRef,
  QueryList,
  ViewEncapsulation,
  Optional,
  Output,
  EventEmitter,
  Renderer
} from '@angular/core';
import {coerceBooleanProperty} from '../core';
import {NgControl} from '@angular/forms';
import {getSupportedInputTypes} from '../core/platform/features';
import {
  MdInputContainerUnsupportedTypeError,
  MdInputContainerPlaceholderConflictError,
  MdInputContainerDuplicatedHintError,
  MdInputContainerMissingMdInputError
} from './input-container-errors';


// Invalid input type. Using one of these will throw an MdInputContainerUnsupportedTypeError.
const MD_INPUT_INVALID_TYPES = [
  'button',
  'checkbox',
  'color',
  'file',
  'hidden',
  'image',
  'radio',
  'range',
  'reset',
  'submit'
];

/** Type for the available floatPlaceholder values. */
export type FloatPlaceholderType = 'always' | 'never' | 'auto';

let nextUniqueId = 0;


/**
 * The placeholder directive. The content can declare this to implement more
 * complex placeholders.
 */
@Directive({
  selector: 'md-placeholder, mat-placeholder'
})
export class MdPlaceholder {}


/** The hint directive, used to tag content as hint labels (going under the input). */
@Directive({
  selector: 'md-hint, mat-hint',
  host: {
    '[class.mat-hint]': 'true',
    '[class.mat-right]': 'align == "end"',
    '[attr.id]': 'id',
  }
})
export class MdHint {
  // Whether to align the hint label at the start or end of the line.
  @Input() align: 'start' | 'end' = 'start';

  // Unique ID for the hint. Used for the aria-describedby on the input.
  @Input() id: string = `md-input-hint-${nextUniqueId++}`;
}


/** The input directive, used to mark the input that `MdInputContainer` is wrapping. */
@Directive({
  selector: `input[mdInput], textarea[mdInput], input[matInput], textarea[matInput]`,
  host: {
    '[class.mat-input-element]': 'true',
    // Native input properties that are overwritten by Angular inputs need to be synced with
    // the native input element. Otherwise property bindings for those don't work.
    '[id]': 'id',
    '[placeholder]': 'placeholder',
    '[disabled]': 'disabled',
    '[required]': 'required',
    '[attr.aria-describedby]': 'ariaDescribedby',
    '(blur)': '_onBlur()',
    '(focus)': '_onFocus()',
    '(input)': '_onInput()',
  }
})
export class MdInputDirective {

  /** Variables used as cache for getters and setters. */
  private _type = 'text';
  private _placeholder: string = '';
  private _disabled = false;
  private _required = false;
  private _id: string;
  private _cachedUid: string;

  /** Whether the element is focused or not. */
  focused = false;

  /** Sets the aria-describedby attribute on the input for improved a11y. */
  ariaDescribedby: string;

  /** Whether the element is disabled. */
  @Input()
  get disabled() {
    return this._ngControl ? this._ngControl.disabled : this._disabled;
  }

  set disabled(value: any) {
    this._disabled = coerceBooleanProperty(value);
  }

  /** Unique id of the element. */
  @Input()
  get id() { return this._id; };
  set id(value: string) {this._id = value || this._uid; }

  /** Placeholder attribute of the element. */
  @Input()
  get placeholder() { return this._placeholder; }
  set placeholder(value: string) {
    if (this._placeholder !== value) {
      this._placeholder = value;
      this._placeholderChange.emit(this._placeholder);
    }
  }

  /** Whether the element is required. */
  @Input()
  get required() { return this._required; }
  set required(value: any) { this._required = coerceBooleanProperty(value); }

  /** Input type of the element. */
  @Input()
  get type() { return this._type; }
  set type(value: string) {
    this._type = value || 'text';
    this._validateType();

    // When using Angular inputs, developers are no longer able to set the properties on the native
    // input element. To ensure that bindings for `type` work, we need to sync the setter
    // with the native property. Textarea elements don't support the type property or attribute.
    if (!this._isTextarea() && getSupportedInputTypes().has(this._type)) {
      this._renderer.setElementProperty(this._elementRef.nativeElement, 'type', this._type);
    }
  }

  /** The input element's value. */
  get value() { return this._elementRef.nativeElement.value; }
  set value(value: string) { this._elementRef.nativeElement.value = value; }

  /**
   * Emits an event when the placeholder changes so that the `md-input-container` can re-validate.
   */
  @Output() _placeholderChange = new EventEmitter<string>();

  get empty() {
    return !this._isNeverEmpty() &&
        (this.value == null || this.value === '') &&
        // Check if the input contains bad input. If so, we know that it only appears empty because
        // the value failed to parse. From the user's perspective it is not empty.
        // TODO(mmalerba): Add e2e test for bad input case.
        !this._isBadInput();
  }

  private get _uid() { return this._cachedUid = this._cachedUid || `md-input-${nextUniqueId++}`; }

  private _neverEmptyInputTypes = [
    'date',
    'datetime',
    'datetime-local',
    'month',
    'time',
    'week'
  ].filter(t => getSupportedInputTypes().has(t));

  constructor(private _elementRef: ElementRef,
              private _renderer: Renderer,
              @Optional() public _ngControl: NgControl) {

    // Force setter to be called in case id was not specified.
    this.id = this.id;
  }

  /** Focuses the input element. */
  focus() { this._renderer.invokeElementMethod(this._elementRef.nativeElement, 'focus'); }

  _onFocus() { this.focused = true; }

  _onBlur() { this.focused = false; }

  _onInput() {
    // This is a noop function and is used to let Angular know whenever the value changes.
    // Angular will run a new change detection each time the `input` event has been dispatched.
    // It's necessary that Angular recognizes the value change, because when floatingLabel
    // is set to false and Angular forms aren't used, the placeholder won't recognize the
    // value changes and will not disappear.
    // Listening to the input event wouldn't be necessary when the input is using the
    // FormsModule or ReactiveFormsModule, because Angular forms also listens to input events.
  }

  /** Make sure the input is a supported type. */
  private _validateType() {
    if (MD_INPUT_INVALID_TYPES.indexOf(this._type) !== -1) {
      throw new MdInputContainerUnsupportedTypeError(this._type);
    }
  }

  private _isNeverEmpty() { return this._neverEmptyInputTypes.indexOf(this._type) !== -1; }

  private _isBadInput() {
    return (this._elementRef.nativeElement as HTMLInputElement).validity.badInput;
  }

  /** Determines if the component host is a textarea. If not recognizable it returns false. */
  private _isTextarea() {
    let nativeElement = this._elementRef.nativeElement;
    return nativeElement ? nativeElement.nodeName.toLowerCase() === 'textarea' : false;
  }
}


/**
 * Component that represents a text input. It encapsulates the <input> HTMLElement and
 * improve on its behaviour, along with styling it according to the Material Design.
 */
@Component({
  moduleId: module.id,
  selector: 'md-input-container, mat-input-container',
  templateUrl: 'input-container.html',
  styleUrls: ['input-container.css'],
  host: {
    // Remove align attribute to prevent it from interfering with layout.
    '[attr.align]': 'null',
    '[class.mat-input-container]': 'true',
    '[class.mat-focused]': '_mdInputChild.focused',
    '[class.ng-untouched]': '_shouldForward("untouched")',
    '[class.ng-touched]': '_shouldForward("touched")',
    '[class.ng-pristine]': '_shouldForward("pristine")',
    '[class.ng-dirty]': '_shouldForward("dirty")',
    '[class.ng-valid]': '_shouldForward("valid")',
    '[class.ng-invalid]': '_shouldForward("invalid")',
    '[class.ng-pending]': '_shouldForward("pending")',
    '(click)': '_focusInput()',
  },
  encapsulation: ViewEncapsulation.None,
})
export class MdInputContainer implements AfterContentInit {
  /** Alignment of the input container's content. */
  @Input() align: 'start' | 'end' = 'start';

  /** Color of the input divider, based on the theme. */
  @Input() dividerColor: 'primary' | 'accent' | 'warn' = 'primary';

  /** Whether the floating label should always float or not. */
  get _shouldAlwaysFloat() { return this._floatPlaceholder === 'always'; };

  /** Whether the placeholder can float or not. */
  get _canPlaceholderFloat() { return this._floatPlaceholder !== 'never'; }

  /** Text for the input hint. */
  @Input()
  get hintLabel() { return this._hintLabel; }
  set hintLabel(value: string) {
    this._hintLabel = value;
    this._processHints();
  }
  private _hintLabel = '';

  // Unique id for the hint label.
  _hintLabelId: string = `md-input-hint-${nextUniqueId++}`;

  /** Whether the placeholder should always float, never float or float as the user types. */
  @Input()
  get floatPlaceholder() { return this._floatPlaceholder; }
  set floatPlaceholder(value: FloatPlaceholderType) {
    this._floatPlaceholder = value || 'auto';
  }
  private _floatPlaceholder: FloatPlaceholderType = 'auto';

  @ContentChild(MdInputDirective) _mdInputChild: MdInputDirective;

  @ContentChild(MdPlaceholder) _placeholderChild: MdPlaceholder;

  @ContentChildren(MdHint) _hintChildren: QueryList<MdHint>;

  ngAfterContentInit() {
    if (!this._mdInputChild) {
      throw new MdInputContainerMissingMdInputError();
    }

    this._processHints();
    this._validatePlaceholders();

    // Re-validate when things change.
    this._hintChildren.changes.subscribe(() => this._processHints());
    this._mdInputChild._placeholderChange.subscribe(() => this._validatePlaceholders());
  }

  /** Determines whether a class from the NgControl should be forwarded to the host element. */
  _shouldForward(prop: string): boolean {
    let control = this._mdInputChild ? this._mdInputChild._ngControl : null;
    return control && (control as any)[prop];
  }

  /** Whether the input has a placeholder. */
  _hasPlaceholder() { return !!(this._mdInputChild.placeholder || this._placeholderChild); }

  /** Focuses the underlying input. */
  _focusInput() { this._mdInputChild.focus(); }

  /**
   * Ensure that there is only one placeholder (either `input` attribute or child element with the
   * `md-placeholder` attribute.
   */
  private _validatePlaceholders() {
    if (this._mdInputChild.placeholder && this._placeholderChild) {
      throw new MdInputContainerPlaceholderConflictError();
    }
  }

  /**
   * Does any extra processing that is required when handling the hints.
   */
  private _processHints() {
    this._validateHints();
    this._syncAriaDescribedby();
  }

  /**
   * Ensure that there is a maximum of one of each `<md-hint>` alignment specified, with the
   * attribute being considered as `align="start"`.
   */
  private _validateHints() {
    if (this._hintChildren) {
      let startHint: MdHint = null;
      let endHint: MdHint = null;
      this._hintChildren.forEach((hint: MdHint) => {
        if (hint.align == 'start') {
          if (startHint || this.hintLabel) {
            throw new MdInputContainerDuplicatedHintError('start');
          }
          startHint = hint;
        } else if (hint.align == 'end') {
          if (endHint) {
            throw new MdInputContainerDuplicatedHintError('end');
          }
          endHint = hint;
        }
      });
    }
  }

  /**
   * Sets the child input's `aria-describedby` to a space-separated list of the ids
   * of the currently-specified hints, as well as a generated id for the hint label.
   */
  private _syncAriaDescribedby() {
    let ids: string[] = [];
    let startHint = this._hintChildren ?
        this._hintChildren.find(hint => hint.align === 'start') : null;
    let endHint = this._hintChildren ?
        this._hintChildren.find(hint => hint.align === 'end') : null;

    if (startHint) {
      ids.push(startHint.id);
    } else if (this._hintLabel) {
      ids.push(this._hintLabelId);
    }

    if (endHint) {
      ids.push(endHint.id);
    }

    this._mdInputChild.ariaDescribedby = ids.join(' ');
  }
}
