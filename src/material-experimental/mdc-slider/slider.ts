/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directionality} from '@angular/cdk/bidi';
import {coerceBooleanProperty, coerceNumberProperty} from '@angular/cdk/coercion';
import {normalizePassiveListenerOptions} from '@angular/cdk/platform';
import {
  AfterViewInit,
  Attribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Inject,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Optional,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {ThemePalette} from '@angular/material/core';
import {ANIMATION_MODULE_TYPE} from '@angular/platform-browser/animations';
import {MDCSliderAdapter, MDCSliderFoundation} from '@material/slider';
import {Subscription} from 'rxjs';

/**
 * Visually, a 30px separation between tick marks looks best. This is very subjective but it is
 * the default separation we chose.
 */
const MIN_AUTO_TICK_SEPARATION = 30;

/**
 * Size of a tick marker for a slider. The size of a tick is based on the Material
 * Design guidelines and the MDC slider implementation.
 * TODO(devversion): ideally MDC would expose the tick marker size as constant
 */
const TICK_MARKER_SIZE = 2;

/** Options to pass to the slider interaction listeners. */
const listenerOptions = normalizePassiveListenerOptions({passive: true});

/**
 * Provider Expression that allows mat-slider to register as a ControlValueAccessor.
 * This allows it to support [(ngModel)] and [formControl].
 * @docs-private
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
  value: number;
}

@Component({
  moduleId: module.id,
  selector: 'mat-slider',
  templateUrl: 'slider.html',
  styleUrls: ['slider.css'],
  host: {
    // The standard Angular Material slider has the capability to dynamically toggle
    // whether tick markers should show or not. Therefore we need to make sure that
    // the MDC slider foundation is able to render tick markers. We dynamically toggle
    // them based on the specified "tickInterval" input.
    'class': 'mat-mdc-slider mdc-slider mdc-slider--display-markers',
    'role': 'slider',
    'aria-orientation': 'horizontal',
    // The tabindex if the slider turns disabled is managed by the MDC foundation which
    // dynamically updates and restores the "tabindex" attribute.
    '[attr.tabindex]': 'tabIndex || 0',
    '[class.mdc-slider--discrete]': 'thumbLabel',
    '[class.mat-slider-has-ticks]': 'tickInterval !== 0',
    '[class.mat-slider-thumb-label-showing]': 'thumbLabel',
    '[class.mat-slider-disabled]': 'disabled',
    '[class.mat-primary]': 'color == "primary"',
    '[class.mat-accent]': 'color == "accent"',
    '[class.mat-warn]': 'color == "warn"',
    '[class._mat-animation-noopable]': '_animationMode === "NoopAnimations"',
    '(blur)': '_markAsTouched()',
  },
  exportAs: 'matSlider',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MAT_SLIDER_VALUE_ACCESSOR],
})
export class MatSlider implements AfterViewInit, OnChanges, OnDestroy, ControlValueAccessor {
  /** Event emitted when the slider value has changed. */
  @Output() readonly change: EventEmitter<MatSliderChange> = new EventEmitter<MatSliderChange>();

  /** Event emitted when the slider thumb moves. */
  @Output() readonly input: EventEmitter<MatSliderChange> = new EventEmitter<MatSliderChange>();

  /**
   * Emits when the raw value of the slider changes. This is here primarily
   * to facilitate the two-way binding for the `value` input.
   * @docs-private
   */
  @Output() readonly valueChange: EventEmitter<number> = new EventEmitter<number>();

  /** Tabindex for the slider. */
  @Input() tabIndex: number = 0;

  /** The color palette for this slider. */
  @Input() color: ThemePalette = 'accent';

  /**
   * Function that will be used to format the value before it is displayed
   * in the thumb label. Can be used to format very large number in order
   * for them to fit into the slider thumb.
   */
  @Input() displayWith: (value: number) => string | number;

  /** The minimum value that the slider can have. */
  @Input()
  get min(): number {
    return this._min;
  }
  set min(value: number) {
    this._min = coerceNumberProperty(value);
  }
  private _min = 0;

  /** The maximum value that the slider can have. */
  @Input()
  get max(): number {
    return this._max;
  }
  set max(value: number) {
    this._max = coerceNumberProperty(value);
  }
  private _max = 100;

  /** Value of the slider. */
  @Input()
  get value(): number|null {
    // If the value needs to be read and it is still uninitialized, initialize
    // it to the current minimum value.
    if (this._value === null) {
      this.value = this.min;
    }
    return this._value;
  }
  set value(value: number|null) {
    this._value = coerceNumberProperty(value);
  }
  private _value: number|null = null;

  /** The values at which the thumb will snap. */
  @Input()
  get step(): number {
    return this._step;
  }
  set step(v: number) {
    this._step = coerceNumberProperty(v, this._step);
  }
  private _step: number = 1;

  /**
   * How often to show ticks. Relative to the step so that a tick always appears on a step.
   * Ex: Tick interval of 4 with a step of 3 will draw a tick every 4 steps (every 12 values).
   */
  @Input()
  get tickInterval() {
    return this._tickInterval;
  }
  set tickInterval(value: number|'auto') {
    if (value === 'auto') {
      this._tickInterval = 'auto';
    } else if (typeof value === 'number' || typeof value === 'string') {
      this._tickInterval = coerceNumberProperty(value, this._tickInterval);
    } else {
      this._tickInterval = 0;
    }
  }
  private _tickInterval: number|'auto' = 0;

  /** Whether or not to show the thumb label. */
  @Input()
  get thumbLabel(): boolean {
    return this._thumbLabel;
  }
  set thumbLabel(value: boolean) {
    this._thumbLabel = coerceBooleanProperty(value);
  }
  private _thumbLabel: boolean = false;

  /** Whether the slider is disabled. */
  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(disabled) {
    this._disabled = coerceBooleanProperty(disabled);
  }
  private _disabled = false;

  /** Adapter for the MDC slider foundation. */
  private _sliderAdapter: MDCSliderAdapter = {
    hasClass: (className) => this._elementRef.nativeElement.classList.contains(className),
    addClass: (className) => this._elementRef.nativeElement.classList.add(className),
    removeClass: (className) => this._elementRef.nativeElement.classList.remove(className),
    getAttribute: (name) => this._elementRef.nativeElement.getAttribute(name),
    setAttribute: (name, value) => this._elementRef.nativeElement.setAttribute(name, value),
    removeAttribute: (name) => this._elementRef.nativeElement.removeAttribute(name),
    computeBoundingRect: () => this._elementRef.nativeElement.getBoundingClientRect(),
    getTabIndex: () => this._elementRef.nativeElement.tabIndex,
    registerInteractionHandler: (evtType, handler) =>
        // Interaction event handlers (which handle keyboard interaction) cannot be passive
        // as they will prevent the default behavior. Additionally we can't run these event
        // handlers outside of the Angular zone because we rely on the events to cause the
        // component tree to be re-checked.
    this._elementRef.nativeElement.addEventListener(evtType, handler),
    deregisterInteractionHandler: (evtType, handler) =>
        this._elementRef.nativeElement.removeEventListener(evtType, handler),
    registerThumbContainerInteractionHandler:
        (evtType, handler) => {
          // The thumb container interaction handlers are currently just used for transition
          // events which don't need to run in the Angular zone.
          this._ngZone.runOutsideAngular(() => {
            this._thumbContainer.nativeElement.addEventListener(evtType, handler, listenerOptions);
          });
        },
    deregisterThumbContainerInteractionHandler:
        (evtType, handler) => {
          this._thumbContainer.nativeElement.removeEventListener(evtType, handler, listenerOptions);
        },
    registerBodyInteractionHandler: (evtType, handler) =>
        // Body event handlers (which handle thumb sliding) cannot be passive as they will
        // prevent the default behavior. Additionally we can't run these event handlers
        // outside of the Angular zone because we rely on the events to cause the component
        // tree to be re-checked.
    document.body.addEventListener(evtType, handler),
    deregisterBodyInteractionHandler: (evtType, handler) =>
        document.body.removeEventListener(evtType, handler),
    registerResizeHandler:
        (handler) => {
          // The resize handler is currently responsible for detecting slider dimension
          // changes and therefore doesn't cause a value change that needs to be propagated.
          this._ngZone.runOutsideAngular(() => {
            window.addEventListener('resize', handler, listenerOptions);
          });
        },
    deregisterResizeHandler: (handler) =>
        window.removeEventListener('resize', handler, listenerOptions),
    notifyInput:
        () => {
          const newValue = this._foundation.getValue();
          // MDC currently fires the input event multiple times.
          // TODO(devversion): remove this check once the input notifications are fixed.
          if (newValue !== this.value) {
            this.value = newValue;
            this.input.emit(this._createChangeEvent(newValue));
          }
        },
    notifyChange:
        () => {
          // TODO(devversion): bug in MDC where only the "change" event is emitted if a keypress
          // updated the value. Material and native range sliders also emit an input event.
          // Usually we sync the "value" in the "input" event, but as a workaround we now sync
          // the value in the "change" event.
          this.value = this._foundation.getValue();
          this._emitChangeEvent(this.value!);
        },
    setThumbContainerStyleProperty:
        (propertyName, value) => {
          this._thumbContainer.nativeElement.style.setProperty(propertyName, value);
        },
    setTrackStyleProperty:
        (propertyName, value) => {
          this._track.nativeElement.style.setProperty(propertyName, value);
        },
    setMarkerValue:
        () => {
          // Mark the component for check as the thumb label needs to be re-rendered.
          this._changeDetectorRef.markForCheck();
        },
    setTrackMarkers:
        (step, max, min) => {
          this._trackMarker.nativeElement.style.setProperty(
              'background', this._getTrackMarkersBackground(min, max, step));
        },
    isRTL: () => this._dir && this._dir.value === 'rtl',
  };

  /** Instance of the MDC slider foundation for this slider. */
  private _foundation = new MDCSliderFoundation(this._sliderAdapter);

  /** Whether the MDC foundation has been initialized. */
  private _isInitialized = false;

  /** Function that notifies the control value accessor about a value change. */
  private _controlValueAccessorChangeFn: (value: number) => void = () => {};

  /** Subscription to the Directionality change EventEmitter. */
  private _dirChangeSubscription = Subscription.EMPTY;

  /** Function that marks the slider as touched. Registered via "registerOnTouch". */
  _markAsTouched: () => any = () => {};

  @ViewChild('thumbContainer', {static: false}) _thumbContainer: ElementRef<HTMLElement>;
  @ViewChild('track', {static: false}) _track: ElementRef<HTMLElement>;
  @ViewChild('pinValueMarker', {static: false}) _pinValueMarker: ElementRef<HTMLElement>;
  @ViewChild('trackMarker', {static: false}) _trackMarker: ElementRef<HTMLElement>;

  constructor(
      private _elementRef: ElementRef<HTMLElement>, private _changeDetectorRef: ChangeDetectorRef,
      private _ngZone: NgZone, @Optional() private _dir: Directionality,
      @Attribute('tabindex') tabIndex: string,
      @Optional() @Inject(ANIMATION_MODULE_TYPE) public _animationMode?: string) {
    this.tabIndex = parseInt(tabIndex) || 0;

    if (this._dir) {
      this._dirChangeSubscription = this._dir.change.subscribe(() => {
        // In case the directionality changes, we need to refresh the rendered MDC slider.
        // Note that we need to wait until the page actually updated as otherwise the
        // client rectangle wouldn't reflect the new directionality.
        // TODO(devversion): ideally the MDC slider would just compute dimensions similarly
        // to the standard Material slider on "mouseenter".
        this._ngZone.runOutsideAngular(() => setTimeout(() => this._foundation.layout()));
      });
    }
  }

  ngAfterViewInit() {
    this._isInitialized = true;
    this._foundation.init();

    // The standard Angular Material slider is always using discrete values. We always
    // want to enable discrete values and support ticks, but want to still provide
    // non-discrete slider visual looks if thumb label is disabled.
    // TODO(devversion): check if we can get a public API for this.
    // Tracked with: https://github.com/material-components/material-components-web/issues/5020
    (this._foundation as any).isDiscrete_ = true;

    this._syncStep();
    this._syncValue();
    this._syncMax();
    this._syncMin();
    this._syncDisabled();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this._isInitialized) {
      return;
    }

    if (changes['step']) {
      this._syncStep();
    }
    if (changes['max']) {
      this._syncMax();
    }
    if (changes['min']) {
      this._syncMin();
    }
    if (changes['disabled']) {
      this._syncDisabled();
    }
    if (changes['value']) {
      this._syncValue();
    }
    if (changes['tickInterval']) {
      this._refreshTrackMarkers();
    }
  }

  ngOnDestroy() {
    this._dirChangeSubscription.unsubscribe();
    this._foundation.destroy();
  }

  /** Focuses the slider. */
  focus(options?: FocusOptions) {
    this._elementRef.nativeElement.focus(options);
  }

  /** Blurs the slider. */
  blur() {
    this._elementRef.nativeElement.blur();
  }

  /** Gets the display text of the current value. */
  get displayValue() {
    if (this.displayWith) {
      return this.displayWith(this.value!).toString();
    }
    return this.value!.toString() || '0';
  }

  /** Creates a slider change object from the specified value. */
  private _createChangeEvent(newValue: number): MatSliderChange {
    const event = new MatSliderChange();
    event.source = this;
    event.value = newValue;
    return event;
  }

  /** Emits a change event and notifies the control value accessor. */
  private _emitChangeEvent(newValue: number) {
    this._controlValueAccessorChangeFn(newValue);
    this.valueChange.emit(newValue);
    this.change.emit(this._createChangeEvent(newValue));
  }

  /** Computes the CSS background value for the track markers (aka ticks). */
  private _getTrackMarkersBackground(min: number, max: number, step: number) {
    if (!this.tickInterval) {
      return '';
    }

    const markerWidth = `${TICK_MARKER_SIZE}px`;
    const markerBackground =
        `linear-gradient(to right, currentColor ${markerWidth}, transparent 0)`;

    if (this.tickInterval === 'auto') {
      const trackSize = this._elementRef.nativeElement.getBoundingClientRect().width;
      const pixelsPerStep = trackSize * step / (max - min);
      const stepsPerTick = Math.ceil(MIN_AUTO_TICK_SEPARATION / pixelsPerStep);
      const pixelsPerTick = stepsPerTick * step;
      return `${markerBackground} 0 center / ${pixelsPerTick}px 100% repeat-x`;
    }

    // keep calculation in css for better rounding/subpixel behavior
    const markerAmount = `(((${max} - ${min}) / ${step}) / ${this.tickInterval})`;
    const markerBkgdLayout =
        `0 center / calc((100% - ${markerWidth}) / ${markerAmount}) 100% repeat-x`;
    return `${markerBackground} ${markerBkgdLayout}`;
  }

  /** Method that ensures that track markers are refreshed. */
  private _refreshTrackMarkers() {
    this._foundation.setupTrackMarker();
  }

  /** Syncs the "step" input value with the MDC foundation. */
  private _syncStep() {
    this._foundation.setStep(this.step);
  }

  /** Syncs the "max" input value with the MDC foundation. */
  private _syncMax() {
    this._foundation.setMax(this.max);
  }

  /** Syncs the "min" input value with the MDC foundation. */
  private _syncMin() {
    this._foundation.setMin(this.min);
  }

  /** Syncs the "value" input binding with the MDC foundation. */
  private _syncValue() {
    this._foundation.setValue(this.value!);
  }

  /** Syncs the "disabled" input value with the MDC foundation. */
  private _syncDisabled() {
    this._foundation.setDisabled(this.disabled);
  }

  /**
   * Registers a callback to be triggered when the value has changed.
   * Implemented as part of ControlValueAccessor.
   * @param fn Callback to be registered.
   */
  registerOnChange(fn: any) {
    this._controlValueAccessorChangeFn = fn;
  }

  /**
   * Registers a callback to be triggered when the component is touched.
   * Implemented as part of ControlValueAccessor.
   * @param fn Callback to be registered.
   */
  registerOnTouched(fn: any) {
    this._markAsTouched = fn;
  }

  /**
   * Sets whether the component should be disabled.
   * Implemented as part of ControlValueAccessor.
   * @param isDisabled
   */
  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
    this._syncDisabled();
  }

  /**
   * Sets the model value.
   * Implemented as part of ControlValueAccessor.
   * @param value
   */
  writeValue(value: any) {
    this.value = value;
    this._syncValue();
  }
}
