/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  Input,
  OnDestroy,
  Optional,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  MDCCircularProgressAdapter,
  MDCCircularProgressFoundation,
} from '@material/circular-progress';
import {CanColor, mixinColor} from '@angular/material-experimental/mdc-core';
import {ANIMATION_MODULE_TYPE} from '@angular/platform-browser/animations';
import {
  MAT_PROGRESS_SPINNER_DEFAULT_OPTIONS,
  MatProgressSpinnerDefaultOptions,
} from '@angular/material/progress-spinner';
import {coerceNumberProperty, NumberInput} from '@angular/cdk/coercion';

// Boilerplate for applying mixins to MatProgressBar.
const _MatProgressSpinnerBase = mixinColor(
  class {
    constructor(public _elementRef: ElementRef) {}
  },
  'primary',
);

/** Possible mode for a progress spinner. */
export type ProgressSpinnerMode = 'determinate' | 'indeterminate';

/**
 * Base reference size of the spinner.
 */
const BASE_SIZE = 100;

/**
 * Base reference stroke width of the spinner.
 */
const BASE_STROKE_WIDTH = 10;

@Component({
  selector: 'mat-progress-spinner, mat-spinner',
  exportAs: 'matProgressSpinner',
  host: {
    'role': 'progressbar',
    'class': 'mat-mdc-progress-spinner mdc-circular-progress',
    // set tab index to -1 so screen readers will read the aria-label
    // Note: there is a known issue with JAWS that does not read progressbar aria labels on FireFox
    'tabindex': '-1',
    '[class._mat-animation-noopable]': `_noopAnimations`,
    '[style.width.px]': 'diameter',
    '[style.height.px]': 'diameter',
    '[attr.aria-valuemin]': '0',
    '[attr.aria-valuemax]': '100',
    '[attr.aria-valuenow]': 'mode === "determinate" ? value : null',
    '[attr.mode]': 'mode',
  },
  inputs: ['color'],
  templateUrl: 'progress-spinner.html',
  styleUrls: ['progress-spinner.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MatProgressSpinner
  extends _MatProgressSpinnerBase
  implements AfterViewInit, OnDestroy, CanColor
{
  /** Whether the _mat-animation-noopable class should be applied, disabling animations.  */
  _noopAnimations: boolean;

  /** Implements all of the logic of the MDC circular progress. */
  _foundation: MDCCircularProgressFoundation;

  /** The element of the determinate spinner. */
  @ViewChild('determinateSpinner') _determinateCircle: ElementRef<HTMLElement>;

  /** Adapter used by MDC to interact with the DOM. */
  // TODO: switch to class when MDC removes object spread in foundation
  // https://github.com/material-components/material-components-web/pull/6256
  private _adapter: MDCCircularProgressAdapter = {
    addClass: (className: string) => this._elementRef.nativeElement.classList.add(className),
    hasClass: (className: string) => this._elementRef.nativeElement.classList.contains(className),
    removeClass: (className: string) => this._elementRef.nativeElement.classList.remove(className),
    removeAttribute: (name: string) => this._elementRef.nativeElement.removeAttribute(name),
    setAttribute: (name, value) => {
      if (name !== 'aria-valuenow') {
        // MDC deals with values between 0 and 1 but Angular Material deals with values between
        // 0 and 100 so the aria-valuenow should be set through the attr binding in the host
        // instead of by the MDC adapter
        this._elementRef.nativeElement.setAttribute(name, value);
      }
    },
    getDeterminateCircleAttribute: (attributeName: string) =>
      this._determinateCircle.nativeElement.getAttribute(attributeName),
    setDeterminateCircleAttribute: (attributeName: string, value: string) =>
      this._determinateCircle.nativeElement.setAttribute(attributeName, value),
  };

  constructor(
    elementRef: ElementRef<HTMLElement>,
    @Optional() @Inject(ANIMATION_MODULE_TYPE) animationMode: string,
    @Inject(MAT_PROGRESS_SPINNER_DEFAULT_OPTIONS)
    defaults?: MatProgressSpinnerDefaultOptions,
  ) {
    super(elementRef);
    this._noopAnimations =
      animationMode === 'NoopAnimations' && !!defaults && !defaults._forceAnimations;

    if (defaults) {
      if (defaults.color) {
        this.color = this.defaultColor = defaults.color;
      }

      if (defaults.diameter) {
        this.diameter = defaults.diameter;
      }

      if (defaults.strokeWidth) {
        this.strokeWidth = defaults.strokeWidth;
      }
    }
  }

  private _mode: ProgressSpinnerMode =
    this._elementRef.nativeElement.nodeName.toLowerCase() === 'mat-spinner'
      ? 'indeterminate'
      : 'determinate';

  /**
   * Mode of the progress bar.
   *
   * Input must be one of these values: determinate, indeterminate, buffer, query, defaults to
   * 'determinate'.
   * Mirrored to mode attribute.
   */
  @Input()
  get mode(): ProgressSpinnerMode {
    return this._mode;
  }

  set mode(value: ProgressSpinnerMode) {
    this._mode = value;
    this._syncFoundation();
  }

  private _value = 0;

  /** Value of the progress bar. Defaults to zero. Mirrored to aria-valuenow. */
  @Input()
  get value(): number {
    return this.mode === 'determinate' ? this._value : 0;
  }

  set value(v: NumberInput) {
    this._value = Math.max(0, Math.min(100, coerceNumberProperty(v)));
    this._syncFoundation();
  }

  private _diameter = BASE_SIZE;

  /** The diameter of the progress spinner (will set width and height of svg). */
  @Input()
  get diameter(): number {
    return this._diameter;
  }

  set diameter(size: NumberInput) {
    this._diameter = coerceNumberProperty(size);
    this._syncFoundation();
  }

  private _strokeWidth: number;

  /** Stroke width of the progress spinner. */
  @Input()
  get strokeWidth(): number {
    return this._strokeWidth ?? this.diameter / 10;
  }

  set strokeWidth(value: NumberInput) {
    this._strokeWidth = coerceNumberProperty(value);
  }

  /** The radius of the spinner, adjusted for stroke width. */
  _circleRadius(): number {
    return (this.diameter - BASE_STROKE_WIDTH) / 2;
  }

  /** The view box of the spinner's svg element. */
  _viewBox() {
    const viewBox = this._circleRadius() * 2 + this.strokeWidth;
    return `0 0 ${viewBox} ${viewBox}`;
  }

  /** The stroke circumference of the svg circle. */
  _strokeCircumference(): number {
    return 2 * Math.PI * this._circleRadius();
  }

  /** The dash offset of the svg circle. */
  _strokeDashOffset() {
    if (this.mode === 'determinate') {
      return (this._strokeCircumference() * (100 - this._value)) / 100;
    }
    return null;
  }

  /** Stroke width of the circle in percent. */
  _circleStrokeWidth() {
    return (this.strokeWidth / this.diameter) * 100;
  }

  ngAfterViewInit() {
    this._foundation = new MDCCircularProgressFoundation(this._adapter);
    this._foundation.init();
    this._syncFoundation();
  }

  ngOnDestroy() {
    if (this._foundation) {
      this._foundation.destroy();
    }
  }

  /** Syncs the state of the progress spinner with the MDC foundation. */
  private _syncFoundation() {
    const foundation = this._foundation;

    if (foundation) {
      const mode = this.mode;
      foundation.setProgress(this.value / 100);
      foundation.setDeterminate(mode === 'determinate');
    }
  }
}

/**
 * `<mat-spinner>` component.
 *
 * This is a component definition to be used as a convenience reference to create an
 * indeterminate `<mat-progress-spinner>` instance.
 */
// tslint:disable-next-line:variable-name
export const MatSpinner = MatProgressSpinner;
