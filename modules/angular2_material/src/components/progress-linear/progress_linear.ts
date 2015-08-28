import {Component, LifecycleEvent, View, ViewEncapsulation, Attribute} from 'angular2/angular2';
import {CONST} from 'angular2/src/core/facade/lang';
import {isPresent, isBlank} from 'angular2/src/core/facade/lang';
import {Math} from 'angular2/src/core/facade/math';


/** Different display / behavior modes for progress-linear. */
@CONST()
class ProgressMode {
  @CONST() static DETERMINATE = 'determinate';
  @CONST() static INDETERMINATE = 'indeterminate';
  @CONST() static BUFFER = 'buffer';
  @CONST() static QUERY = 'query';
}

@Component({
  selector: 'md-progress-linear',
  lifecycle: [LifecycleEvent.OnChanges],
  properties: ['value', 'bufferValue'],
  host: {
    'role': 'progressbar',
    'aria-valuemin': '0',
    'aria-valuemax': '100',
    '[attr.aria-valuenow]': 'value'
  }
})
@View({
  templateUrl: 'package:angular2_material/src/components/progress-linear/progress_linear.html',
  directives: [],
  encapsulation: ViewEncapsulation.NONE
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

  constructor(@Attribute('mode') mode: string) {
    this.primaryBarTransform = '';
    this.secondaryBarTransform = '';

    this.mode = isPresent(mode) ? mode : ProgressMode.DETERMINATE;
  }

  get value() {
    return this.value_;
  }

  set value(v) {
    if (isPresent(v)) {
      this.value_ = MdProgressLinear.clamp(v);
    }
  }

  onChanges(_) {
    // If the mode does not use a value, or if there is no value, do nothing.
    if (this.mode == ProgressMode.QUERY || this.mode == ProgressMode.INDETERMINATE ||
        isBlank(this.value)) {
      return;
    }

    this.primaryBarTransform = this.transformForValue(this.value);

    // The bufferValue is only used in buffer mode.
    if (this.mode == ProgressMode.BUFFER) {
      this.secondaryBarTransform = this.transformForValue(this.bufferValue);
    }
  }

  /** Gets the CSS `transform` property for a progress bar based on the given value (0 - 100). */
  transformForValue(value) {
    // TODO(jelbourn): test perf gain of caching these, since there are only 101 values.
    let scale = value / 100;
    let translateX = (value - 100) / 2;
    return `translateX(${translateX}%) scale(${scale}, 1)`;
  }

  /** Clamps a value to be between 0 and 100. */
  static clamp(v) {
    return Math.max(0, Math.min(100, v));
  }
}
