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
import {MdGestureConfig, coerceBooleanProperty, coerceNumberProperty} from '../core';
import {Input as HammerInput} from 'hammerjs';
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
  DOWN_ARROW
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

@Component({
  moduleId: module.id,
  selector: 'md-slider',
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
    '[class.md-slider-inverted]': 'invert',
    '[class.md-slider-sliding]': '_isSliding',
    '[class.md-slider-thumb-label-showing]': 'thumbLabel',
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

  /** Whether or not the slider is disabled. */
  private _disabled: boolean = false;

  @Input()
  get disabled(): boolean { return this._disabled; }
  set disabled(value) { this._disabled = coerceBooleanProperty(value); }

  /** Whether or not to show the thumb label. */
  private _thumbLabel: boolean = false;

  @Input('thumb-label')
  get thumbLabel(): boolean { return this._thumbLabel; }
  set thumbLabel(value) { this._thumbLabel = coerceBooleanProperty(value); }

  private _controlValueAccessorChangeFn: (value: any) => void = () => {};

  /** The last value for which a change event was emitted. */
  private _lastEmittedValue: number = null;

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

  /** The values at which the thumb will snap. */
  private _step: number = 1;

  @Input()
  get step() { return this._step; }
  set step(v) { this._step = coerceNumberProperty(v, this._step); }

  /**
   * How often to show ticks. Relative to the step so that a tick always appears on a step.
   * Ex: Tick interval of 4 with a step of 3 will draw a tick every 4 steps (every 12 values).
   */
  private _tickInterval: 'auto' | number = 0;

  @Input('tick-interval')
  get tickInterval() { return this._tickInterval; }
  set tickInterval(v) {
    this._tickInterval = (v == 'auto') ? v : coerceNumberProperty(v, <number>this._tickInterval);
  }

  /** The size of a tick interval as a percentage of the size of the track. */
  private _tickIntervalPercent: number = 0;

  get tickIntervalPercent() { return this._tickIntervalPercent; }

  /** The percentage of the slider that coincides with the value. */
  private _percent: number = 0;

  get percent() { return this._clamp(this._percent); }

  /** Value of the slider. */
  private _value: number = null;

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

  /** The miniumum value that the slider can have. */
  private _min: number = 0;

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

  /** The maximum value that the slider can have. */
  private _max: number = 100;

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
  set invert(value: boolean) { this._invert = coerceBooleanProperty(value); }
  private _invert = false;

  /** CSS styles for the track fill element. */
  get trackFillStyles(): { [key: string]: string } {
    return {
      'flexBasis': `${this.percent * 100}%`
    };
  }

  /** CSS styles for the ticks container element. */
  get ticksContainerStyles(): { [key: string]: string } {
    return {
      'marginLeft': `${this.direction == 'rtl' ? '' : '-'}${this.tickIntervalPercent / 2 * 100}%`
    };
  }

  /** CSS styles for the ticks element. */
  get ticksStyles() {
    let styles: { [key: string]: string } = {
      'backgroundSize': `${this.tickIntervalPercent * 100}% 2px`
    };
    if (this.direction == 'rtl') {
      styles['marginRight'] = `-${this.tickIntervalPercent / 2 * 100}%`;
    } else {
      styles['marginLeft'] = `${this.tickIntervalPercent / 2 * 100}%`;
    }
    return styles;
  }

  /** The language direction for this slider element. */
  get direction() {
    return (this._dir && this._dir.value == 'rtl') ? 'rtl' : 'ltr';
  }

  @Output() change = new EventEmitter<MdSliderChange>();

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
    this._updateValueFromPosition(event.clientX);
    this._emitValueIfChanged();
  }

  _onSlide(event: HammerInput) {
    if (this.disabled) {
      return;
    }

    // Prevent the slide from selecting anything else.
    event.preventDefault();
    this._updateValueFromPosition(event.center.x);
  }

  _onSlideStart(event: HammerInput) {
    if (this.disabled) {
      return;
    }

    event.preventDefault();
    this._isSliding = true;
    this._isActive = true;
    this._renderer.addFocus();
    this._updateValueFromPosition(event.center.x);
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
        this._increment(this._isLeftMin() ? -1 : 1);
        break;
      case UP_ARROW:
        this._increment(1);
        break;
      case RIGHT_ARROW:
        this._increment(this._isLeftMin() ? 1 : -1);
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

  /** Whether the left side of the slider is the minimum value. */
  private _isLeftMin() {
    return (this.direction == 'rtl') == this.invert;
  }

  /** Increments the slider by the given number of steps (negative number decrements). */
  private _increment(numSteps: number) {
    this.value = this._clamp(this.value + this.step * numSteps, this.min, this.max);
  }

  /**
   * Calculate the new value from the new physical location. The value will always be snapped.
   */
  private _updateValueFromPosition(pos: number) {
    if (!this._sliderDimensions) {
      return;
    }

    let offset = this._sliderDimensions.left;
    let size = this._sliderDimensions.width;

    // The exact value is calculated from the event and used to find the closest snap value.
    let percent = this._clamp((pos - offset) / size);
    if (!this._isLeftMin()) {
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
    if (this.value != this._lastEmittedValue) {
      let event = new MdSliderChange();
      event.source = this;
      event.value = this.value;
      this._lastEmittedValue = this.value;
      this._controlValueAccessorChangeFn(this.value);
      this.change.emit(event);
    }
  }

  /**
   * Updates the amount of space between ticks as a percentage of the width of the slider.
   */
  private _updateTickIntervalPercent() {
    if (!this.tickInterval) {
      return;
    }

    if (this.tickInterval == 'auto') {
      let pixelsPerStep = this._sliderDimensions.width * this.step / (this.max - this.min);
      let stepsPerTick = Math.ceil(MIN_AUTO_TICK_SEPARATION / pixelsPerStep);
      let pixelsPerTick = stepsPerTick * this.step;
      this._tickIntervalPercent = pixelsPerTick / (this._sliderDimensions.width);
    } else {
      this._tickIntervalPercent = this.tickInterval * this.step / (this.max - this.min);
    }
  }

  /**
   * Calculates the percentage of the slider that a value is.
   */
  private _calculatePercentage(value: number) {
    return (value - this.min) / (this.max - this.min);
  }

  /**
   * Calculates the value a percentage of the slider corresponds to.
   */
  private _calculateValue(percentage: number) {
    return this.min + percentage * (this.max - this.min);
  }

  /**
   * Return a number between two numbers.
   */
  private _clamp(value: number, min = 0, max = 1) {
    return Math.max(min, Math.min(value, max));
  }

  /**
   * Implemented as part of ControlValueAccessor.
   */
  writeValue(value: any) {
    this.value = value;
  }

  /**
   * Implemented as part of ControlValueAccessor.
   */
  registerOnChange(fn: (value: any) => void) {
    this._controlValueAccessorChangeFn = fn;
  }

  /**
   * Implemented as part of ControlValueAccessor.
   */
  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  /**
   * Implemented as part of ControlValueAccessor.
   */
  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }
}

/**
 * Renderer class in order to keep all dom manipulation in one place and outside of the main class.
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
  imports: [CommonModule, FormsModule],
  exports: [MdSlider],
  declarations: [MdSlider],
  providers: [
    {provide: HAMMER_GESTURE_CONFIG, useClass: MdGestureConfig},
  ],
})
export class MdSliderModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdSliderModule,
      providers: [{provide: HAMMER_GESTURE_CONFIG, useClass: MdGestureConfig}]
    };
  }
}
