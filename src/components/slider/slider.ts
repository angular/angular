import {
  Component,
  ElementRef,
  HostBinding,
  Input,
  ViewEncapsulation,
  AfterContentInit,
} from '@angular/core';
import {BooleanFieldValue} from '@angular2-material/core/annotations/field-value';
import {applyCssTransform} from '@angular2-material/core/style/apply-transform';

@Component({
  moduleId: module.id,
  selector: 'md-slider',
  host: {
    'tabindex': '0',
    '(click)': 'onClick($event)',
    '(drag)': 'onDrag($event)',
    '(dragstart)': 'onDragStart($event)',
    '(dragend)': 'onDragEnd()',
    '(window:resize)': 'onResize()',
    '(blur)': 'onBlur()',
  },
  templateUrl: 'slider.html',
  styleUrls: ['slider.css'],
  encapsulation: ViewEncapsulation.None,
})
export class MdSlider implements AfterContentInit {
  /** A renderer to handle updating the slider's thumb and fill track. */
  private _renderer: SliderRenderer = null;

  /** The dimensions of the slider. */
  private _sliderDimensions: ClientRect = null;

  @Input()
  @BooleanFieldValue()
  @HostBinding('class.md-slider-disabled')
  @HostBinding('attr.aria-disabled')
  disabled: boolean = false;

  /** The miniumum value that the slider can have. */
  private _min: number = 0;

  /** The maximum value that the slider can have. */
  private _max: number = 100;

  /** The percentage of the slider that coincides with the value. */
  private _percent: number = 0;

  /**
   * Whether or not the thumb is currently being dragged.
   * Used to determine if there should be a transition for the thumb and fill track.
   * TODO: internal
   */
  isDragging: boolean = false;

  /**
   * Whether or not the slider is active (clicked or is being dragged).
   * Used to shrink and grow the thumb as according to the Material Design spec.
   * TODO: internal
   */
  isActive: boolean = false;

  /** Indicator for if the value has been set or not. */
  private _isInitialized: boolean = false;

  /** Value of the slider. */
  private _value: number = 0;

  @Input()
  @HostBinding('attr.aria-valuemin')
  get min() {
    return this._min;
  }

  set min(v: number) {
    // This has to be forced as a number to handle the math later.
    this._min = Number(v);

    // If the value wasn't explicitly set by the user, set it to the min.
    if (!this._isInitialized) {
      this.value = this._min;
    }
  }

  @Input()
  @HostBinding('attr.aria-valuemax')
  get max() {
    return this._max;
  }

  set max(v: number) {
    this._max = Number(v);
  }

  @Input()
  @HostBinding('attr.aria-valuenow')
  get value() {
    return this._value;
  }

  set value(v: number) {
    this._value = Number(v);
    this._isInitialized = true;
    this.updatePercentFromValue();
  }

  constructor(elementRef: ElementRef) {
    this._renderer = new SliderRenderer(elementRef);
  }

  /**
   * Once the slider has rendered, grab the dimensions and update the position of the thumb and
   * fill track.
   * TODO: internal
   */
  ngAfterContentInit() {
    this._sliderDimensions = this._renderer.getSliderDimensions();
    this._renderer.updateThumbAndFillPosition(this._percent, this._sliderDimensions.width);
  }

  /** TODO: internal */
  onClick(event: MouseEvent) {
    if (this.disabled) {
      return;
    }

    this.isActive = true;
    this.isDragging = false;
    this._renderer.addFocus();
    this.updateValueFromPosition(event.clientX);
  }

  /** TODO: internal */
  onDrag(event: HammerInput) {
    if (this.disabled) {
      return;
    }
    // Prevent the drag from selecting anything else.
    event.preventDefault();
    this.updateValueFromPosition(event.center.x);
  }

  /** TODO: internal */
  onDragStart(event: HammerInput) {
    if (this.disabled) {
      return;
    }

    event.preventDefault();
    this.isDragging = true;
    this.isActive = true;
    this._renderer.addFocus();
    this.updateValueFromPosition(event.center.x);
  }

  /** TODO: internal */
  onDragEnd() {
    this.isDragging = false;
  }

  /** TODO: internal */
  onResize() {
    this.isDragging = true;
    this._sliderDimensions = this._renderer.getSliderDimensions();
    // Skip updating the value and position as there is no new placement.
    this._renderer.updateThumbAndFillPosition(this._percent, this._sliderDimensions.width);
  }

  /** TODO: internal */
  onBlur() {
    this.isActive = false;
  }

  /**
   * When the value changes without a physical position, the percentage needs to be recalculated
   * independent of the physical location.
   */
  updatePercentFromValue() {
    this._percent = (this.value - this.min) / (this.max - this.min);
  }

  /**
   * Calculate the new value from the new physical location.
   */
  updateValueFromPosition(pos: number) {
    let offset = this._sliderDimensions.left;
    let size = this._sliderDimensions.width;
    this._percent = this.clamp((pos - offset) / size);
    this.value = this.min + (this._percent * (this.max - this.min));

    this._renderer.updateThumbAndFillPosition(this._percent, this._sliderDimensions.width);
  }

  /**
   * Return a number between two numbers.
   */
  clamp(value: number, min = 0, max = 1) {
    return Math.max(min, Math.min(value, max));
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
   * Update the physical position of the thumb and fill track on the slider.
   */
  updateThumbAndFillPosition(percent: number, width: number) {
    // The actual thumb element. Needed to get the exact width of the thumb for calculations.
    let thumbElement = this._sliderElement.querySelector('.md-slider-thumb');
    // A container element that is used to avoid overwriting the transform on the thumb itself.
    let thumbPositionElement =
        <HTMLElement>this._sliderElement.querySelector('.md-slider-thumb-position');
    let fillTrackElement = <HTMLElement>this._sliderElement.querySelector('.md-slider-track-fill');
    let thumbWidth = thumbElement.getBoundingClientRect().width;

    let position = percent * width;
    // The thumb needs to be shifted to the left by half of the width of itself so that it centers
    // on the value.
    let thumbPosition = position - (thumbWidth / 2);

    fillTrackElement.style.width = `${position}px`;
    applyCssTransform(thumbPositionElement, `translateX(${thumbPosition}px)`);
  }

  /**
   * Focuses the native element.
   * Currently only used to allow a blur event to fire but will be used with keyboard input later.
   */
  addFocus() {
    this._sliderElement.focus();
  }
}

export const MD_SLIDER_DIRECTIVES = [MdSlider];
