import {
  Component,
  ChangeDetectionStrategy,
  HostBinding,
  Input
} from 'angular2/core';


// TODO(josephperrott): Benchpress tests.


/**
 * <md-progress-circle> component.
 */
@Component({
  selector: 'md-progress-circle',
  host: {
    'role': 'progressbar',
    'aria-valuemin': '0',
    'aria-valuemax': '100',
  },
  templateUrl: './components/progress-circle/progress-circle.html',
  styleUrls: ['./components/progress-circle/progress-circle.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdProgressCircle {
  /**
   * Value of the progress circle.
   *
   * Input:number, defaults to 0.
   * _value is bound to the host as the attribute aria-valuenow.
   */
  @HostBinding('attr.aria-valuenow')
  @Input('value')
  _value: number = 0;

  /**
   * Mode of the progress circle
   *
   * Input must be one of the values from ProgressMode, defaults to 'determinate'.
   * mode is bound to the host as the attribute host.
   */
  @HostBinding('attr.mode')
  @Input() mode: 'determinate' | 'indeterminate' = 'determinate';


  /**
   * Gets the current stroke dash offset to represent the progress circle.
   *
   * The stroke dash offset specifies the distance between dashes in the circle's stroke.
   * Setting the offset to a percentage of the total circumference of the circle, fills this
   * percentage of the overall circumference of the circle.
   */
  strokeDashOffset() {
    // To determine how far the offset should be, we multiple the current percentage by the
    // total circumference.

    // The total circumference is calculated based on the radius we use, 45.
    // PI * 2 * 45
    return 251.3274 * (100 - this._value) / 100;
  }


  /** Gets the progress value, returning the clamped value. */
  get value() {
    return this._value;
  }


  /** Sets the progress value, clamping before setting the internal value. */
  set value(v: number) {
    if (v != null) {
      this._value = MdProgressCircle.clamp(v);
    }
  }


  /** Clamps a value to be between 0 and 100. */
  static clamp(v: number) {
    return Math.max(0, Math.min(100, v));
  }
}



/**
 * <md-spinner> component.
 *
 * This is a component definition to be used as a convenience reference to create an
 * indeterminate <md-progress-circle> instance.
 */
@Component({
  selector: 'md-spinner',
  host: {
    'role': 'progressbar',
  },
  templateUrl: './components/progress-circle/progress-circle.html',
  styleUrls: ['./components/progress-circle/progress-circle.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdSpinner extends MdProgressCircle {
  constructor() {
    super();
    this.mode = 'indeterminate';
  }
}
