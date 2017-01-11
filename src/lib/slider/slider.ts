import {
  NgModule,
  ModuleWithProviders,
  Component,
  ElementRef,
  Input,
  Output,
  ViewEncapsulation,
  forwardRef,
  EventEmitter,
  Optional
} from '@angular/core';
import {NG_VALUE_ACCESSOR, ControlValueAccessor, FormsModule} from '@angular/forms';
import {HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
import {
  GestureConfig,
  HammerInput,
  coerceBooleanProperty,
  coerceNumberProperty,
  DefaultStyleCompatibilityModeModule,
} from '../core';
import {Dir} from '../core/rtl/dir';
import {CommonModule} from '@angular/common';
import {
  PAGE_UP,
  PAGE_DOWN,
  END,
  HOME,
  LEFT_ARROW,
  UP_ARROW,
  RIGHT_ARROW,
  DOWN_ARROW,
} from '../core/keyboard/keycodes';

/**
 * Visually, a 30px separation between tick marks looks best. This is very subjective but it is
 * the default separation we chose.
 */
const MIN_AUTO_TICK_SEPARATION = 30;

/**
 * Provider Expression that allows md-slider to register as a ControlValueAccessor.
 * This allows it to support [(ngModel)] and [formControl].
 */
export const MD_SLIDER_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MdSlider),
  multi: true
};

/** A simple change event emitted by the MdSlider component. */
export class MdSliderChange {
  source: MdSlider;
  value: number;
}

/**
 * Allows users to select from a range of values by moving the slider thumb. It is similar in
 * behavior to the native `<input type="range">` element.
 */
@Component({
  moduleId: module.id,
  selector: 'md-slider, mat-slider',
  providers: [MD_SLIDER_VALUE_ACCESSOR],
  host: {
    '(blur)': '_onBlur()',
    '(click)': '_onClick($event)',
    '(keydown)': '_onKeydown($event)',
    '(mouseenter)': '_onMouseenter()',
    '(slide)': '_onSlide($event)',
    '(slideend)': '_onSlideEnd()',
    '(slidestart)': '_onSlideStart($event)',
    'role': 'slider',
    'tabindex': '0',
    '[attr.aria-disabled]': 'disabled',
    '[attr.aria-valuemax]': 'max',
    '[attr.aria-valuemin]': 'min',
    '[attr.aria-valuenow]': 'value',
    '[class.md-slider-active]': '_isActive',
    '[class.md-slider-disabled]': 'disabled',
    '[class.md-slider-has-ticks]': 'tickInterval',
    '[class.md-slider-horizontal]': '!vertical',
    '[class.md-slider-axis-inverted]': 'invertAxis',
    '[class.md-slider-sliding]': '_isSliding',
    '[class.md-slider-thumb-label-showing]': 'thumbLabel',
    '[class.md-slider-vertical]': 'vertical',
  },
  templateUrl: 'slider.html',
  styleUrls: ['slider.css'],
  encapsulation: ViewEncapsulation.None,
})
export class MdSlider implements ControlValueAccessor {
  /** A renderer to handle updating the slider's thumb and fill track. */
  private _renderer: SliderRenderer = null;

  /** The dimensions of the slider. */
  private _sliderDimensions: ClientRect = null;

  private _disabled: boolean = false;

  /** Whether or not the slider is disabled. */
  @Input()
  get disabled(): boolean { return this._disabled; }
  set disabled(value) { this._disabled = coerceBooleanProperty(value); }

  private _thumbLabel: boolean = false;

  /** Whether or not to show the thumb label. */
  @Input('thumbLabel')
  get thumbLabel(): boolean { return this._thumbLabel; }
  set thumbLabel(value) { this._thumbLabel = coerceBooleanProperty(value); }

  /** @deprecated */
  @Input('thumb-label')
  get _thumbLabelDeprecated(): boolean { return this._thumbLabel; }
  set _thumbLabelDeprecated(value) { this._thumbLabel = value; }

  private _controlValueAccessorChangeFn: (value: any) => void = () => {};

  /** The last values for which a change or input event was emitted. */
  private _lastChangeValue: number = null;
  private _lastInputValue: number = null;

  /** onTouch function registered via registerOnTouch (ControlValueAccessor). */
  onTouched: () => any = () => {};

  /**
   * Whether or not the thumb is sliding.
   * Used to determine if there should be a transition for the thumb and fill track.
   */
  _isSliding: boolean = false;

  /**
   * Whether or not the slider is active (clicked or sliding).
   * Used to shrink and grow the thumb as according to the Material Design spec.
   */
  _isActive: boolean = false;

  private _step: number = 1;

  /** The values at which the thumb will snap. */
  @Input()
  get step() { return this._step; }
  set step(v) { this._step = coerceNumberProperty(v, this._step); }

  private _tickInterval: 'auto' | number = 0;

  /**
   * How often to show ticks. Relative to the step so that a tick always appears on a step.
   * Ex: Tick interval of 4 with a step of 3 will draw a tick every 4 steps (every 12 values).
   */
  @Input()
  get tickInterval() { return this._tickInterval; }
  set tickInterval(v) {
    this._tickInterval = (v == 'auto') ? v : coerceNumberProperty(v, <number>this._tickInterval);
  }

  /** @deprecated */
  @Input('tick-interval')
  get _tickIntervalDeprecated() { return this.tickInterval; }
  set _tickIntervalDeprecated(v) { this.tickInterval = v; }

  private _tickIntervalPercent: number = 0;

  /** The size of a tick interval as a percentage of the size of the track. */
  get tickIntervalPercent() { return this._tickIntervalPercent; }

  private _percent: number = 0;

  /** The percentage of the slider that coincides with the value. */
  get percent() { return this._clamp(this._percent); }

  private _value: number = null;

  /** Value of the slider. */
  @Input()
  get value() {
    // If the value needs to be read and it is still uninitialized, initialize it to the min.
    if (this._value === null) {
      this.value = this._min;
    }
    return this._value;
  }
  set value(v: number) {
    this._value = coerceNumberProperty(v, this._value);
    this._percent = this._calculatePercentage(this._value);
  }

  private _min: number = 0;

  /** The minimum value that the slider can have. */
  @Input()
  get min() {
    return this._min;
  }
  set min(v: number) {
    this._min = coerceNumberProperty(v, this._min);

    // If the value wasn't explicitly set by the user, set it to the min.
    if (this._value === null) {
      this.value = this._min;
    }
    this._percent = this._calculatePercentage(this.value);
  }

  private _max: number = 100;

  /** The maximum value that the slider can have. */
  @Input()
  get max() {
    return this._max;
  }
  set max(v: number) {
    this._max = coerceNumberProperty(v, this._max);
    this._percent = this._calculatePercentage(this.value);
  }

  /** Whether the slider is inverted. */
  @Input()
  get invert() { return this._invert; }
  set invert(value: any) { this._invert = coerceBooleanProperty(value); }
  private _invert = false;

  /** Whether the slider is vertical. */
  @Input()
  get vertical() { return this._vertical; }
  set vertical(value: any) { this._vertical = coerceBooleanProperty(value); }
  private _vertical = false;

  /**
   * Whether the axis of the slider is inverted.
   * (i.e. whether moving the thumb in the positive x or y direction decreases the slider's value).
   */
  get invertAxis() {
    // Standard non-inverted mode for a vertical slider should be dragging the thumb from bottom to
    // top. However from a y-axis standpoint this is inverted.
    return this.vertical ? !this.invert : this.invert;
  }

  /**
   * Whether mouse events should be converted to a slider position by calculating their distance
   * from the right or bottom edge of the slider as opposed to the top or left.
   */
  get invertMouseCoords() {
    return (this.direction == 'rtl' && !this.vertical) ? !this.invertAxis : this.invertAxis;
  }

  /** CSS styles for the track fill element. */
  get trackFillStyles(): { [key: string]: string } {
    let axis = this.vertical ? 'Y' : 'X';
    return {
      'transform': `scale${axis}(${this.percent})`
    };
  }

  /** CSS styles for the ticks container element. */
  get ticksContainerStyles(): { [key: string]: string } {
    let axis = this.vertical ? 'Y' : 'X';
    // For a horizontal slider in RTL languages we push the ticks container off the left edge
    // instead of the right edge to avoid causing a horizontal scrollbar to appear.
    let sign = !this.vertical && this.direction == 'rtl' ? '' : '-';
    let offset = this.tickIntervalPercent / 2 * 100;
    return {
      'transform': `translate${axis}(${sign}${offset}%)`
    };
  }

  /** CSS styles for the ticks element. */
  get ticksStyles(): { [key: string]: string } {
    let tickSize = this.tickIntervalPercent * 100;
    let backgroundSize = this.vertical ? `2px ${tickSize}%` : `${tickSize}% 2px`;
    let axis = this.vertical ? 'Y' : 'X';
    // Depending on the direction we pushed the ticks container, push the ticks the opposite
    // direction to re-center them but clip off the end edge. In RTL languages we need to flip the
    // ticks 180 degrees so we're really cutting off the end edge abd not the start.
    let sign = !this.vertical && this.direction == 'rtl' ? '-' : '';
    let rotate = !this.vertical && this.direction == 'rtl' ? ' rotate(180deg)' : '';
    return {
      'backgroundSize': backgroundSize,
      // Without translateZ ticks sometimes jitter as the slider moves on Chrome & Firefox.
      'transform': `translateZ(0) translate${axis}(${sign}${tickSize / 2}%)${rotate}`
    };
  }

  get thumbContainerStyles(): { [key: string]: string } {
    let axis = this.vertical ? 'Y' : 'X';
    // For a horizontal slider in RTL languages we push the thumb container off the left edge
    // instead of the right edge to avoid causing a horizontal scrollbar to appear.
    let invertOffset =
        (this.direction == 'rtl' && !this.vertical) ? !this.invertAxis : this.invertAxis;
    let offset = (invertOffset ? this.percent : 1 - this.percent) * 100;
    return {
      'transform': `translate${axis}(-${offset}%)`
    };
  }

  /** The language direction for this slider element. */
  get direction() {
    return (this._dir && this._dir.value == 'rtl') ? 'rtl' : 'ltr';
  }

  /** Event emitted when the slider value has changed. */
  @Output() change = new EventEmitter<MdSliderChange>();

  /** Event emitted when the slider thumb moves. */
  @Output() input = new EventEmitter<MdSliderChange>();

  constructor(@Optional() private _dir: Dir, elementRef: ElementRef) {
    this._renderer = new SliderRenderer(elementRef);
  }

  _onMouseenter() {
    if (this.disabled) {
      return;
    }

    // We save the dimensions of the slider here so we can use them to update the spacing of the
    // ticks and determine where on the slider click and slide events happen.
    this._sliderDimensions = this._renderer.getSliderDimensions();
    this._updateTickIntervalPercent();
  }

  _onClick(event: MouseEvent) {
    if (this.disabled) {
      return;
    }

    this._isActive = true;
    this._isSliding = false;
    this._renderer.addFocus();
    this._updateValueFromPosition({x: event.clientX, y: event.clientY});

    /* Emits a change and input event if the value changed. */
    this._emitInputEvent();
    this._emitValueIfChanged();
  }

  _onSlide(event: HammerInput) {
    if (this.disabled) {
      return;
    }

    // Prevent the slide from selecting anything else.
    event.preventDefault();
    this._updateValueFromPosition({x: event.center.x, y: event.center.y});

    // Native range elements always emit `input` events when the value changed while sliding.
    this._emitInputEvent();
  }

  _onSlideStart(event: HammerInput) {
    if (this.disabled) {
      return;
    }

    // Simulate mouseenter in case this is a mobile device.
    this._onMouseenter();

    event.preventDefault();
    this._isSliding = true;
    this._isActive = true;
    this._renderer.addFocus();
    this._updateValueFromPosition({x: event.center.x, y: event.center.y});
  }

  _onSlideEnd() {
    this._isSliding = false;
    this._emitValueIfChanged();
  }

  _onBlur() {
    this._isActive = false;
    this.onTouched();
  }

  _onKeydown(event: KeyboardEvent) {
    if (this.disabled) { return; }

    switch (event.keyCode) {
      case PAGE_UP:
        this._increment(10);
        break;
      case PAGE_DOWN:
        this._increment(-10);
        break;
      case END:
        this.value = this.max;
        break;
      case HOME:
        this.value = this.min;
        break;
      case LEFT_ARROW:
        // NOTE: For a sighted user it would make more sense that when they press an arrow key on an
        // inverted slider the thumb moves in that direction. However for a blind user, nothing
        // about the slider indicates that it is inverted. They will expect left to be decrement,
        // regardless of how it appears on the screen. For speakers ofRTL languages, they probably
        // expect left to mean increment. Therefore we flip the meaning of the side arrow keys for
        // RTL. For inverted sliders we prefer a good a11y experience to having it "look right" for
        // sighted users, therefore we do not swap the meaning.
        this._increment(this.direction == 'rtl' ? 1 : -1);
        break;
      case UP_ARROW:
        this._increment(1);
        break;
      case RIGHT_ARROW:
        // See comment on LEFT_ARROW about the conditions under which we flip the meaning.
        this._increment(this.direction == 'rtl' ? -1 : 1);
        break;
      case DOWN_ARROW:
        this._increment(-1);
        break;
      default:
        // Return if the key is not one that we explicitly handle to avoid calling preventDefault on
        // it.
        return;
    }

    event.preventDefault();
  }

  /** Increments the slider by the given number of steps (negative number decrements). */
  private _increment(numSteps: number) {
    this.value = this._clamp(this.value + this.step * numSteps, this.min, this.max);
  }

  /** Calculate the new value from the new physical location. The value will always be snapped. */
  private _updateValueFromPosition(pos: {x: number, y: number}) {
    if (!this._sliderDimensions) {
      return;
    }

    let offset = this.vertical ? this._sliderDimensions.top : this._sliderDimensions.left;
    let size = this.vertical ? this._sliderDimensions.height : this._sliderDimensions.width;
    let posComponent = this.vertical ? pos.y : pos.x;

    // The exact value is calculated from the event and used to find the closest snap value.
    let percent = this._clamp((posComponent - offset) / size);
    if (this.invertMouseCoords) {
      percent = 1 - percent;
    }
    let exactValue = this._calculateValue(percent);

    // This calculation finds the closest step by finding the closest whole number divisible by the
    // step relative to the min.
    let closestValue = Math.round((exactValue - this.min) / this.step) * this.step + this.min;
    // The value needs to snap to the min and max.
    this.value = this._clamp(closestValue, this.min, this.max);
  }

  /** Emits a change event if the current value is different from the last emitted value. */
  private _emitValueIfChanged() {
    if (this.value != this._lastChangeValue) {
      let event = this._createChangeEvent();
      this._lastChangeValue = this.value;
      this._controlValueAccessorChangeFn(this.value);
      this.change.emit(event);
    }
  }

  /** Emits an input event when the current value is different from the last emitted value. */
  private _emitInputEvent() {
    if (this.value != this._lastInputValue) {
      let event = this._createChangeEvent();
      this._lastInputValue = this.value;
      this.input.emit(event);
    }
  }

  /** Updates the amount of space between ticks as a percentage of the width of the slider. */
  private _updateTickIntervalPercent() {
    if (!this.tickInterval) {
      return;
    }

    if (this.tickInterval == 'auto') {
      let trackSize = this.vertical ? this._sliderDimensions.height : this._sliderDimensions.width;
      let pixelsPerStep = trackSize * this.step / (this.max - this.min);
      let stepsPerTick = Math.ceil(MIN_AUTO_TICK_SEPARATION / pixelsPerStep);
      let pixelsPerTick = stepsPerTick * this.step;
      this._tickIntervalPercent = pixelsPerTick / trackSize;
    } else {
      this._tickIntervalPercent = this.tickInterval * this.step / (this.max - this.min);
    }
  }

  /** Creates a slider change object from the specified value. */
  private _createChangeEvent(value = this.value): MdSliderChange {
    let event = new MdSliderChange();

    event.source = this;
    event.value = value;

    return event;
  }

  /** Calculates the percentage of the slider that a value is. */
  private _calculatePercentage(value: number) {
    return (value - this.min) / (this.max - this.min);
  }

  /** Calculates the value a percentage of the slider corresponds to. */
  private _calculateValue(percentage: number) {
    return this.min + percentage * (this.max - this.min);
  }

  /** Return a number between two numbers. */
  private _clamp(value: number, min = 0, max = 1) {
    return Math.max(min, Math.min(value, max));
  }

  /**
   * Sets the model value. Implemented as part of ControlValueAccessor.
   * @param value
   */
  writeValue(value: any) {
    this.value = value;
  }

  /**
   * Registers a callback to eb triggered when the value has changed.
   * Implemented as part of ControlValueAccessor.
   * @param fn Callback to be registered.
   */
  registerOnChange(fn: (value: any) => void) {
    this._controlValueAccessorChangeFn = fn;
  }

  /**
   * Registers a callback to be triggered when the component is touched.
   * Implemented as part of ControlValueAccessor.
   * @param fn Callback to be registered.
   */
  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  /**
   * Sets whether the component should be disabled.
   * Implemented as part of ControlValueAccessor.
   * @param isDisabled
   */
  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }
}

/**
 * Renderer class in order to keep all dom manipulation in one place and outside of the main class.
 * @docs-private
 */
export class SliderRenderer {
  private _sliderElement: HTMLElement;

  constructor(elementRef: ElementRef) {
    this._sliderElement = elementRef.nativeElement;
  }

  /**
   * Get the bounding client rect of the slider track element.
   * The track is used rather than the native element to ignore the extra space that the thumb can
   * take up.
   */
  getSliderDimensions() {
    let trackElement = this._sliderElement.querySelector('.md-slider-track');
    return trackElement.getBoundingClientRect();
  }

  /**
   * Focuses the native element.
   * Currently only used to allow a blur event to fire but will be used with keyboard input later.
   */
  addFocus() {
    this._sliderElement.focus();
  }
}


@NgModule({
  imports: [CommonModule, FormsModule, DefaultStyleCompatibilityModeModule],
  exports: [MdSlider, DefaultStyleCompatibilityModeModule],
  declarations: [MdSlider],
  providers: [{provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig}]
})
export class MdSliderModule {
  /** @deprecated */
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdSliderModule,
      providers: []
    };
  }
}
