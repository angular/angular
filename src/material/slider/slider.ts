/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directionality} from '@angular/cdk/bidi';
import {
  BooleanInput,
  coerceBooleanProperty,
  coerceNumberProperty,
  NumberInput,
} from '@angular/cdk/coercion';
import {Platform, normalizePassiveListenerOptions} from '@angular/cdk/platform';
import {DOCUMENT} from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  Directive,
  ElementRef,
  EventEmitter,
  forwardRef,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
  ViewEncapsulation,
} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {
  CanDisableRipple,
  MatRipple,
  MAT_RIPPLE_GLOBAL_OPTIONS,
  mixinColor,
  mixinDisableRipple,
  RippleAnimationConfig,
  RippleGlobalOptions,
  RippleRef,
  RippleState,
} from '@angular/material/core';
import {ANIMATION_MODULE_TYPE} from '@angular/platform-browser/animations';
import {SpecificEventListener, EventType} from '@material/base';
import {MDCSliderAdapter} from '@material/slider/adapter';
import {MDCSliderFoundation} from '@material/slider/foundation';
import {Thumb, TickMark} from '@material/slider/types';
import {Subscription} from 'rxjs';
import {GlobalChangeAndInputListener} from './global-change-and-input-listener';

/** Options used to bind passive event listeners. */
const passiveEventListenerOptions = normalizePassiveListenerOptions({passive: true});

/** Represents a drag event emitted by the MatSlider component. */
export interface MatSliderDragEvent {
  /** The MatSliderThumb that was interacted with. */
  source: MatSliderThumb;

  /** The MatSlider that was interacted with. */
  parent: MatSlider;

  /** The current value of the slider. */
  value: number;
}

/**
 * The visual slider thumb.
 *
 * Handles the slider thumb ripple states (hover, focus, and active),
 * and displaying the value tooltip on discrete sliders.
 * @docs-private
 */
@Component({
  selector: 'mat-slider-visual-thumb',
  templateUrl: './slider-thumb.html',
  styleUrls: ['slider-thumb.css'],
  host: {
    'class': 'mdc-slider__thumb mat-mdc-slider-visual-thumb',

    // NOTE: This class is used internally.
    // TODO(wagnermaciel): Remove this once it is handled by the mdc foundation (cl/388828896).
    '[class.mdc-slider__thumb--short-value]': '_isShortValue()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MatSliderVisualThumb implements AfterViewInit, OnDestroy {
  /** Whether the slider displays a numeric value label upon pressing the thumb. */
  @Input() discrete: boolean;

  /** Indicates which slider thumb this input corresponds to. */
  @Input() thumbPosition: Thumb;

  /** The display value of the slider thumb. */
  @Input() valueIndicatorText: string;

  /** Whether ripples on the slider thumb should be disabled. */
  @Input() disableRipple: boolean = false;

  /** The MatRipple for this slider thumb. */
  @ViewChild(MatRipple) private readonly _ripple: MatRipple;

  /** The slider thumb knob. */
  @ViewChild('knob') _knob: ElementRef<HTMLElement>;

  /** The slider thumb value indicator container. */
  @ViewChild('valueIndicatorContainer')
  _valueIndicatorContainer: ElementRef<HTMLElement>;

  /** The slider input corresponding to this slider thumb. */
  private _sliderInput: MatSliderThumb;

  /** The RippleRef for the slider thumbs hover state. */
  private _hoverRippleRef: RippleRef | undefined;

  /** The RippleRef for the slider thumbs focus state. */
  private _focusRippleRef: RippleRef | undefined;

  /** The RippleRef for the slider thumbs active state. */
  private _activeRippleRef: RippleRef | undefined;

  /** Whether the slider thumb is currently being pressed. */
  readonly _isActive = false;

  /** Whether the slider thumb is currently being hovered. */
  private _isHovered: boolean = false;

  constructor(
    private readonly _ngZone: NgZone,
    @Inject(forwardRef(() => MatSlider)) private readonly _slider: MatSlider,
    private readonly _elementRef: ElementRef<HTMLElement>,
  ) {}

  ngAfterViewInit() {
    this._ripple.radius = 24;
    this._sliderInput = this._slider._getInput(this.thumbPosition);

    // Note that we don't unsubscribe from these, because they're complete on destroy.
    this._sliderInput.dragStart.subscribe(event => this._onDragStart(event));
    this._sliderInput.dragEnd.subscribe(event => this._onDragEnd(event));

    this._sliderInput._focus.subscribe(() => this._onFocus());
    this._sliderInput._blur.subscribe(() => this._onBlur());

    // These two listeners don't update any data bindings so we bind them
    // outside of the NgZone to prevent Angular from needlessly running change detection.
    this._ngZone.runOutsideAngular(() => {
      this._elementRef.nativeElement.addEventListener('mouseenter', this._onMouseEnter);
      this._elementRef.nativeElement.addEventListener('mouseleave', this._onMouseLeave);
    });
  }

  ngOnDestroy() {
    this._elementRef.nativeElement.removeEventListener('mouseenter', this._onMouseEnter);
    this._elementRef.nativeElement.removeEventListener('mouseleave', this._onMouseLeave);
  }

  /** Used to append a class to indicate when the value indicator text is short. */
  _isShortValue(): boolean {
    return this.valueIndicatorText?.length <= 2;
  }

  private _onMouseEnter = (): void => {
    this._isHovered = true;
    // We don't want to show the hover ripple on top of the focus ripple.
    // This can happen if the user tabs to a thumb and then the user moves their cursor over it.
    if (!this._isShowingRipple(this._focusRippleRef)) {
      this._showHoverRipple();
    }
  };

  private _onMouseLeave = (): void => {
    this._isHovered = false;
    this._hoverRippleRef?.fadeOut();
  };

  private _onFocus(): void {
    // We don't want to show the hover ripple on top of the focus ripple.
    // Happen when the users cursor is over a thumb and then the user tabs to it.
    this._hoverRippleRef?.fadeOut();
    this._showFocusRipple();
  }

  private _onBlur(): void {
    // Happens when the user tabs away while still dragging a thumb.
    if (!this._isActive) {
      this._focusRippleRef?.fadeOut();
    }
    // Happens when the user tabs away from a thumb but their cursor is still over it.
    if (this._isHovered) {
      this._showHoverRipple();
    }
  }

  private _onDragStart(event: MatSliderDragEvent): void {
    if (event.source._thumbPosition === this.thumbPosition) {
      (this as {_isActive: boolean})._isActive = true;
      this._showActiveRipple();
    }
  }

  private _onDragEnd(event: MatSliderDragEvent): void {
    if (event.source._thumbPosition === this.thumbPosition) {
      (this as {_isActive: boolean})._isActive = false;
      this._activeRippleRef?.fadeOut();
      // Happens when the user starts dragging a thumb, tabs away, and then stops dragging.
      if (!this._sliderInput._isFocused()) {
        this._focusRippleRef?.fadeOut();
      }
    }
  }

  /** Handles displaying the hover ripple. */
  private _showHoverRipple(): void {
    if (!this._isShowingRipple(this._hoverRippleRef)) {
      this._hoverRippleRef = this._showRipple({enterDuration: 0, exitDuration: 0});
      this._hoverRippleRef?.element.classList.add('mat-mdc-slider-hover-ripple');
    }
  }

  /** Handles displaying the focus ripple. */
  private _showFocusRipple(): void {
    // Show the focus ripple event if noop animations are enabled.
    if (!this._isShowingRipple(this._focusRippleRef)) {
      this._focusRippleRef = this._showRipple({enterDuration: 0, exitDuration: 0});
      this._focusRippleRef?.element.classList.add('mat-mdc-slider-focus-ripple');
    }
  }

  /** Handles displaying the active ripple. */
  private _showActiveRipple(): void {
    if (!this._isShowingRipple(this._activeRippleRef)) {
      this._activeRippleRef = this._showRipple({enterDuration: 225, exitDuration: 400});
      this._activeRippleRef?.element.classList.add('mat-mdc-slider-active-ripple');
    }
  }

  /** Whether the given rippleRef is currently fading in or visible. */
  private _isShowingRipple(rippleRef?: RippleRef): boolean {
    return rippleRef?.state === RippleState.FADING_IN || rippleRef?.state === RippleState.VISIBLE;
  }

  /** Manually launches the slider thumb ripple using the specified ripple animation config. */
  private _showRipple(animation: RippleAnimationConfig): RippleRef | undefined {
    if (this.disableRipple) {
      return;
    }
    return this._ripple.launch({
      animation: this._slider._noopAnimations ? {enterDuration: 0, exitDuration: 0} : animation,
      centered: true,
      persistent: true,
    });
  }

  /** Gets the hosts native HTML element. */
  _getHostElement(): HTMLElement {
    return this._elementRef.nativeElement;
  }

  /** Gets the native HTML element of the slider thumb knob. */
  _getKnob(): HTMLElement {
    return this._knob.nativeElement;
  }

  /**
   * Gets the native HTML element of the slider thumb value indicator
   * container.
   */
  _getValueIndicatorContainer(): HTMLElement {
    return this._valueIndicatorContainer.nativeElement;
  }
}

/**
 * Directive that adds slider-specific behaviors to an input element inside `<mat-slider>`.
 * Up to two may be placed inside of a `<mat-slider>`.
 *
 * If one is used, the selector `matSliderThumb` must be used, and the outcome will be a normal
 * slider. If two are used, the selectors `matSliderStartThumb` and `matSliderEndThumb` must be
 * used, and the outcome will be a range slider with two slider thumbs.
 */
@Directive({
  selector: 'input[matSliderThumb], input[matSliderStartThumb], input[matSliderEndThumb]',
  exportAs: 'matSliderThumb',
  host: {
    'class': 'mdc-slider__input',
    'type': 'range',
    '(blur)': '_onBlur()',
    '(focus)': '_focus.emit()',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: MatSliderThumb,
      multi: true,
    },
  ],
})
export class MatSliderThumb implements AfterViewInit, ControlValueAccessor, OnInit, OnDestroy {
  // ** IMPORTANT NOTE **
  //
  // The way `value` is implemented for MatSliderThumb doesn't follow typical Angular conventions.
  // Normally we would define a private variable `_value` as the source of truth for the value of
  // the slider thumb input. The source of truth for the value of the slider inputs has already
  // been decided for us by MDC to be the value attribute on the slider thumb inputs. This is
  // because the MDC foundation and adapter expect that the value attribute is the source of truth
  // for the slider inputs.
  //
  // Also, note that the value attribute is completely disconnected from the value property.

  /** The current value of this slider input. */
  @Input()
  get value(): number {
    return coerceNumberProperty(this._hostElement.getAttribute('value'));
  }
  set value(v: NumberInput) {
    const value = coerceNumberProperty(v);

    // If the foundation has already been initialized, we need to
    // relay any value updates to it so that it can update the UI.
    if (this._slider._initialized) {
      this._slider._setValue(value, this._thumbPosition);
    } else {
      // Setup for the MDC foundation.
      this._hostElement.setAttribute('value', `${value}`);
    }
  }

  /**
   * Emits when the raw value of the slider changes. This is here primarily
   * to facilitate the two-way binding for the `value` input.
   * @docs-private
   */
  @Output() readonly valueChange: EventEmitter<number> = new EventEmitter<number>();

  /** Event emitted when the slider thumb starts being dragged. */
  @Output() readonly dragStart: EventEmitter<MatSliderDragEvent> =
    new EventEmitter<MatSliderDragEvent>();

  /** Event emitted when the slider thumb stops being dragged. */
  @Output() readonly dragEnd: EventEmitter<MatSliderDragEvent> =
    new EventEmitter<MatSliderDragEvent>();

  /** Event emitted every time the MatSliderThumb is blurred. */
  @Output() readonly _blur: EventEmitter<void> = new EventEmitter<void>();

  /** Event emitted every time the MatSliderThumb is focused. */
  @Output() readonly _focus: EventEmitter<void> = new EventEmitter<void>();

  /**
   * Used to determine the disabled state of the MatSlider (ControlValueAccessor).
   * For ranged sliders, the disabled state of the MatSlider depends on the combined state of the
   * start and end inputs. See MatSlider._updateDisabled.
   */
  _disabled: boolean = false;

  /**
   * A callback function that is called when the
   * control's value changes in the UI (ControlValueAccessor).
   */
  _onChange: (value: any) => void = () => {};

  /**
   * A callback function that is called by the forms API on
   * initialization to update the form model on blur (ControlValueAccessor).
   */
  private _onTouched: () => void = () => {};

  /** Indicates which slider thumb this input corresponds to. */
  _thumbPosition: Thumb = this._elementRef.nativeElement.hasAttribute('matSliderStartThumb')
    ? Thumb.START
    : Thumb.END;

  /** The injected document if available or fallback to the global document reference. */
  private _document: Document;

  /** The host native HTML input element. */
  _hostElement: HTMLInputElement;

  constructor(
    @Inject(DOCUMENT) document: any,
    @Inject(forwardRef(() => MatSlider)) private readonly _slider: MatSlider,
    private readonly _elementRef: ElementRef<HTMLInputElement>,
  ) {
    this._document = document;
    this._hostElement = _elementRef.nativeElement;
  }

  ngOnInit() {
    // By calling this in ngOnInit() we guarantee that the sibling sliders initial value by
    // has already been set by the time we reach ngAfterViewInit().
    this._initializeInputValueAttribute();
    this._initializeAriaValueText();
  }

  ngAfterViewInit() {
    this._initializeInputState();
    this._initializeInputValueProperty();

    // Setup for the MDC foundation.
    if (this._slider.disabled) {
      this._hostElement.disabled = true;
    }
  }

  ngOnDestroy() {
    this.dragStart.complete();
    this.dragEnd.complete();
    this._focus.complete();
    this._blur.complete();
    this.valueChange.complete();
  }

  _onBlur(): void {
    this._onTouched();
    this._blur.emit();
  }

  _emitFakeEvent(type: 'change' | 'input') {
    const event = new Event(type) as any;
    event._matIsHandled = true;
    this._hostElement.dispatchEvent(event);
  }

  /**
   * Sets the model value. Implemented as part of ControlValueAccessor.
   * @param value
   */
  writeValue(value: any): void {
    this.value = value;
  }

  /**
   * Registers a callback to be triggered when the value has changed.
   * Implemented as part of ControlValueAccessor.
   * @param fn Callback to be registered.
   */
  registerOnChange(fn: any): void {
    this._onChange = fn;
  }

  /**
   * Registers a callback to be triggered when the component is touched.
   * Implemented as part of ControlValueAccessor.
   * @param fn Callback to be registered.
   */
  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  /**
   * Sets whether the component should be disabled.
   * Implemented as part of ControlValueAccessor.
   * @param isDisabled
   */
  setDisabledState(isDisabled: boolean): void {
    this._disabled = isDisabled;
    this._slider._updateDisabled();
  }

  focus(): void {
    this._hostElement.focus();
  }

  blur(): void {
    this._hostElement.blur();
  }

  /** Returns true if this slider input currently has focus. */
  _isFocused(): boolean {
    return this._document.activeElement === this._hostElement;
  }

  /**
   * Sets the min, max, and step properties on the slider thumb input.
   *
   * Must be called AFTER the sibling slider thumb input is guaranteed to have had its value
   * attribute value set. For a range slider, the min and max of the slider thumb input depends on
   * the value of its sibling slider thumb inputs value.
   *
   * Must be called BEFORE the value property is set. In the case where the min and max have not
   * yet been set and we are setting the input value property to a value outside of the native
   * inputs default min or max. The value property would not be set to our desired value, but
   * instead be capped at either the default min or max.
   *
   */
  _initializeInputState(): void {
    const min = this._hostElement.hasAttribute('matSliderEndThumb')
      ? this._slider._getInput(Thumb.START).value
      : this._slider.min;
    const max = this._hostElement.hasAttribute('matSliderStartThumb')
      ? this._slider._getInput(Thumb.END).value
      : this._slider.max;
    this._hostElement.min = `${min}`;
    this._hostElement.max = `${max}`;
    this._hostElement.step = `${this._slider.step}`;
  }

  /**
   * Sets the value property on the slider thumb input.
   *
   * Must be called AFTER the min and max have been set. In the case where the min and max have not
   * yet been set and we are setting the input value property to a value outside of the native
   * inputs default min or max. The value property would not be set to our desired value, but
   * instead be capped at either the default min or max.
   */
  private _initializeInputValueProperty(): void {
    this._hostElement.value = `${this.value}`;
  }

  /**
   * Ensures the value attribute is initialized.
   *
   * Must be called BEFORE the min and max are set. For a range slider, the min and max of the
   * slider thumb input depends on the value of its sibling slider thumb inputs value.
   */
  private _initializeInputValueAttribute(): void {
    // Only set the default value if an initial value has not already been provided.
    if (!this._hostElement.hasAttribute('value')) {
      this.value = this._hostElement.hasAttribute('matSliderEndThumb')
        ? this._slider.max
        : this._slider.min;
    }
  }

  /**
   * Initializes the aria-valuetext attribute.
   *
   * Must be called AFTER the value attribute is set. This is because the slider's parent
   * `displayWith` function is used to set the `aria-valuetext` attribute.
   */
  private _initializeAriaValueText(): void {
    this._hostElement.setAttribute('aria-valuetext', this._slider.displayWith(this.value));
  }
}

// Boilerplate for applying mixins to MatSlider.
const _MatSliderMixinBase = mixinColor(
  mixinDisableRipple(
    class {
      constructor(public _elementRef: ElementRef<HTMLElement>) {}
    },
  ),
  'primary',
);

/**
 * Allows users to select from a range of values by moving the slider thumb. It is similar in
 * behavior to the native `<input type="range">` element.
 */
@Component({
  selector: 'mat-slider',
  templateUrl: 'slider.html',
  styleUrls: ['slider.css'],
  host: {
    'class': 'mat-mdc-slider mdc-slider',
    '[class.mdc-slider--range]': '_isRange()',
    '[class.mdc-slider--disabled]': 'disabled',
    '[class.mdc-slider--discrete]': 'discrete',
    '[class.mdc-slider--tick-marks]': 'showTickMarks',
    '[class._mat-animation-noopable]': '_noopAnimations',
  },
  exportAs: 'matSlider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  inputs: ['color', 'disableRipple'],
})
export class MatSlider
  extends _MatSliderMixinBase
  implements AfterViewInit, CanDisableRipple, OnDestroy
{
  /** The slider thumb(s). */
  @ViewChildren(MatSliderVisualThumb) _thumbs: QueryList<MatSliderVisualThumb>;

  /** The active section of the slider track. */
  @ViewChild('trackActive') _trackActive: ElementRef<HTMLElement>;

  /** The sliders hidden range input(s). */
  @ContentChildren(MatSliderThumb, {descendants: false})
  _inputs: QueryList<MatSliderThumb>;

  /** Whether the slider is disabled. */
  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(v: BooleanInput) {
    this._setDisabled(coerceBooleanProperty(v));
    this._updateInputsDisabledState();
  }
  private _disabled: boolean = false;

  /** Whether the slider displays a numeric value label upon pressing the thumb. */
  @Input()
  get discrete(): boolean {
    return this._discrete;
  }
  set discrete(v: BooleanInput) {
    this._discrete = coerceBooleanProperty(v);
  }
  private _discrete: boolean = false;

  /** Whether the slider displays tick marks along the slider track. */
  @Input()
  get showTickMarks(): boolean {
    return this._showTickMarks;
  }
  set showTickMarks(v: BooleanInput) {
    this._showTickMarks = coerceBooleanProperty(v);
  }
  private _showTickMarks: boolean = false;

  /** The minimum value that the slider can have. */
  @Input()
  get min(): number {
    return this._min;
  }
  set min(v: NumberInput) {
    this._min = coerceNumberProperty(v, this._min);
    this._reinitialize();
  }
  private _min: number = 0;

  /** The maximum value that the slider can have. */
  @Input()
  get max(): number {
    return this._max;
  }
  set max(v: NumberInput) {
    this._max = coerceNumberProperty(v, this._max);
    this._reinitialize();
  }
  private _max: number = 100;

  /** The values at which the thumb will snap. */
  @Input()
  get step(): number {
    return this._step;
  }
  set step(v: NumberInput) {
    this._step = coerceNumberProperty(v, this._step);
    this._reinitialize();
  }
  private _step: number = 1;

  /**
   * Function that will be used to format the value before it is displayed
   * in the thumb label. Can be used to format very large number in order
   * for them to fit into the slider thumb.
   */
  @Input() displayWith: (value: number) => string = (value: number) => `${value}`;

  /** Instance of the MDC slider foundation for this slider. */
  private _foundation = new MDCSliderFoundation(new SliderAdapter(this));

  /** Whether the foundation has been initialized. */
  _initialized: boolean = false;

  /** The injected document if available or fallback to the global document reference. */
  _document: Document;

  /**
   * The defaultView of the injected document if
   * available or fallback to global window reference.
   */
  _window: Window;

  /** Used to keep track of & render the active & inactive tick marks on the slider track. */
  _tickMarks: TickMark[];

  /** The display value of the start thumb. */
  _startValueIndicatorText: string;

  /** The display value of the end thumb. */
  _endValueIndicatorText: string;

  /** Whether animations have been disabled. */
  _noopAnimations: boolean;

  /**
   * Whether the browser supports pointer events.
   *
   * We exclude iOS to mirror the MDC Foundation. The MDC Foundation cannot use pointer events on
   * iOS because of this open bug - https://bugs.webkit.org/show_bug.cgi?id=220196.
   */
  private _SUPPORTS_POINTER_EVENTS =
    typeof PointerEvent !== 'undefined' && !!PointerEvent && !this._platform.IOS;

  /** Subscription to changes to the directionality (LTR / RTL) context for the application. */
  private _dirChangeSubscription: Subscription;

  /** Observer used to monitor size changes in the slider. */
  private _resizeObserver: ResizeObserver | null;

  /** Timeout used to debounce resize listeners. */
  private _resizeTimer: number;

  /** Cached dimensions of the host element. */
  private _cachedHostRect: DOMRect | null;

  constructor(
    readonly _ngZone: NgZone,
    readonly _cdr: ChangeDetectorRef,
    elementRef: ElementRef<HTMLElement>,
    private readonly _platform: Platform,
    readonly _globalChangeAndInputListener: GlobalChangeAndInputListener<'input' | 'change'>,
    @Inject(DOCUMENT) document: any,
    @Optional() private _dir: Directionality,
    @Optional()
    @Inject(MAT_RIPPLE_GLOBAL_OPTIONS)
    readonly _globalRippleOptions?: RippleGlobalOptions,
    @Optional() @Inject(ANIMATION_MODULE_TYPE) animationMode?: string,
  ) {
    super(elementRef);
    this._document = document;
    this._window = this._document.defaultView || window;
    this._noopAnimations = animationMode === 'NoopAnimations';
    this._dirChangeSubscription = this._dir.change.subscribe(() => this._onDirChange());
    this._attachUISyncEventListener();
  }

  ngAfterViewInit() {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      _validateThumbs(this._isRange(), this._getThumb(Thumb.START), this._getThumb(Thumb.END));
      _validateInputs(
        this._isRange(),
        this._getInputElement(Thumb.START),
        this._getInputElement(Thumb.END),
      );
    }
    if (this._platform.isBrowser) {
      this._foundation.init();
      this._foundation.layout();
      this._initialized = true;
      this._observeHostResize();
    }
    // The MDC foundation requires access to the view and content children of the MatSlider. In
    // order to access the view and content children of MatSlider we need to wait until change
    // detection runs and materializes them. That is why we call init() and layout() in
    // ngAfterViewInit().
    //
    // The MDC foundation then uses the information it gathers from the DOM to compute an initial
    // value for the tickMarks array. It then tries to update the component data, but because it is
    // updating the component data AFTER change detection already ran, we will get a changed after
    // checked error. Because of this, we need to force change detection to update the UI with the
    // new state.
    this._cdr.detectChanges();
  }

  ngOnDestroy() {
    if (this._platform.isBrowser) {
      this._foundation.destroy();
    }
    this._dirChangeSubscription.unsubscribe();
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
    clearTimeout(this._resizeTimer);
    this._removeUISyncEventListener();
  }

  /** Returns true if the language direction for this slider element is right to left. */
  _isRTL() {
    return this._dir && this._dir.value === 'rtl';
  }

  /**
   * Attaches an event listener that keeps sync the slider UI and the foundation in sync.
   *
   * Because the MDC Foundation stores the value of the bounding client rect when layout is called,
   * we need to keep calling layout to avoid the position of the slider getting out of sync with
   * what the foundation has stored. If we don't do this, the foundation will not be able to
   * correctly calculate the slider value on click/slide.
   */
  _attachUISyncEventListener(): void {
    // Implementation detail: It may seem weird that we are using "mouseenter" instead of
    // "mousedown" as the default for when a browser does not support pointer events. While we
    // would prefer to use "mousedown" as the default, for some reason it does not work (the
    // callback is never triggered).
    if (this._SUPPORTS_POINTER_EVENTS) {
      this._elementRef.nativeElement.addEventListener('pointerdown', this._layout);
    } else {
      this._elementRef.nativeElement.addEventListener('mouseenter', this._layout);
      this._elementRef.nativeElement.addEventListener(
        'touchstart',
        this._layout,
        passiveEventListenerOptions,
      );
    }
  }

  /** Removes the event listener that keeps sync the slider UI and the foundation in sync. */
  _removeUISyncEventListener(): void {
    if (this._SUPPORTS_POINTER_EVENTS) {
      this._elementRef.nativeElement.removeEventListener('pointerdown', this._layout);
    } else {
      this._elementRef.nativeElement.removeEventListener('mouseenter', this._layout);
      this._elementRef.nativeElement.removeEventListener(
        'touchstart',
        this._layout,
        passiveEventListenerOptions,
      );
    }
  }

  /** Wrapper function for calling layout (needed for adding & removing an event listener). */
  private _layout = () => this._foundation.layout();

  /**
   * Reinitializes the slider foundation and input state(s).
   *
   * The MDC Foundation does not support changing some slider attributes after it has been
   * initialized (e.g. min, max, and step). To continue supporting this feature, we need to
   * destroy the foundation and re-initialize everything whenever we make these changes.
   */
  private _reinitialize(): void {
    if (this._initialized) {
      this._foundation.destroy();
      if (this._isRange()) {
        this._getInput(Thumb.START)._initializeInputState();
      }
      this._getInput(Thumb.END)._initializeInputState();
      this._foundation.init();
      this._foundation.layout();
    }
  }

  /** Handles updating the slider foundation after a dir change. */
  private _onDirChange(): void {
    this._ngZone.runOutsideAngular(() => {
      // We need to call layout() a few milliseconds after the dir change callback
      // because we need to wait until the bounding client rect of the slider has updated.
      setTimeout(() => this._foundation.layout(), 10);
    });
  }

  /** Sets the value of a slider thumb. */
  _setValue(value: number, thumbPosition: Thumb): void {
    thumbPosition === Thumb.START
      ? this._foundation.setValueStart(value)
      : this._foundation.setValue(value);
  }

  /** Sets the disabled state of the MatSlider. */
  private _setDisabled(value: boolean) {
    this._disabled = value;

    // If we want to disable the slider after the foundation has been initialized,
    // we need to inform the foundation by calling `setDisabled`. Also, we can't call
    // this before initializing the foundation because it will throw errors.
    if (this._initialized) {
      this._foundation.setDisabled(value);
    }
  }

  /** Sets the disabled state of the individual slider thumb(s) (ControlValueAccessor). */
  private _updateInputsDisabledState() {
    if (this._initialized) {
      this._getInput(Thumb.END)._disabled = true;
      if (this._isRange()) {
        this._getInput(Thumb.START)._disabled = true;
      }
    }
  }

  /** Whether this is a ranged slider. */
  _isRange(): boolean {
    return this._inputs.length === 2;
  }

  /** Sets the disabled state based on the disabled state of the inputs (ControlValueAccessor). */
  _updateDisabled(): void {
    const disabled = this._inputs?.some(input => input._disabled) || false;
    this._setDisabled(disabled);
  }

  /** Gets the slider thumb input of the given thumb position. */
  _getInput(thumbPosition: Thumb): MatSliderThumb {
    return thumbPosition === Thumb.END ? this._inputs?.last! : this._inputs?.first!;
  }

  /** Gets the slider thumb HTML input element of the given thumb position. */
  _getInputElement(thumbPosition: Thumb): HTMLInputElement {
    return this._getInput(thumbPosition)?._hostElement;
  }

  _getThumb(thumbPosition: Thumb): MatSliderVisualThumb {
    return thumbPosition === Thumb.END ? this._thumbs?.last! : this._thumbs?.first!;
  }

  /** Gets the slider thumb HTML element of the given thumb position. */
  _getThumbElement(thumbPosition: Thumb): HTMLElement {
    return this._getThumb(thumbPosition)?._getHostElement();
  }

  /** Gets the slider knob HTML element of the given thumb position. */
  _getKnobElement(thumbPosition: Thumb): HTMLElement {
    return this._getThumb(thumbPosition)?._getKnob();
  }

  /**
   * Gets the slider value indicator container HTML element of the given thumb
   * position.
   */
  _getValueIndicatorContainerElement(thumbPosition: Thumb): HTMLElement {
    return this._getThumb(thumbPosition)._getValueIndicatorContainer();
  }

  /**
   * Sets the value indicator text of the given thumb position using the given value.
   *
   * Uses the `displayWith` function if one has been provided. Otherwise, it just uses the
   * numeric value as a string.
   */
  _setValueIndicatorText(value: number, thumbPosition: Thumb) {
    thumbPosition === Thumb.START
      ? (this._startValueIndicatorText = this.displayWith(value))
      : (this._endValueIndicatorText = this.displayWith(value));
    this._cdr.markForCheck();
  }

  /** Gets the value indicator text for the given thumb position. */
  _getValueIndicatorText(thumbPosition: Thumb): string {
    return thumbPosition === Thumb.START
      ? this._startValueIndicatorText
      : this._endValueIndicatorText;
  }

  /** Determines the class name for a HTML element. */
  _getTickMarkClass(tickMark: TickMark): string {
    return tickMark === TickMark.ACTIVE
      ? 'mdc-slider__tick-mark--active'
      : 'mdc-slider__tick-mark--inactive';
  }

  /** Whether the slider thumb ripples should be disabled. */
  _isRippleDisabled(): boolean {
    return this.disabled || this.disableRipple || !!this._globalRippleOptions?.disabled;
  }

  /** Gets the dimensions of the host element. */
  _getHostDimensions() {
    return this._cachedHostRect || this._elementRef.nativeElement.getBoundingClientRect();
  }

  /** Starts observing and updating the slider if the host changes its size. */
  private _observeHostResize() {
    if (typeof ResizeObserver === 'undefined' || !ResizeObserver) {
      return;
    }

    // MDC only updates the slider when the window is resized which
    // doesn't capture changes of the container itself. We use a resize
    // observer to ensure that the layout is correct (see #24590 and #25286).
    this._ngZone.runOutsideAngular(() => {
      this._resizeObserver = new ResizeObserver(entries => {
        // Triggering a layout while the user is dragging can throw off the alignment.
        if (this._isActive()) {
          return;
        }

        clearTimeout(this._resizeTimer);
        this._resizeTimer = setTimeout(() => {
          // The `layout` call is going to call `getBoundingClientRect` to update the dimensions
          // of the host. Since the `ResizeObserver` already calculated them, we can save some
          // work by returning them instead of having to check the DOM again.
          if (!this._isActive()) {
            this._cachedHostRect = entries[0]?.contentRect;
            this._layout();
            this._cachedHostRect = null;
          }
        }, 50);
      });
      this._resizeObserver.observe(this._elementRef.nativeElement);
    });
  }

  /** Whether any of the thumbs are currently active. */
  private _isActive(): boolean {
    return this._getThumb(Thumb.START)._isActive || this._getThumb(Thumb.END)._isActive;
  }
}

/** The MDCSliderAdapter implementation. */
class SliderAdapter implements MDCSliderAdapter {
  /** The global event listener subscription used to handle events on the slider inputs. */
  private _globalEventSubscriptions = new Subscription();

  /** The MDC Foundations handler function for start input change events. */
  private _startInputChangeEventHandler: SpecificEventListener<EventType>;

  /** The MDC Foundations handler function for end input change events. */
  private _endInputChangeEventHandler: SpecificEventListener<EventType>;

  constructor(private readonly _delegate: MatSlider) {
    this._globalEventSubscriptions.add(this._subscribeToSliderInputEvents('change'));
    this._globalEventSubscriptions.add(this._subscribeToSliderInputEvents('input'));
  }

  /**
   * Handles "change" and "input" events on the slider inputs.
   *
   * Exposes a callback to allow the MDC Foundations "change" event handler to be called for "real"
   * events.
   *
   * ** IMPORTANT NOTE **
   *
   * We block all "real" change and input events and emit fake events from #emitChangeEvent and
   * #emitInputEvent, instead. We do this because interacting with the MDC slider won't trigger all
   * of the correct change and input events, but it will call #emitChangeEvent and #emitInputEvent
   * at the correct times. This allows users to listen for these events directly on the slider
   * input as they would with a native range input.
   */
  private _subscribeToSliderInputEvents(type: 'change' | 'input') {
    return this._delegate._globalChangeAndInputListener.listen(type, (event: Event) => {
      const thumbPosition = this._getInputThumbPosition(event.target);

      // Do nothing if the event isn't from a thumb input.
      if (thumbPosition === null) {
        return;
      }

      // Do nothing if the event is "fake".
      if ((event as any)._matIsHandled) {
        return;
      }

      // Prevent "real" events from reaching end users.
      event.stopImmediatePropagation();

      // Relay "real" change events to the MDC Foundation.
      if (type === 'change') {
        this._callChangeEventHandler(event, thumbPosition);
      }
    });
  }

  /** Calls the MDC Foundations change event handler for the specified thumb position. */
  private _callChangeEventHandler(event: Event, thumbPosition: Thumb) {
    if (thumbPosition === Thumb.START) {
      this._startInputChangeEventHandler(event);
    } else {
      this._endInputChangeEventHandler(event);
    }
  }

  /** Save the event handler so it can be used in our global change event listener subscription. */
  private _saveChangeEventHandler(thumbPosition: Thumb, handler: SpecificEventListener<EventType>) {
    if (thumbPosition === Thumb.START) {
      this._startInputChangeEventHandler = handler;
    } else {
      this._endInputChangeEventHandler = handler;
    }
  }

  /**
   * Returns the thumb position of the given event target.
   * Returns null if the given event target does not correspond to a slider thumb input.
   */
  private _getInputThumbPosition(target: EventTarget | null): Thumb | null {
    if (target === this._delegate._getInputElement(Thumb.END)) {
      return Thumb.END;
    }
    if (this._delegate._isRange() && target === this._delegate._getInputElement(Thumb.START)) {
      return Thumb.START;
    }
    return null;
  }

  // We manually assign functions instead of using prototype methods because
  // MDC clobbers the values otherwise.
  // See https://github.com/material-components/material-components-web/pull/6256

  hasClass = (className: string): boolean => {
    return this._delegate._elementRef.nativeElement.classList.contains(className);
  };
  addClass = (className: string): void => {
    this._delegate._elementRef.nativeElement.classList.add(className);
  };
  removeClass = (className: string): void => {
    this._delegate._elementRef.nativeElement.classList.remove(className);
  };
  getAttribute = (attribute: string): string | null => {
    return this._delegate._elementRef.nativeElement.getAttribute(attribute);
  };
  addThumbClass = (className: string, thumbPosition: Thumb): void => {
    this._delegate._getThumbElement(thumbPosition).classList.add(className);
  };
  removeThumbClass = (className: string, thumbPosition: Thumb): void => {
    this._delegate._getThumbElement(thumbPosition).classList.remove(className);
  };
  getInputValue = (thumbPosition: Thumb): string => {
    return this._delegate._getInputElement(thumbPosition).value;
  };
  setInputValue = (value: string, thumbPosition: Thumb): void => {
    this._delegate._getInputElement(thumbPosition).value = value;
  };
  getInputAttribute = (attribute: string, thumbPosition: Thumb): string | null => {
    return this._delegate._getInputElement(thumbPosition).getAttribute(attribute);
  };
  setInputAttribute = (attribute: string, value: string, thumbPosition: Thumb): void => {
    const input = this._delegate._getInputElement(thumbPosition);

    // TODO(wagnermaciel): remove this check once this component is
    // added to the internal allowlist for calling setAttribute.

    // Explicitly check the attribute we are setting to prevent xss.
    switch (attribute) {
      case 'aria-valuetext':
        input.setAttribute('aria-valuetext', value);
        break;
      case 'disabled':
        input.setAttribute('disabled', value);
        break;
      case 'min':
        input.setAttribute('min', value);
        break;
      case 'max':
        input.setAttribute('max', value);
        break;
      case 'value':
        input.setAttribute('value', value);
        break;
      case 'step':
        input.setAttribute('step', value);
        break;
      default:
        throw Error(`Tried to set invalid attribute ${attribute} on the mdc-slider.`);
    }
  };
  removeInputAttribute = (attribute: string, thumbPosition: Thumb): void => {
    this._delegate._getInputElement(thumbPosition).removeAttribute(attribute);
  };
  focusInput = (thumbPosition: Thumb): void => {
    this._delegate._getInputElement(thumbPosition).focus();
  };
  isInputFocused = (thumbPosition: Thumb): boolean => {
    return this._delegate._getInput(thumbPosition)._isFocused();
  };
  getThumbKnobWidth = (thumbPosition: Thumb): number => {
    return this._delegate._getKnobElement(thumbPosition).getBoundingClientRect().width;
  };
  getThumbBoundingClientRect = (thumbPosition: Thumb): DOMRect => {
    return this._delegate._getThumbElement(thumbPosition).getBoundingClientRect();
  };
  getBoundingClientRect = (): DOMRect => {
    return this._delegate._getHostDimensions();
  };
  getValueIndicatorContainerWidth = (thumbPosition: Thumb): number => {
    return this._delegate._getValueIndicatorContainerElement(thumbPosition).getBoundingClientRect()
      .width;
  };
  isRTL = (): boolean => {
    return this._delegate._isRTL();
  };
  setThumbStyleProperty = (propertyName: string, value: string, thumbPosition: Thumb): void => {
    this._delegate._getThumbElement(thumbPosition).style.setProperty(propertyName, value);
  };
  removeThumbStyleProperty = (propertyName: string, thumbPosition: Thumb): void => {
    this._delegate._getThumbElement(thumbPosition).style.removeProperty(propertyName);
  };
  setTrackActiveStyleProperty = (propertyName: string, value: string): void => {
    this._delegate._trackActive.nativeElement.style.setProperty(propertyName, value);
  };
  removeTrackActiveStyleProperty = (propertyName: string): void => {
    this._delegate._trackActive.nativeElement.style.removeProperty(propertyName);
  };
  setValueIndicatorText = (value: number, thumbPosition: Thumb): void => {
    this._delegate._setValueIndicatorText(value, thumbPosition);
  };
  getValueToAriaValueTextFn = (): ((value: number) => string) | null => {
    return this._delegate.displayWith;
  };
  updateTickMarks = (tickMarks: TickMark[]): void => {
    this._delegate._tickMarks = tickMarks;
    this._delegate._cdr.markForCheck();
  };
  setPointerCapture = (pointerId: number): void => {
    this._delegate._elementRef.nativeElement.setPointerCapture(pointerId);
  };
  emitChangeEvent = (value: number, thumbPosition: Thumb): void => {
    // We block all real slider input change events and emit fake change events from here, instead.
    // We do this because the mdc implementation of the slider does not trigger real change events
    // on pointer up (only on left or right arrow key down).
    //
    // By stopping real change events from reaching users, and dispatching fake change events
    // (which we allow to reach the user) the slider inputs change events are triggered at the
    // appropriate times. This allows users to listen for change events directly on the slider
    // input as they would with a native range input.
    const input = this._delegate._getInput(thumbPosition);
    input._emitFakeEvent('change');
    input._onChange(value);
    input.valueChange.emit(value);
  };
  emitInputEvent = (value: number, thumbPosition: Thumb): void => {
    this._delegate._getInput(thumbPosition)._emitFakeEvent('input');
  };
  emitDragStartEvent = (value: number, thumbPosition: Thumb): void => {
    const input = this._delegate._getInput(thumbPosition);
    input.dragStart.emit({source: input, parent: this._delegate, value});
  };
  emitDragEndEvent = (value: number, thumbPosition: Thumb): void => {
    const input = this._delegate._getInput(thumbPosition);
    input.dragEnd.emit({source: input, parent: this._delegate, value});
  };
  registerEventHandler = <K extends EventType>(
    evtType: K,
    handler: SpecificEventListener<K>,
  ): void => {
    this._delegate._elementRef.nativeElement.addEventListener(evtType, handler);
  };
  deregisterEventHandler = <K extends EventType>(
    evtType: K,
    handler: SpecificEventListener<K>,
  ): void => {
    this._delegate._elementRef.nativeElement.removeEventListener(evtType, handler);
  };
  registerThumbEventHandler = <K extends EventType>(
    thumbPosition: Thumb,
    evtType: K,
    handler: SpecificEventListener<K>,
  ): void => {
    this._delegate._getThumbElement(thumbPosition).addEventListener(evtType, handler);
  };
  deregisterThumbEventHandler = <K extends EventType>(
    thumbPosition: Thumb,
    evtType: K,
    handler: SpecificEventListener<K>,
  ): void => {
    this._delegate._getThumbElement(thumbPosition)?.removeEventListener(evtType, handler);
  };
  registerInputEventHandler = <K extends EventType>(
    thumbPosition: Thumb,
    evtType: K,
    handler: SpecificEventListener<K>,
  ): void => {
    if (evtType === 'change') {
      this._saveChangeEventHandler(thumbPosition, handler as SpecificEventListener<EventType>);
    } else {
      this._delegate._getInputElement(thumbPosition)?.addEventListener(evtType, handler);
    }
  };
  deregisterInputEventHandler = <K extends EventType>(
    thumbPosition: Thumb,
    evtType: K,
    handler: SpecificEventListener<K>,
  ): void => {
    if (evtType === 'change') {
      this._globalEventSubscriptions.unsubscribe();
    } else {
      this._delegate._getInputElement(thumbPosition)?.removeEventListener(evtType, handler);
    }
  };
  registerBodyEventHandler = <K extends EventType>(
    evtType: K,
    handler: SpecificEventListener<K>,
  ): void => {
    this._delegate._document.body.addEventListener(evtType, handler);
  };
  deregisterBodyEventHandler = <K extends EventType>(
    evtType: K,
    handler: SpecificEventListener<K>,
  ): void => {
    this._delegate._document.body.removeEventListener(evtType, handler);
  };
  registerWindowEventHandler = <K extends EventType>(
    evtType: K,
    handler: SpecificEventListener<K>,
  ): void => {
    this._delegate._window.addEventListener(evtType, handler);
  };
  deregisterWindowEventHandler = <K extends EventType>(
    evtType: K,
    handler: SpecificEventListener<K>,
  ): void => {
    this._delegate._window.removeEventListener(evtType, handler);
  };
}

/** Ensures that there is not an invalid configuration for the slider thumb inputs. */
function _validateInputs(
  isRange: boolean,
  startInputElement: HTMLInputElement,
  endInputElement: HTMLInputElement,
): void {
  const startValid = !isRange || startInputElement.hasAttribute('matSliderStartThumb');
  const endValid = endInputElement.hasAttribute(isRange ? 'matSliderEndThumb' : 'matSliderThumb');

  if (!startValid || !endValid) {
    _throwInvalidInputConfigurationError();
  }
}

/** Validates that the slider has the correct set of thumbs. */
function _validateThumbs(
  isRange: boolean,
  start: MatSliderVisualThumb | undefined,
  end: MatSliderVisualThumb | undefined,
): void {
  if (!end && (!isRange || !start)) {
    _throwInvalidInputConfigurationError();
  }
}

function _throwInvalidInputConfigurationError(): void {
  throw Error(`Invalid slider thumb input configuration!

  Valid configurations are as follows:

    <mat-slider>
      <input matSliderThumb>
    </mat-slider>

    or

    <mat-slider>
      <input matSliderStartThumb>
      <input matSliderEndThumb>
    </mat-slider>
  `);
}
