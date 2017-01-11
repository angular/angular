import {
  Component,
  ElementRef,
  Renderer,
  forwardRef,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  AfterContentInit,
  NgModule,
  ModuleWithProviders,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
import {FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {
  applyCssTransform,
  coerceBooleanProperty,
  GestureConfig,
  HammerInput,
  DefaultStyleCompatibilityModeModule,
} from '../core';
import {Observable} from 'rxjs/Observable';


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

/**
 * Two-state control, which can be also called `switch`.
 */
@Component({
  moduleId: module.id,
  selector: 'md-slide-toggle, mat-slide-toggle',
  host: {
    '[class.md-checked]': 'checked',
    '[class.md-disabled]': 'disabled',
    // This md-slide-toggle prefix will change, once the temporary ripple is removed.
    '[class.md-slide-toggle-focused]': '_hasFocus',
    '(mousedown)': '_setMousedown()'
  },
  templateUrl: 'slide-toggle.html',
  styleUrls: ['slide-toggle.css'],
  providers: [MD_SLIDE_TOGGLE_VALUE_ACCESSOR],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MdSlideToggle implements AfterContentInit, ControlValueAccessor {

  private onChange = (_: any) => {};
  private onTouched = () => {};

  // A unique id for the slide-toggle. By default the id is auto-generated.
  private _uniqueId = `md-slide-toggle-${++nextId}`;
  private _checked: boolean = false;
  private _color: string;
  private _isMousedown: boolean = false;
  private _slideRenderer: SlideToggleRenderer = null;
  private _disabled: boolean = false;
  private _required: boolean = false;

  // Needs to be public to support AOT compilation (as host binding).
  _hasFocus: boolean = false;

  /** Name value will be applied to the input element if present */
  @Input() name: string = null;

  /** A unique id for the slide-toggle input. If none is supplied, it will be auto-generated. */
  @Input() id: string = this._uniqueId;

  /** Used to specify the tabIndex value for the underlying input element. */
  @Input() tabIndex: number = 0;

  /** Used to set the aria-label attribute on the underlying input element. */
  @Input() ariaLabel: string = null;

  /** Used to set the aria-labelledby attribute on the underlying input element. */
  @Input() ariaLabelledby: string = null;

  /** Whether the slide-toggle is disabled. */
  @Input()
  get disabled(): boolean { return this._disabled; }
  set disabled(value) { this._disabled = coerceBooleanProperty(value); }

  /** Whether the slide-toggle is required. */
  @Input()
  get required(): boolean { return this._required; }
  set required(value) { this._required = coerceBooleanProperty(value); }

  private _change: EventEmitter<MdSlideToggleChange> = new EventEmitter<MdSlideToggleChange>();
  /** An event will be dispatched each time the slide-toggle changes its value. */
  @Output() change: Observable<MdSlideToggleChange> = this._change.asObservable();

  /** Returns the unique id for the visual hidden input. */
  get inputId(): string { return `${this.id || this._uniqueId}-input`; }

  @ViewChild('input') _inputElement: ElementRef;

  constructor(private _elementRef: ElementRef, private _renderer: Renderer) {}

  ngAfterContentInit() {
    this._slideRenderer = new SlideToggleRenderer(this._elementRef);
  }

  /**
   * The onChangeEvent method will be also called on click.
   * This is because everything for the slide-toggle is wrapped inside of a label,
   * which triggers a onChange event on click.
   */
  _onChangeEvent(event: Event) {
    // We always have to stop propagation on the change event.
    // Otherwise the change event, from the input element, will bubble up and
    // emit its event object to the component's `change` output.
    event.stopPropagation();

    // Once a drag is currently in progress, we do not want to toggle the slide-toggle on a click.
    if (!this.disabled && !this._slideRenderer.isDragging()) {
      this.toggle();

      // Emit our custom change event if the native input emitted one.
      // It is important to only emit it, if the native input triggered one, because
      // we don't want to trigger a change event, when the `checked` variable changes for example.
      this._emitChangeEvent();
    }
  }

  _onInputClick(event: Event) {
    this.onTouched();

    // We have to stop propagation for click events on the visual hidden input element.
    // By default, when a user clicks on a label element, a generated click event will be
    // dispatched on the associated input element. Since we are using a label element as our
    // root container, the click event on the `slide-toggle` will be executed twice.
    // The real click event will bubble up, and the generated click event also tries to bubble up.
    // This will lead to multiple click events.
    // Preventing bubbling for the second event will solve that issue.
    event.stopPropagation();
  }

  _setMousedown() {
    // We only *show* the focus style when focus has come to the button via the keyboard.
    // The Material Design spec is silent on this topic, and without doing this, the
    // button continues to look :active after clicking.
    // @see http://marcysutton.com/button-focus-hell/
    this._isMousedown = true;
    setTimeout(() => this._isMousedown = false, 100);
  }

  _onInputFocus() {
    // Only show the focus / ripple indicator when the focus was not triggered by a mouse
    // interaction on the component.
    if (!this._isMousedown) {
      this._hasFocus = true;
    }
  }

  _onInputBlur() {
    this._hasFocus = false;
    this.onTouched();
  }

  /** Implemented as part of ControlValueAccessor. */
  writeValue(value: any): void {
    this.checked = value;
  }

  /** Implemented as part of ControlValueAccessor. */
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  /** Implemented as part of ControlValueAccessor. */
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  /** Implemented as a part of ControlValueAccessor. */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  /** Focuses the slide-toggle. */
  focus() {
    this._renderer.invokeElementMethod(this._inputElement.nativeElement, 'focus');
    this._onInputFocus();
  }

  /** Whether the slide-toggle is checked. */
  @Input()
  get checked() { return !!this._checked; }
  set checked(value) {
    if (this.checked !== !!value) {
      this._checked = value;
      this.onChange(this._checked);
    }
  }

  /** The color of the slide-toggle. Can be primary, accent, or warn. */
  @Input()
  get color(): string { return this._color; }
  set color(value: string) {
    this._updateColor(value);
  }

  /** Toggles the checked state of the slide-toggle. */
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

  /** Emits the change event to the `change` output EventEmitter */
  private _emitChangeEvent() {
    let event = new MdSlideToggleChange();
    event.source = this;
    event.checked = this.checked;
    this._change.emit(event);
  }


  _onDragStart() {
    if (!this.disabled) {
      this._slideRenderer.startThumbDrag(this.checked);
    }
  }

  _onDrag(event: HammerInput) {
    if (this._slideRenderer.isDragging()) {
      this._slideRenderer.updateThumbPosition(event.deltaX);
    }
  }

  _onDragEnd() {
    if (!this._slideRenderer.isDragging()) {
      return;
    }

    // Notice that we have to stop outside of the current event handler,
    // because otherwise the click event will be fired and will reset the new checked variable.
    setTimeout(() => {
      this.checked = this._slideRenderer.stopThumbDrag();
      this._emitChangeEvent();
    }, 0);
  }

}

/**
 * Renderer for the Slide Toggle component, which separates DOM modification in its own class
 */
class SlideToggleRenderer {

  private _thumbEl: HTMLElement;
  private _thumbBarEl: HTMLElement;
  private _thumbBarWidth: number;
  private _checked: boolean;
  private _percentage: number;

  constructor(private _elementRef: ElementRef) {
    this._thumbEl = _elementRef.nativeElement.querySelector('.md-slide-toggle-thumb-container');
    this._thumbBarEl = _elementRef.nativeElement.querySelector('.md-slide-toggle-bar');
  }

  /** Whether the slide-toggle is currently dragging. */
  isDragging(): boolean {
    return !!this._thumbBarWidth;
  }


  /** Initializes the drag of the slide-toggle. */
  startThumbDrag(checked: boolean) {
    if (!this.isDragging()) {
      this._thumbBarWidth = this._thumbBarEl.clientWidth - this._thumbEl.clientWidth;
      this._checked = checked;
      this._thumbEl.classList.add('md-dragging');
    }
  }

  /** Stops the current drag and returns the new checked value. */
  stopThumbDrag(): boolean {
    if (this.isDragging()) {
      this._thumbBarWidth = null;
      this._thumbEl.classList.remove('md-dragging');

      applyCssTransform(this._thumbEl, '');

      return this._percentage > 50;
    }
  }

  /** Updates the thumb containers position from the specified distance. */
  updateThumbPosition(distance: number) {
    this._percentage = this._getThumbPercentage(distance);
    applyCssTransform(this._thumbEl, `translate3d(${this._percentage}%, 0, 0)`);
  }

  /** Retrieves the percentage of thumb from the moved distance. */
  private _getThumbPercentage(distance: number) {
    let percentage = (distance / this._thumbBarWidth) * 100;

    // When the toggle was initially checked, then we have to start the drag at the end.
    if (this._checked) {
      percentage += 100;
    }

    return Math.max(0, Math.min(percentage, 100));
  }

}


@NgModule({
  imports: [FormsModule, DefaultStyleCompatibilityModeModule],
  exports: [MdSlideToggle, DefaultStyleCompatibilityModeModule],
  declarations: [MdSlideToggle],
  providers: [{provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig}],
})
export class MdSlideToggleModule {
  /** @deprecated */
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdSlideToggleModule,
      providers: []
    };
  }
}
