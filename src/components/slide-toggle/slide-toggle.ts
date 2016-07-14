import {
  Component,
  ElementRef,
  Renderer,
  forwardRef,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  AfterContentInit
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import {BooleanFieldValue} from '@angular2-material/core/annotations/field-value';
import {Observable} from 'rxjs/Observable';
import {applyCssTransform} from '@angular2-material/core/style/apply-transform';

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
    '(mousedown)': '_setMousedown()'
  },
  templateUrl: 'slide-toggle.html',
  styleUrls: ['slide-toggle.css'],
  providers: [MD_SLIDE_TOGGLE_VALUE_ACCESSOR],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MdSlideToggle implements AfterContentInit, ControlValueAccessor {

  private onChange = (_: any) => {};
  private onTouched = () => {};

  // A unique id for the slide-toggle. By default the id is auto-generated.
  private _uniqueId = `md-slide-toggle-${++nextId}`;
  private _checked: boolean = false;
  private _color: string;
  private _hasFocus: boolean = false;
  private _isMousedown: boolean = false;
  private _isInitialized: boolean = false;
  private _slideRenderer: SlideToggleRenderer = null;

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

  constructor(private _elementRef: ElementRef, private _renderer: Renderer) {}

  /** TODO: internal */
  ngAfterContentInit() {
    this._slideRenderer = new SlideToggleRenderer(this._elementRef);

    // Mark this component as initialized in AfterContentInit because the initial checked value can
    // possibly be set by NgModel or the checked attribute. This would cause the change event to
    // be emitted, before the component is actually initialized.
    this._isInitialized = true;
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

      // Only fire a change event if the `slide-toggle` is completely initialized and
      // all attributes / inputs are properly loaded.
      if (this._isInitialized) {
        this._emitChangeEvent();
      }
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

  /** Emits the change event to the `change` output EventEmitter */
  private _emitChangeEvent() {
    let event = new MdSlideToggleChange();
    event.source = this;
    event.checked = this.checked;
    this._change.emit(event);
  }


  /** TODO: internal */
  _onDragStart() {
    this._slideRenderer.startThumbDrag(this.checked);
  }

  /** TODO: internal */
  _onDrag(event: HammerInput) {
    this._slideRenderer.updateThumbPosition(event.deltaX);
  }

  /** TODO: internal */
  _onDragEnd() {
    // Notice that we have to stop outside of the current event handler,
    // because otherwise the click event will be fired and will reset the new checked variable.
    setTimeout(() => {
      this.checked = this._slideRenderer.stopThumbDrag();
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
    if (!this._thumbBarWidth) {
      this._thumbBarWidth = this._thumbBarEl.clientWidth - this._thumbEl.clientWidth;
      this._checked = checked;
      this._thumbEl.classList.add('md-dragging');
    }
  }

  /** Stops the current drag and returns the new checked value. */
  stopThumbDrag(): boolean {
    if (this._thumbBarWidth) {
      this._thumbBarWidth = null;
      this._thumbEl.classList.remove('md-dragging');

      applyCssTransform(this._thumbEl, '');

      return this._percentage > 50;
    }
  }

  /** Updates the thumb containers position from the specified distance. */
  updateThumbPosition(distance: number) {
    if (this._thumbBarWidth) {
      this._percentage = this._getThumbPercentage(distance);
      applyCssTransform(this._thumbEl, `translate3d(${this._percentage}%, 0, 0)`);
    }
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

export const MD_SLIDE_TOGGLE_DIRECTIVES = [MdSlideToggle];
