/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directionality} from '@angular/cdk/bidi';
import {coerceBooleanProperty, coerceNumberProperty} from '@angular/cdk/coercion';
import {
  DOWN_ARROW,
  END,
  HOME,
  LEFT_ARROW,
  PAGE_DOWN,
  PAGE_UP,
  RIGHT_ARROW,
  UP_ARROW,
} from '@angular/cdk/keycodes';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  Renderer2,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {
  CanColor,
  CanDisable,
  HammerInput,
  mixinColor,
  mixinDisabled,
} from '@angular/material/core';
import {FocusOrigin, FocusMonitor} from '@angular/cdk/a11y';
import {Subscription} from 'rxjs/Subscription';

/**
 * Visually, a 30px separation between tick marks looks best. This is very subjective but it is
 * the default separation we chose.
 */
const MIN_AUTO_TICK_SEPARATION = 30;

/** The thumb gap size for a disabled slider. */
const DISABLED_THUMB_GAP = 7;

/** The thumb gap size for a non-active slider at its minimum value. */
const MIN_VALUE_NONACTIVE_THUMB_GAP = 7;

/** The thumb gap size for an active slider at its minimum value. */
const MIN_VALUE_ACTIVE_THUMB_GAP = 10;

/**
 * Provider Expression that allows mat-slider to register as a ControlValueAccessor.
 * This allows it to support [(ngModel)] and [formControl].
 */
export const MAT_SLIDER_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MatSlider),
  multi: true
};

/** A simple change event emitted by the MatSlider component. */
export class MatSliderChange {
  /** The MatSlider that changed. */
  source: MatSlider;

  /** The new value of the source slider. */
  value: number | null;
}


// Boilerplate for applying mixins to MatSlider.
/** @docs-private */
export class MatSliderBase {
  constructor(public _renderer: Renderer2, public _elementRef: ElementRef) {}
}
export const _MatSliderMixinBase = mixinColor(mixinDisabled(MatSliderBase), 'accent');

/**
 * Allows users to select from a range of values by moving the slider thumb. It is similar in
 * behavior to the native `<input type="range">` element.
 */
@Component({
  moduleId: module.id,
  selector: 'mat-slider',
  providers: [MAT_SLIDER_VALUE_ACCESSOR],
  host: {
    '(focus)': '_onFocus()',
    '(blur)': '_onBlur()',
    '(click)': '_onClick($event)',
    '(keydown)': '_onKeydown($event)',
    '(keyup)': '_onKeyup()',
    '(mouseenter)': '_onMouseenter()',
    '(slide)': '_onSlide($event)',
    '(slideend)': '_onSlideEnd()',
    '(slidestart)': '_onSlideStart($event)',
    'class': 'mat-slider',
    'role': 'slider',
    'tabindex': '0',
    '[attr.aria-disabled]': 'disabled',
    '[attr.aria-valuemax]': 'max',
    '[attr.aria-valuemin]': 'min',
    '[attr.aria-valuenow]': 'value',
    '[attr.aria-orientation]': 'vertical ? "vertical" : "horizontal"',
    '[class.mat-slider-disabled]': 'disabled',
    '[class.mat-slider-has-ticks]': 'tickInterval',
    '[class.mat-slider-horizontal]': '!vertical',
    '[class.mat-slider-axis-inverted]': '_invertAxis',
    '[class.mat-slider-sliding]': '_isSliding',
    '[class.mat-slider-thumb-label-showing]': 'thumbLabel',
    '[class.mat-slider-vertical]': 'vertical',
    '[class.mat-slider-min-value]': '_isMinValue',
    '[class.mat-slider-hide-last-tick]': 'disabled || _isMinValue && _thumbGap && _invertAxis',
  },
  templateUrl: 'slider.html',
  styleUrls: ['slider.css'],
  inputs: ['disabled', 'color'],
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatSlider extends _MatSliderMixinBase
    implements ControlValueAccessor, OnDestroy, CanDisable, CanColor, OnInit {
  /** Whether the slider is inverted. */
  @Input()
  get invert() { return this._invert; }
  set invert(value: any) {
    this._invert = coerceBooleanProperty(value);
  }
  private _invert = false;

  /** The maximum value that the slider can have. */
  @Input()
  get max() { return this._max; }
  set max(v: number) {
    this._max = coerceNumberProperty(v, this._max);
    this._percent = this._calculatePercentage(this._value);

    // Since this also modifies the percentage, we need to let the change detection know.
    this._changeDetectorRef.markForCheck();
  }
  private _max: number = 100;

  /** The minimum value that the slider can have. */
  @Input()
  get min() { return this._min; }
  set min(v: number) {
    this._min = coerceNumberProperty(v, this._min);

    // If the value wasn't explicitly set by the user, set it to the min.
    if (this._value === null) {
      this.value = this._min;
    }
    this._percent = this._calculatePercentage(this._value);

    // Since this also modifies the percentage, we need to let the change detection know.
    this._changeDetectorRef.markForCheck();
  }
  private _min: number = 0;

  /** The values at which the thumb will snap. */
  @Input()
  get step() { return this._step; }
  set step(v) {
    this._step = coerceNumberProperty(v, this._step);

    if (this._step % 1 !== 0) {
      this._roundLabelTo = this._step.toString().split('.').pop()!.length;
    }

    // Since this could modify the label, we need to notify the change detection.
    this._changeDetectorRef.markForCheck();
  }
  private _step: number = 1;

  /** Whether or not to show the thumb label. */
  @Input()
  get thumbLabel(): boolean { return this._thumbLabel; }
  set thumbLabel(value) { this._thumbLabel = coerceBooleanProperty(value); }
  private _thumbLabel: boolean = false;

  /** @deprecated */
  @Input('thumb-label')
  get _thumbLabelDeprecated(): boolean { return this._thumbLabel; }
  set _thumbLabelDeprecated(value) { this._thumbLabel = value; }

  /**
   * How often to show ticks. Relative to the step so that a tick always appears on a step.
   * Ex: Tick interval of 4 with a step of 3 will draw a tick every 4 steps (every 12 values).
   */
  @Input()
  get tickInterval() { return this._tickInterval; }
  set tickInterval(value) {
    if (value === 'auto') {
      this._tickInterval = 'auto';
    } else if (typeof value === 'number' || typeof value === 'string') {
      this._tickInterval = coerceNumberProperty(value, this._tickInterval as number);
    } else {
      this._tickInterval = 0;
    }
  }
  private _tickInterval: 'auto' | number = 0;

  /** @deprecated */
  @Input('tick-interval')
  get _tickIntervalDeprecated() { return this.tickInterval; }
  set _tickIntervalDeprecated(v) { this.tickInterval = v; }

  /** Value of the slider. */
  @Input()
  get value() {
    // If the value needs to be read and it is still uninitialized, initialize it to the min.
    if (this._value === null) {
      this.value = this._min;
    }
    return this._value;
  }
  set value(v: number | null) {
    if (v !== this._value) {
      this._value = coerceNumberProperty(v, this._value || 0);
      this._percent = this._calculatePercentage(this._value);

      // Since this also modifies the percentage, we need to let the change detection know.
      this._changeDetectorRef.markForCheck();
    }
  }
  private _value: number | null = null;

  /** Whether the slider is vertical. */
  @Input()
  get vertical() { return this._vertical; }
  set vertical(value: any) {
    this._vertical = coerceBooleanProperty(value);
  }
  private _vertical = false;

  /** Event emitted when the slider value has changed. */
  @Output() change = new EventEmitter<MatSliderChange>();

  /** Event emitted when the slider thumb moves. */
  @Output() input = new EventEmitter<MatSliderChange>();

  /** The value to be used for display purposes. */
  get displayValue(): string | number {
    // Note that this could be improved further by rounding something like 0.999 to 1 or
    // 0.899 to 0.9, however it is very performance sensitive, because it gets called on
    // every change detection cycle.
    if (this._roundLabelTo && this.value && this.value % 1 !== 0) {
      return this.value.toFixed(this._roundLabelTo);
    }

    return this.value || 0;
  }

  /** onTouch function registered via registerOnTouch (ControlValueAccessor). */
  onTouched: () => any = () => {};

  /** The percentage of the slider that coincides with the value. */
  get percent() { return this._clamp(this._percent); }
  private _percent: number = 0;

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

  /**
   * Whether the axis of the slider is inverted.
   * (i.e. whether moving the thumb in the positive x or y direction decreases the slider's value).
   */
  get _invertAxis() {
    // Standard non-inverted mode for a vertical slider should be dragging the thumb from bottom to
    // top. However from a y-axis standpoint this is inverted.
    return this.vertical ? !this.invert : this.invert;
  }


  /** Whether the slider is at its minimum value. */
  get _isMinValue() {
    return this.percent === 0;
  }

  /**
   * The amount of space to leave between the slider thumb and the track fill & track background
   * elements.
   */
  get _thumbGap() {
    if (this.disabled) {
      return DISABLED_THUMB_GAP;
    }
    if (this._isMinValue && !this.thumbLabel) {
      return this._isActive ? MIN_VALUE_ACTIVE_THUMB_GAP : MIN_VALUE_NONACTIVE_THUMB_GAP;
    }
    return 0;
  }

  /** CSS styles for the track background element. */
  get _trackBackgroundStyles(): { [key: string]: string } {
    let axis = this.vertical ? 'Y' : 'X';
    let sign = this._invertMouseCoords ? '-' : '';
    return {
      'transform': `translate${axis}(${sign}${this._thumbGap}px) scale${axis}(${1 - this.percent})`
    };
  }

  /** CSS styles for the track fill element. */
  get _trackFillStyles(): { [key: string]: string } {
    let axis = this.vertical ? 'Y' : 'X';
    let sign = this._invertMouseCoords ? '' : '-';
    return {
      'transform': `translate${axis}(${sign}${this._thumbGap}px) scale${axis}(${this.percent})`
    };
  }

  /** CSS styles for the ticks container element. */
  get _ticksContainerStyles(): { [key: string]: string } {
    let axis = this.vertical ? 'Y' : 'X';
    // For a horizontal slider in RTL languages we push the ticks container off the left edge
    // instead of the right edge to avoid causing a horizontal scrollbar to appear.
    let sign = !this.vertical && this._direction == 'rtl' ? '' : '-';
    let offset = this._tickIntervalPercent / 2 * 100;
    return {
      'transform': `translate${axis}(${sign}${offset}%)`
    };
  }

  /** CSS styles for the ticks element. */
  get _ticksStyles(): { [key: string]: string } {
    let tickSize = this._tickIntervalPercent * 100;
    let backgroundSize = this.vertical ? `2px ${tickSize}%` : `${tickSize}% 2px`;
    let axis = this.vertical ? 'Y' : 'X';
    // Depending on the direction we pushed the ticks container, push the ticks the opposite
    // direction to re-center them but clip off the end edge. In RTL languages we need to flip the
    // ticks 180 degrees so we're really cutting off the end edge abd not the start.
    let sign = !this.vertical && this._direction == 'rtl' ? '-' : '';
    let rotate = !this.vertical && this._direction == 'rtl' ? ' rotate(180deg)' : '';
    let styles: { [key: string]: string } = {
      'backgroundSize': backgroundSize,
      // Without translateZ ticks sometimes jitter as the slider moves on Chrome & Firefox.
      'transform': `translateZ(0) translate${axis}(${sign}${tickSize / 2}%)${rotate}`
    };

    if (this._isMinValue && this._thumbGap) {
      let side = this.vertical ?
          (this._invertAxis ? 'Bottom' : 'Top') :
          (this._invertAxis ? 'Right' : 'Left');
      styles[`padding${side}`] = `${this._thumbGap}px`;
    }

    return styles;
  }

  get _thumbContainerStyles(): { [key: string]: string } {
    let axis = this.vertical ? 'Y' : 'X';
    // For a horizontal slider in RTL languages we push the thumb container off the left edge
    // instead of the right edge to avoid causing a horizontal scrollbar to appear.
    let invertOffset =
        (this._direction == 'rtl' && !this.vertical) ? !this._invertAxis : this._invertAxis;
    let offset = (invertOffset ? this.percent : 1 - this.percent) * 100;
    return {
      'transform': `translate${axis}(-${offset}%)`
    };
  }

  /** The size of a tick interval as a percentage of the size of the track. */
  private _tickIntervalPercent: number = 0;

  /** The dimensions of the slider. */
  private _sliderDimensions: ClientRect | null = null;

  private _controlValueAccessorChangeFn: (value: any) => void = () => {};

  /** Decimal places to round to, based on the step amount. */
  private _roundLabelTo: number;

  /** Subscription to the Directionality change EventEmitter. */
  private _dirChangeSubscription = Subscription.EMPTY;

  /** The value of the slider when the slide start event fires. */
  private _valueOnSlideStart: number | null;

  /** Reference to the inner slider wrapper element. */
  @ViewChild('sliderWrapper') private _sliderWrapper: ElementRef;

  /**
   * Whether mouse events should be converted to a slider position by calculating their distance
   * from the right or bottom edge of the slider as opposed to the top or left.
   */
  private get _invertMouseCoords() {
    return (this._direction == 'rtl' && !this.vertical) ? !this._invertAxis : this._invertAxis;
  }

  /** The language direction for this slider element. */
  private get _direction() {
    return (this._dir && this._dir.value == 'rtl') ? 'rtl' : 'ltr';
  }

  constructor(renderer: Renderer2,
              elementRef: ElementRef,
              private _focusMonitor: FocusMonitor,
              private _changeDetectorRef: ChangeDetectorRef,
              @Optional() private _dir: Directionality) {
    super(renderer, elementRef);
  }

  ngOnInit() {
    this._focusMonitor
        .monitor(this._elementRef.nativeElement, this._renderer, true)
        .subscribe((origin: FocusOrigin) => {
          this._isActive = !!origin && origin !== 'keyboard';
          this._changeDetectorRef.detectChanges();
        });
    if (this._dir) {
      this._dirChangeSubscription = this._dir.change.subscribe(() => {
        this._changeDetectorRef.markForCheck();
      });
    }
  }

  ngOnDestroy() {
    this._focusMonitor.stopMonitoring(this._elementRef.nativeElement);
    this._dirChangeSubscription.unsubscribe();
  }

  _onMouseenter() {
    if (this.disabled) {
      return;
    }

    // We save the dimensions of the slider here so we can use them to update the spacing of the
    // ticks and determine where on the slider click and slide events happen.
    this._sliderDimensions = this._getSliderDimensions();
    this._updateTickIntervalPercent();
  }

  _onClick(event: MouseEvent) {
    if (this.disabled) {
      return;
    }

    let oldValue = this.value;
    this._isSliding = false;
    this._focusHostElement();
    this._updateValueFromPosition({x: event.clientX, y: event.clientY});

    /* Emit a change and input event if the value changed. */
    if (oldValue != this.value) {
      this._emitInputEvent();
      this._emitChangeEvent();
    }
  }

  _onSlide(event: HammerInput) {
    if (this.disabled) {
      return;
    }

    // The slide start event sometimes fails to fire on iOS, so if we're not already in the sliding
    // state, call the slide start handler manually.
    if (!this._isSliding) {
      this._onSlideStart(null);
    }

    // Prevent the slide from selecting anything else.
    event.preventDefault();

    let oldValue = this.value;
    this._updateValueFromPosition({x: event.center.x, y: event.center.y});

    // Native range elements always emit `input` events when the value changed while sliding.
    if (oldValue != this.value) {
      this._emitInputEvent();
    }
  }

  _onSlideStart(event: HammerInput | null) {
    if (this.disabled || this._isSliding) {
      return;
    }

    // Simulate mouseenter in case this is a mobile device.
    this._onMouseenter();

    this._isSliding = true;
    this._focusHostElement();
    this._valueOnSlideStart = this.value;

    if (event) {
      this._updateValueFromPosition({x: event.center.x, y: event.center.y});
      event.preventDefault();
    }
  }

  _onSlideEnd() {
    this._isSliding = false;

    if (this._valueOnSlideStart != this.value) {
      this._emitChangeEvent();
    }
    this._valueOnSlideStart = null;
  }

  _onFocus() {
    // We save the dimensions of the slider here so we can use them to update the spacing of the
    // ticks and determine where on the slider click and slide events happen.
    this._sliderDimensions = this._getSliderDimensions();
    this._updateTickIntervalPercent();
  }

  _onBlur() {
    this.onTouched();
  }

  _onKeydown(event: KeyboardEvent) {
    if (this.disabled) { return; }

    let oldValue = this.value;

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
        this._increment(this._direction == 'rtl' ? 1 : -1);
        break;
      case UP_ARROW:
        this._increment(1);
        break;
      case RIGHT_ARROW:
        // See comment on LEFT_ARROW about the conditions under which we flip the meaning.
        this._increment(this._direction == 'rtl' ? -1 : 1);
        break;
      case DOWN_ARROW:
        this._increment(-1);
        break;
      default:
        // Return if the key is not one that we explicitly handle to avoid calling preventDefault on
        // it.
        return;
    }

    if (oldValue != this.value) {
      this._emitInputEvent();
      this._emitChangeEvent();
    }

    this._isSliding = true;
    event.preventDefault();
  }

  _onKeyup() {
    this._isSliding = false;
  }

  /** Increments the slider by the given number of steps (negative number decrements). */
  private _increment(numSteps: number) {
    this.value = this._clamp((this.value || 0) + this.step * numSteps, this.min, this.max);
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
    if (this._invertMouseCoords) {
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
  private _emitChangeEvent() {
    this._controlValueAccessorChangeFn(this.value);
    this.change.emit(this._createChangeEvent());
  }

  /** Emits an input event when the current value is different from the last emitted value. */
  private _emitInputEvent() {
    this.input.emit(this._createChangeEvent());
  }

  /** Updates the amount of space between ticks as a percentage of the width of the slider. */
  private _updateTickIntervalPercent() {
    if (!this.tickInterval || !this._sliderDimensions) {
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
  private _createChangeEvent(value = this.value): MatSliderChange {
    let event = new MatSliderChange();

    event.source = this;
    event.value = value;

    return event;
  }

  /** Calculates the percentage of the slider that a value is. */
  private _calculatePercentage(value: number | null) {
    return ((value || 0) - this.min) / (this.max - this.min);
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
   * Get the bounding client rect of the slider track element.
   * The track is used rather than the native element to ignore the extra space that the thumb can
   * take up.
   */
  private _getSliderDimensions() {
    return this._sliderWrapper ? this._sliderWrapper.nativeElement.getBoundingClientRect() : null;
  }

  /**
   * Focuses the native element.
   * Currently only used to allow a blur event to fire but will be used with keyboard input later.
   */
  private _focusHostElement() {
    this._elementRef.nativeElement.focus();
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
