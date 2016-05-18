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

// Increasing integer for generating unique ids for slide-toggle components.
let nextId = 0;

@Component({
  moduleId: module.id,
  selector: 'md-slide-toggle',
  host: {
    '[class.md-checked]': 'checked',
    '[class.md-disabled]': 'disabled',
    '(click)': 'onTouched()'
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

  @Input() @BooleanFieldValue() disabled: boolean = false;
  @Input() name: string = null;
  @Input() id: string = this._uniqueId;
  @Input() tabIndex: number = 0;
  @Input() ariaLabel: string = null;
  @Input() ariaLabelledby: string = null;

  @Output('change') private _change: EventEmitter<boolean> = new EventEmitter<boolean>();
  change: Observable<boolean> = this._change.asObservable();

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
  onChangeEvent() {
    if (!this.disabled) {
      this.toggle();
    }
  }

  /**
   * Implemented as part of ControlValueAccessor.
   * @internal
   */
  writeValue(value: any): void {
    this.checked = value;
  }

  /**
   * Implemented as part of ControlValueAccessor.
   * @internal
   */
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  /**
   * Implemented as part of ControlValueAccessor.
   * @internal
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
      this._change.emit(this._checked);
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

}
