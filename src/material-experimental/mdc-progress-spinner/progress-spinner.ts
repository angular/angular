/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  Input,
  Optional,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {CanColor, mixinColor} from '@angular/material/core';
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
    '[class.mdc-circular-progress--indeterminate]': 'mode === "indeterminate"',
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
export class MatProgressSpinner extends _MatProgressSpinnerBase implements CanColor {
  /** Whether the _mat-animation-noopable class should be applied, disabling animations.  */
  _noopAnimations: boolean;

  /** The element of the determinate spinner. */
  @ViewChild('determinateSpinner') _determinateCircle: ElementRef<HTMLElement>;

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

  /**
   * Mode of the progress bar.
   *
   * Input must be one of these values: determinate, indeterminate, buffer, query, defaults to
   * 'determinate'.
   * Mirrored to mode attribute.
   */
  @Input() mode: ProgressSpinnerMode =
    this._elementRef.nativeElement.nodeName.toLowerCase() === 'mat-spinner'
      ? 'indeterminate'
      : 'determinate';

  /** Value of the progress bar. Defaults to zero. Mirrored to aria-valuenow. */
  @Input()
  get value(): number {
    return this.mode === 'determinate' ? this._value : 0;
  }
  set value(v: NumberInput) {
    this._value = Math.max(0, Math.min(100, coerceNumberProperty(v)));
  }
  private _value = 0;

  /** The diameter of the progress spinner (will set width and height of svg). */
  @Input()
  get diameter(): number {
    return this._diameter;
  }
  set diameter(size: NumberInput) {
    this._diameter = coerceNumberProperty(size);
  }
  private _diameter = BASE_SIZE;

  /** Stroke width of the progress spinner. */
  @Input()
  get strokeWidth(): number {
    return this._strokeWidth ?? this.diameter / 10;
  }
  set strokeWidth(value: NumberInput) {
    this._strokeWidth = coerceNumberProperty(value);
  }
  private _strokeWidth: number;

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
}

/**
 * `<mat-spinner>` component.
 *
 * This is a component definition to be used as a convenience reference to create an
 * indeterminate `<mat-progress-spinner>` instance.
 */
// tslint:disable-next-line:variable-name
export const MatSpinner = MatProgressSpinner;
