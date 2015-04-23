import {Component, View, Attribute, onChange} from 'angular2/angular2';
import {isPresent, isBlank} from 'angular2/src/facade/lang';
import {Math} from 'angular2/src/facade/math';

@Component({
  selector: 'md-progress-linear',
  lifecycle: [onChange],
  properties: {
    'value': 'value',
    'bufferValue': 'buffer-value'
  },
  hostProperties: {
    'role': 'attr.role',
    'ariaValuemin': 'attr.aria-valuemin',
    'ariaValuemax': 'attr.aria-valuemax',
    'value': 'attr.aria-valuenow'
  }
})
@View({
  templateUrl: 'angular2_material/src/components/progress-linear/progress_linear.html',
  directives: []
})
export class MdProgressLinear {
  /** Value for the primary bar. */
  value_: number;

  /** Value for the secondary bar. */
  bufferValue: number;

  /** The render mode for the progress bar. */
  mode: string;

  /** CSS `transform` property applied to the primary bar. */
  primaryBarTransform: string;

  /** CSS `transform` property applied to the secondary bar. */
  secondaryBarTransform: string;

  role: string;
  ariaValuemin: string;
  ariaValuemax: string;

  constructor(@Attribute('md-mode') mode: string) {
    this.primaryBarTransform = '';
    this.secondaryBarTransform = '';

    this.role = 'progressbar';
    this.ariaValuemin = '0';
    this.ariaValuemax = '100';

    this.mode = isPresent(mode) ? mode : Mode.DETERMINATE;
  }

  get value() {
    return this.value_;
  }

  set value(v) {
    if (isPresent(v)) {
      this.value_ = MdProgressLinear.clamp(v);
    }
  }

  onChange(_) {
    // If the mode does not use a value, or if there is no value, do nothing.
    if (this.mode == Mode['QUERY'] || this.mode == Mode['INDETERMINATE'] || isBlank(this.value)) {
      return;
    }

    this.primaryBarTransform = this.transformForValue(this.value);

    // The bufferValue is only used in buffer mode.
    if (this.mode == Mode['BUFFER']) {
      this.secondaryBarTransform = this.transformForValue(this.bufferValue);
    }
  }

  /** Gets the CSS `transform` property for a progress bar based on the given value (0 - 100). */
  transformForValue(value) {
    // TODO(jelbourn): test perf gain of caching these, since there are only 101 values.
    var scale = value / 100;
    var translateX = (value - 100) / 2;
    return `translateX(${translateX}%) scale(${scale}, 1)`;
  }

  /** Clamps a value to be between 0 and 100. */
  static clamp(v) {
    return Math.max(0, Math.min(100, v));
  }
}

/** @enum {string} Progress-linear modes. */
var Mode = {
  'DETERMINATE': 'determinate',
  'INDETERMINATE': 'indeterminate',
  'BUFFER': 'buffer',
  'QUERY': 'query'
};
