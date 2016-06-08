import {
  Component,
  HostBinding,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  OnDestroy,
  Input
} from '@angular/core';

// TODO(josephperrott): Benchpress tests.

/** A single degree in radians. */
const DEGREE_IN_RADIANS = Math.PI / 180;
/** Duration of the indeterminate animation. */
const DURATION_INDETERMINATE = 667;
/** Duration of the indeterminate animation. */
const DURATION_DETERMINATE = 225;
/** Start animation value of the indeterminate animation */
let startIndeterminate = 3;
/** End animation value of the indeterminate animation */
let endIndeterminate = 80;


export type ProgressCircleMode = 'determinate' | 'indeterminate';

type EasingFn = (currentTime: number, startValue: number,
                 changeInValue: number, duration: number) => number


/**
 * <md-progress-circle> component.
 */
@Component({
  moduleId: module.id,
  selector: 'md-progress-circle',
  host: {
    'role': 'progressbar',
    '[attr.aria-valuemin]': 'ariaValueMin',
    '[attr.aria-valuemax]': 'ariaValueMax',
  },
  templateUrl: 'progress-circle.html',
  styleUrls: ['progress-circle.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdProgressCircle implements OnDestroy {
  /** The id of the last requested animation. */
  private _lastAnimationId: number = 0;

  /** The id of the indeterminate interval. */
  private _interdeterminateInterval: number;

  /**
   * Values for aria max and min are only defined as numbers when in a determinate mode.  We do this
   * because voiceover does not report the progress indicator as indeterminate if the aria min
   * and/or max value are number values.
   *
   * @internal
   */
  get ariaValueMin() {
    return this.mode == 'determinate' ? 0 : null;
  }

  /** @internal */
  get ariaValueMax() {
    return this.mode == 'determinate' ? 100 : null;
  }

  /** @internal */
  get interdeterminateInterval() {
    return this._interdeterminateInterval;
  }
  /** @internal */
  set interdeterminateInterval(interval: number) {
    clearInterval(this._interdeterminateInterval);
    this._interdeterminateInterval = interval;
  }

  /** The current path value, representing the progres circle. */
  private _currentPath: string;
  get currentPath() {
    return this._currentPath;
  }
  set currentPath(path: string) {
    this._currentPath = path;
    // Mark for check as our ChangeDetectionStrategy is OnPush, when changes come from within the
    // component, change detection must be called for.
    this._changeDetectorRef.markForCheck();
  }

  /** Clean up any animations that were running. */
  ngOnDestroy() {
    this._cleanupIndeterminateAnimation();
  }

  /**
   * Value of the progress circle.
   *
   * Input:number
   * _value is bound to the host as the attribute aria-valuenow.
   */
  private _value: number;
  @Input()
  @HostBinding('attr.aria-valuenow')
  get value() {
    if (this.mode == 'determinate') {
      return this._value;
    }
  }
  set value(v: number) {
    if (v && this.mode == 'determinate') {
      let newValue = clamp(v);
      this._animateCircle((this.value || 0), newValue, linearEase, DURATION_DETERMINATE, 0);
      this._value = newValue;
    }
  }

  /**
   * Mode of the progress circle
   *
   * Input must be one of the values from ProgressMode, defaults to 'determinate'.
   * mode is bound to the host as the attribute host.
   */
  @HostBinding('attr.mode')
  @Input()
  get mode() {
    return this._mode;
  }
  set mode(m: ProgressCircleMode) {
    if (m == 'indeterminate') {
      this._startIndeterminateAnimation();
    } else {
      this._cleanupIndeterminateAnimation();
    }
    this._mode = m;
  }
  private _mode: ProgressCircleMode = 'determinate';

  constructor(private _changeDetectorRef: ChangeDetectorRef) {
  }


  /**
   * Animates the circle from one percentage value to another.
   *
   * @param animateFrom The percentage of the circle filled starting the animation.
   * @param animateTo The percentage of the circle filled ending the animation.
   * @param ease The easing function to manage the pace of change in the animation.
   * @param duration The length of time to show the animation, in milliseconds.
   * @param rotation The starting angle of the circle fill, with 0° represented at the top center
   *    of the circle.
   */
  private _animateCircle(animateFrom: number, animateTo: number, ease: EasingFn,
                        duration: number, rotation: number) {
    let id = ++this._lastAnimationId;
    let startTime = now();
    let changeInValue = animateTo - animateFrom;

    // No need to animate it if the values are the same
    if (animateTo === animateFrom) {
      this.currentPath = getSvgArc(animateTo, rotation);
    } else {
      let animation = (currentTime: number) => {
        let elapsedTime = Math.max(
          0, Math.min((currentTime || now()) - startTime, duration));

        this.currentPath = getSvgArc(
          ease(elapsedTime, animateFrom, changeInValue, duration),
          rotation
        );

        // Prevent overlapping animations by checking if a new animation has been called for and
        // if the animation has lasted long than the animation duration.
        if (id === this._lastAnimationId && elapsedTime < duration) {
          requestAnimationFrame(animation);
        }
      };
      requestAnimationFrame(animation);
    }
  }


  /**
   * Starts the indeterminate animation interval, if it is not already running.
   */
  private _startIndeterminateAnimation() {
    let rotationStartPoint = 0;
    let start = startIndeterminate;
    let end =  endIndeterminate;
    let duration = DURATION_INDETERMINATE;
    let animate = () => {
      this._animateCircle(start, end, materialEase, duration, rotationStartPoint);
      // Prevent rotation from reaching Number.MAX_SAFE_INTEGER.
      rotationStartPoint = (rotationStartPoint + end) % 100;
      let temp = start;
      start = -end;
      end = -temp;
    };

    if (!this.interdeterminateInterval) {
      this.interdeterminateInterval = setInterval(
        animate, duration + 50, 0, false);
      animate();
    }
  }


  /**
   * Removes interval, ending the animation.
   */
  private _cleanupIndeterminateAnimation() {
    this.interdeterminateInterval = null;
  }
}


/**
 * <md-spinner> component.
 *
 * This is a component definition to be used as a convenience reference to create an
 * indeterminate <md-progress-circle> instance.
 */
@Component({
  moduleId: module.id,
  selector: 'md-spinner',
  host: {
    'role': 'progressbar',
    'mode': 'indeterminate',
  },
  templateUrl: 'progress-circle.html',
  styleUrls: ['progress-circle.css'],
})
export class MdSpinner extends MdProgressCircle {
  constructor(changeDetectorRef: ChangeDetectorRef) {
    super(changeDetectorRef);
    this.mode = 'indeterminate';
  }
}


/**
 * Module functions.
 */

/** Clamps a value to be between 0 and 100. */
function clamp(v: number) {
  return Math.max(0, Math.min(100, v));
}


/**
 * Returns the current timestamp either based on the performance global or a date object.
 */
function now() {
  if (typeof performance !== 'undefined' && performance.now) {
    return performance.now();
  }
  return Date.now();
}


/**
 * Converts Polar coordinates to Cartesian.
 */
function polarToCartesian(radius: number, pathRadius: number, angleInDegrees: number) {
  let angleInRadians = (angleInDegrees - 90) * DEGREE_IN_RADIANS;

  return (radius + (pathRadius * Math.cos(angleInRadians))) +
    ',' + (radius + (pathRadius * Math.sin(angleInRadians)));
}


/**
 * Easing function for linear animation.
 */
function linearEase(currentTime: number, startValue: number,
                    changeInValue: number, duration: number) {
  return changeInValue * currentTime / duration + startValue;
}


/**
 * Easing function to match material design indeterminate animation.
 */
function materialEase(currentTime: number, startValue: number,
                      changeInValue: number, duration: number) {
  let time = currentTime / duration;
  let timeCubed = Math.pow(time, 3);
  let timeQuad = Math.pow(time, 4);
  let timeQuint = Math.pow(time, 5);
  return startValue + changeInValue * ((6 * timeQuint) + (-15 * timeQuad) + (10 * timeCubed));

}


/**
 * Determines the path value to define the arc.  Converting percentage values to to polar
 * coordinates on the circle, and then to cartesian coordinates in the viewport.
 *
 * @param currentValue The current percentage value of the progress circle, the percentage of the
 *    circle to fill.
 * @param rotation The starting point of the circle with 0 being the 0 degree point.
 * @return A string for an SVG path representing a circle filled from the starting point to the
 *    percentage value provided.
 */
function getSvgArc(currentValue: number, rotation: number) {
  // The angle can't be exactly 360, because the arc becomes hidden.
  let maximumAngle = 359.99 / 100;
  let startPoint = rotation || 0;
  let radius = 50;
  let pathRadius = 40;

  let startAngle = startPoint * maximumAngle;
  let endAngle = currentValue * maximumAngle;
  let start = polarToCartesian(radius, pathRadius, startAngle);
  let end = polarToCartesian(radius, pathRadius, endAngle + startAngle);
  let arcSweep = endAngle < 0 ? 0 : 1;
  let largeArcFlag: number;

  if (endAngle < 0) {
    largeArcFlag = endAngle >= -180 ? 0 : 1;
  } else {
    largeArcFlag = endAngle <= 180 ? 0 : 1;
  }

  return `M${start}A${pathRadius},${pathRadius} 0 ${largeArcFlag},${arcSweep} ${end}`;
}

export const MD_PROGRESS_CIRCLE_DIRECTIVES = [MdProgressCircle, MdSpinner];
