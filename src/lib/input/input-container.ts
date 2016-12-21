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
    'class': 'md-hint',
    '[class.md-right]': 'align == "end"',
  }
})
export class MdHint {
  // Whether to align the hint label at the start or end of the line.
  @Input() align: 'start' | 'end' = 'start';
}


/** The input directive, used to mark the input that `MdInputContainer` is wrapping. */
@Directive({
  selector: 'input[md-input], textarea[md-input], input[mat-input], textarea[mat-input]',
  host: {
    'class': 'md-input-element',
    '[id]': 'id',
    '(blur)': '_onBlur()',
    '(focus)': '_onFocus()',
    '(input)': '_onInput()',
  }
})
export class MdInputDirective implements AfterContentInit {
  /** Whether the element is disabled. */
  @Input()
  get disabled() { return this._disabled; }
  set disabled(value: any) { this._disabled = coerceBooleanProperty(value); }
  private _disabled = false;

  /** Unique id of the element. */
  @Input()
  get id() { return this._id; };
  set id(value: string) { this._id = value || this._uid; }
  private _id: string;

  /** Placeholder attribute of the element. */
  @Input()
  get placeholder() { return this._placeholder; }
  set placeholder(value: string) {
    if (this._placeholder != value) {
      this._placeholder = value;
      this._placeholderChange.emit(this._placeholder);
    }
  }
  private _placeholder = '';

  /** Whether the element is required. */
  @Input()
  get required() { return this._required; }
  set required(value: any) { this._required = coerceBooleanProperty(value); }
  private _required = false;

  /** Input type of the element. */
  @Input()
  get type() { return this._type; }
  set type(value: string) {
    this._type = value || 'text';
    this._validateType();
  }
  private _type = 'text';

  /** The element's value. */
  value: any;

  /**
   * Emits an event when the placeholder changes so that the `md-input-container` can re-validate.
   */
  @Output() _placeholderChange = new EventEmitter<string>();

  get empty() { return (this.value == null || this.value === '') && !this._isNeverEmpty(); }

  focused = false;

  private get _uid() { return this._cachedUid = this._cachedUid || `md-input-${nextUniqueId++}`; }
  private _cachedUid: string;

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

    if (this._ngControl && this._ngControl.valueChanges) {
      this._ngControl.valueChanges.subscribe((value) => {
        this.value = value;
      });
    }
  }

  ngAfterContentInit() {
    this.value = this._elementRef.nativeElement.value;
  }

  /** Focuses the input element. */
  focus() { this._renderer.invokeElementMethod(this._elementRef.nativeElement, 'focus'); }

  _onFocus() { this.focused = true; }

  _onBlur() { this.focused = false; }

  _onInput() { this.value = this._elementRef.nativeElement.value; }

  /** Make sure the input is a supported type. */
  private _validateType() {
    if (MD_INPUT_INVALID_TYPES.indexOf(this._type) != -1) {
      throw new MdInputContainerUnsupportedTypeError(this._type);
    }
  }

  private _isNeverEmpty() { return this._neverEmptyInputTypes.indexOf(this._type) != -1; }
}


/**
 * Component that represents a text input. It encapsulates the <input> HTMLElement and
 * improve on its behaviour, along with styling it according to the Material Design.
 */
@Component({
  moduleId: module.id,
  selector: 'md-input-container, mat-input-container',
  templateUrl: 'input-container.html',
  styleUrls: ['input.css', 'input-container.css'],
  host: {
    // Remove align attribute to prevent it from interfering with layout.
    '[attr.align]': 'null',
    '[class.ng-untouched]': '_isUntouched()',
    '[class.ng-touched]': '_isTouched()',
    '[class.ng-pristine]': '_isPristine()',
    '[class.ng-dirty]': '_isDirty()',
    '[class.ng-valid]': '_isValid()',
    '[class.ng-invalid]': '_isInvalid()',
    '[class.ng-pending]': '_isPending()',
    '(click)': '_focusInput()',
  },
  encapsulation: ViewEncapsulation.None,
})
export class MdInputContainer implements AfterContentInit {
  /** Alignment of the input container's content. */
  @Input() align: 'start' | 'end' = 'start';

  /** Color of the input divider, based on the theme. */
  @Input() dividerColor: 'primary' | 'accent' | 'warn' = 'primary';

  /** Text for the input hint. */
  @Input()
  get hintLabel() { return this._hintLabel; }
  set hintLabel(value: string) {
    this._hintLabel = value;
    this._validateHints();
  }
  private _hintLabel = '';

  /** Text or the floating placeholder. */
  @Input()
  get floatingPlaceholder(): boolean { return this._floatingPlaceholder; }
  set floatingPlaceholder(value) { this._floatingPlaceholder = coerceBooleanProperty(value); }
  private _floatingPlaceholder: boolean = true;

  @ContentChild(MdInputDirective) _mdInputChild: MdInputDirective;

  @ContentChild(MdPlaceholder) _placeholderChild: MdPlaceholder;

  @ContentChildren(MdHint) _hintChildren: QueryList<MdHint>;

  ngAfterContentInit() {
    if (!this._mdInputChild) {
      throw new MdInputContainerMissingMdInputError();
    }

    this._validateHints();
    this._validatePlaceholders();

    // Re-validate when things change.
    this._hintChildren.changes.subscribe(() => {
      this._validateHints();
    });
    this._mdInputChild._placeholderChange.subscribe(() => {
      this._validatePlaceholders();
    });
  }

  _isUntouched() { return this._hasNgControl() && this._mdInputChild._ngControl.untouched; }

  _isTouched() { return this._hasNgControl() && this._mdInputChild._ngControl.touched; }

  _isPristine() { return this._hasNgControl() && this._mdInputChild._ngControl.pristine; }

  _isDirty() { return this._hasNgControl() && this._mdInputChild._ngControl.dirty; }

  _isValid() { return this._hasNgControl() && this._mdInputChild._ngControl.valid; }

  _isInvalid() { return this._hasNgControl() && this._mdInputChild._ngControl.invalid; }

  _isPending() { return this._hasNgControl() && this._mdInputChild._ngControl.pending; }

  /** Whether the input has a placeholder. */
  _hasPlaceholder() { return !!(this._mdInputChild.placeholder || this._placeholderChild); }

  _focusInput() { this._mdInputChild.focus(); }

  private _hasNgControl() { return !!(this._mdInputChild && this._mdInputChild._ngControl); }

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
}
