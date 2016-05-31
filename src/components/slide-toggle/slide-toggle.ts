import {
  Component,
  ElementRef,
  Renderer,
  forwardRef,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/common';
import { BooleanFieldValue } from '@angular2-material/core/annotations/field-value';
import { Observable } from 'rxjs/Observable';

export const MD_SLIDE_TOGGLE_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MdSlideToggle),
  multi: true
};

// A simple change event emitted by the MdSlideToggle component.
export class MdSlideToggleChange {
  source: MdSlideToggle;
  checked: boolean;
}

// Increasing integer for generating unique ids for slide-toggle components.
let nextId = 0;

@Component({
  moduleId: module.id,
  selector: 'md-slide-toggle',
  host: {
    '[class.md-checked]': 'checked',
    '[class.md-disabled]': 'disabled',
    // This md-slide-toggle prefix will change, once the temporary ripple is removed.
    '[class.md-slide-toggle-focused]': '_hasFocus',
    '(click)': 'onTouched()',
    '(mousedown)': 'setMousedown()'
  },
  templateUrl: 'slide-toggle.html',
  styleUrls: ['slide-toggle.css'],
  providers: [MD_SLIDE_TOGGLE_VALUE_ACCESSOR],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MdSlideToggle implements ControlValueAccessor {

  private onChange = (_: any) => {};
  private onTouched = () => {};

  // A unique id for the slide-toggle. By default the id is auto-generated.
  private _uniqueId = `md-slide-toggle-${++nextId}`;
  private _checked: boolean = false;
  private _color: string;
  private _hasFocus: boolean = false;
  private _isMousedown: boolean = false;

  @Input() @BooleanFieldValue() disabled: boolean = false;
  @Input() name: string = null;
  @Input() id: string = this._uniqueId;
  @Input() tabIndex: number = 0;
  @Input() ariaLabel: string = null;
  @Input() ariaLabelledby: string = null;

  private _change: EventEmitter<MdSlideToggleChange> = new EventEmitter<MdSlideToggleChange>();
  @Output() change: Observable<MdSlideToggleChange> = this._change.asObservable();

  // Returns the unique id for the visual hidden input.
  getInputId = () => `${this.id || this._uniqueId}-input`;

  constructor(private _elementRef: ElementRef,
              private _renderer: Renderer) {
  }

  /**
   * The onChangeEvent method will be also called on click.
   * This is because everything for the slide-toggle is wrapped inside of a label,
   * which triggers a onChange event on click.
   * @internal
   */
  onChangeEvent(event: Event) {
    // We always have to stop propagation on the change event.
    // Otherwise the change event, from the input element, will bubble up and
    // emit its event object to the component's `change` output.
    event.stopPropagation();

    if (!this.disabled) {
      this.toggle();
    }
  }

  /** @internal */
  setMousedown() {
    // We only *show* the focus style when focus has come to the button via the keyboard.
    // The Material Design spec is silent on this topic, and without doing this, the
    // button continues to look :active after clicking.
    // @see http://marcysutton.com/button-focus-hell/
    this._isMousedown = true;
    setTimeout(() => this._isMousedown = false, 100);
  }

  /** @internal */
  onInputFocus() {
    // Only show the focus / ripple indicator when the focus was not triggered by a mouse
    // interaction on the component.
    if (!this._isMousedown) {
      this._hasFocus = true;
    }
  }

  /** @internal */
  onInputBlur() {
    this._hasFocus = false;
    this.onTouched();
  }

  /**
   * Implemented as part of ControlValueAccessor.
   * TODO: internal
   */
  writeValue(value: any): void {
    this.checked = value;
  }

  /**
   * Implemented as part of ControlValueAccessor.
   * TODO: internal
   */
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  /**
   * Implemented as part of ControlValueAccessor.
   * TODO: internal
   */
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  @Input()
  get checked() {
    return !!this._checked;
  }

  set checked(value) {
    if (this.checked !== !!value) {
      this._checked = value;
      this.onChange(this._checked);
      this._emitChangeEvent();
    }
  }

  @Input()
  get color(): string {
    return this._color;
  }

  set color(value: string) {
    this._updateColor(value);
  }

  toggle() {
    this.checked = !this.checked;
  }

  private _updateColor(newColor: string) {
    this._setElementColor(this._color, false);
    this._setElementColor(newColor, true);
    this._color = newColor;
  }

  private _setElementColor(color: string, isAdd: boolean) {
    if (color != null && color != '') {
      this._renderer.setElementClass(this._elementRef.nativeElement, `md-${color}`, isAdd);
    }
  }

  private _emitChangeEvent() {
    let event = new MdSlideToggleChange();
    event.source = this;
    event.checked = this.checked;
    this._change.emit(event);
  }

}

export const MD_SLIDE_TOGGLE_DIRECTIVES = [MdSlideToggle];
