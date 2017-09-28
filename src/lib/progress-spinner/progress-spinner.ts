/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Component,
  ChangeDetectionStrategy,
  OnDestroy,
  Input,
  ElementRef,
  NgZone,
  Renderer2,
  Directive,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {CanColor, mixinColor} from '@angular/material/core';


// TODO(josephperrott): Benchpress tests.

/** A single degree in radians. */
const DEGREE_IN_RADIANS = Math.PI / 180;
/** Duration of the indeterminate animation. */
const DURATION_INDETERMINATE = 667;
/** Duration of the indeterminate animation. */
const DURATION_DETERMINATE = 225;
/** Start animation value of the indeterminate animation */
const startIndeterminate = 3;
/** End animation value of the indeterminate animation */
const endIndeterminate = 80;
/** Maximum angle for the arc. The angle can't be exactly 360, because the arc becomes hidden. */
const MAX_ANGLE = 359.99 / 100;
/** Whether the user's browser supports requestAnimationFrame. */
const HAS_RAF = typeof requestAnimationFrame !== 'undefined';
/** Default stroke width as a percentage of the viewBox. */
export const PROGRESS_SPINNER_STROKE_WIDTH = 10;

export type ProgressSpinnerMode = 'determinate' | 'indeterminate';

type EasingFn = (currentTime: number, startValue: number,
                 changeInValue: number, duration: number) => number;


/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector: 'mat-progress-spinner',
  host: {'class': 'mat-progress-spinner'}
})
export class MatProgressSpinnerCssMatStyler {}

// Boilerplate for applying mixins to MatProgressSpinner.
/** @docs-private */
export class MatProgressSpinnerBase {
  constructor(public _renderer: Renderer2, public _elementRef: ElementRef) {}
}
export const _MatProgressSpinnerMixinBase = mixinColor(MatProgressSpinnerBase, 'primary');

/**
 * <mat-progress-spinner> component.
 */
@Component({
  moduleId: module.id,
  selector: 'mat-progress-spinner',
  host: {
    'role': 'progressbar',
    'class': 'mat-progress-spinner',
    '[attr.aria-valuemin]': '_ariaValueMin',
    '[attr.aria-valuemax]': '_ariaValueMax',
    '[attr.aria-valuenow]': 'value',
    '[attr.mode]': 'mode',
  },
  inputs: ['color'],
  templateUrl: 'progress-spinner.html',
  styleUrls: ['progress-spinner.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
})
export class MatProgressSpinner extends _MatProgressSpinnerMixinBase
    implements OnDestroy, CanColor {

  /** The id of the last requested animation. */
  private _lastAnimationId: number = 0;

  /** The id of the indeterminate interval. */
  private _interdeterminateInterval: number | null;

  /** The SVG <path> node that is used to draw the circle. */
  @ViewChild('path') private _path: ElementRef;

  private _mode: ProgressSpinnerMode = 'determinate';
  private _value: number;

  /** Stroke width of the progress spinner. By default uses 10px as stroke width. */
  @Input() strokeWidth: number = PROGRESS_SPINNER_STROKE_WIDTH;

  /**
   * Values for aria max and min are only defined as numbers when in a determinate mode.  We do this
   * because voiceover does not report the progress indicator as indeterminate if the aria min
   * and/or max value are number values.
   */
  get _ariaValueMin() {
    return this.mode == 'determinate' ? 0 : null;
  }

  get _ariaValueMax() {
    return this.mode == 'determinate' ? 100 : null;
  }

  /** @docs-private */
  get interdeterminateInterval() {
    return this._interdeterminateInterval;
  }
  /** @docs-private */
  set interdeterminateInterval(interval: number | null) {
    if (this._interdeterminateInterval) {
      clearInterval(this._interdeterminateInterval);
    }

    this._interdeterminateInterval = interval;
  }

  /**
   * Clean up any animations that were running.
   */
  ngOnDestroy() {
    this._cleanupIndeterminateAnimation();
  }

  /** Value of the progress circle. It is bound to the host as the attribute aria-valuenow. */
  @Input()
  get value() {
    if (this.mode == 'determinate') {
      return this._value;
    }

    return 0;
  }
  set value(v: number) {
    if (v != null && this.mode == 'determinate') {
      let newValue = clamp(v);
      this._animateCircle(this.value || 0, newValue);
      this._value = newValue;
    }
  }

  /**
   * Mode of the progress circle
   *
   * Input must be one of the values from ProgressMode, defaults to 'determinate'.
   * mode is bound to the host as the attribute host.
   */
  @Input()
  get mode() { return this._mode; }
  set mode(mode: ProgressSpinnerMode) {
    if (mode !== this._mode) {
      if (mode === 'indeterminate') {
        this._startIndeterminateAnimation();
      } else {
        this._cleanupIndeterminateAnimation();
        this._animateCircle(0, this._value);
      }
      this._mode = mode;
    }
  }

  constructor(renderer: Renderer2,
              elementRef: ElementRef,
              private _ngZone: NgZone) {
    super(renderer, elementRef);
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
  private _animateCircle(animateFrom: number, animateTo: number, ease: EasingFn = linearEase,
                        duration = DURATION_DETERMINATE, rotation = 0) {

    let id = ++this._lastAnimationId;
    let startTime = Date.now();
    let changeInValue = animateTo - animateFrom;

    // No need to animate it if the values are the same
    if (animateTo === animateFrom) {
      this._renderArc(animateTo, rotation);
    } else {
      let animation = () => {
        // If there is no requestAnimationFrame, skip ahead to the end of the animation.
        let elapsedTime = HAS_RAF ?
            Math.max(0, Math.min(Date.now() - startTime, duration)) :
            duration;

        this._renderArc(
          ease(elapsedTime, animateFrom, changeInValue, duration),
          rotation
        );

        // Prevent overlapping animations by checking if a new animation has been called for and
        // if the animation has lasted longer than the animation duration.
        if (id === this._lastAnimationId && elapsedTime < duration) {
          requestAnimationFrame(animation);
        }
      };

      // Run the animation outside of Angular's zone, in order to avoid
      // hitting ZoneJS and change detection on each frame.
      this._ngZone.runOutsideAngular(animation);
    }
  }


  /**
   * Starts the indeterminate animation interval, if it is not already running.
   */
  private _startIndeterminateAnimation() {
    let rotationStartPoint = 0;
    let start = startIndeterminate;
    let end = endIndeterminate;
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
      this._ngZone.runOutsideAngular(() => {
        this.interdeterminateInterval = setInterval(animate, duration + 50, 0, false);
        animate();
      });
    }
  }


  /**
   * Removes interval, ending the animation.
   */
  private _cleanupIndeterminateAnimation() {
    this.interdeterminateInterval = null;
  }

  /**
   * Renders the arc onto the SVG element. Proxies `getArc` while setting the proper
   * DOM attribute on the `<path>`.
   */
  private _renderArc(currentValue: number, rotation = 0) {
    if (this._path) {
      const svgArc = getSvgArc(currentValue, rotation, this.strokeWidth);
      this._renderer.setAttribute(this._path.nativeElement, 'd', svgArc);
    }
  }
}


/**
 * <mat-spinner> component.
 *
 * This is a component definition to be used as a convenience reference to create an
 * indeterminate <mat-progress-spinner> instance.
 */
@Component({
  moduleId: module.id,
  selector: 'mat-spinner',
  host: {
    'role': 'progressbar',
    'mode': 'indeterminate',
    'class': 'mat-spinner mat-progress-spinner',
  },
  inputs: ['color'],
  templateUrl: 'progress-spinner.html',
  styleUrls: ['progress-spinner.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
})
export class MatSpinner extends MatProgressSpinner {
  constructor(elementRef: ElementRef, ngZone: NgZone, renderer: Renderer2) {
    super(renderer, elementRef, ngZone);
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
 * @param strokeWidth Stroke width of the progress spinner arc.
 * @return A string for an SVG path representing a circle filled from the starting point to the
 *    percentage value provided.
 */
function getSvgArc(currentValue: number, rotation: number, strokeWidth: number): string {
  let startPoint = rotation || 0;
  let radius = 50;
  let pathRadius = radius - strokeWidth;

  let startAngle = startPoint * MAX_ANGLE;
  let endAngle = currentValue * MAX_ANGLE;
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
