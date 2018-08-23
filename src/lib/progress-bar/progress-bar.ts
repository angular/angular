/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  Inject,
  Input,
  Optional,
  ViewEncapsulation,
  InjectionToken
} from '@angular/core';
import {ANIMATION_MODULE_TYPE} from '@angular/platform-browser/animations';
import {CanColor, mixinColor} from '@angular/material/core';

// TODO(josephperrott): Benchpress tests.
// TODO(josephperrott): Add ARIA attributes for progress bar "for".

// Boilerplate for applying mixins to MatProgressBar.
/** @docs-private */
export class MatProgressBarBase {
  constructor(public _elementRef: ElementRef) { }
}

export const _MatProgressBarMixinBase = mixinColor(MatProgressBarBase, 'primary');

/**
 * Injection token used to provide the current location to `MatProgressBar`.
 * Used to handle server-side rendering and to stub out during unit tests.
 * @docs-private
 */
export const MAT_PROGRESS_BAR_LOCATION = new InjectionToken<MatProgressBarLocation>(
  'mat-progress-bar-location',
  {providedIn: 'root', factory: MAT_PROGRESS_BAR_LOCATION_FACTORY}
);

/**
 * Stubbed out location for `MatProgressBar`.
 * @docs-private
 */
export interface MatProgressBarLocation {
  pathname: string;
}

/** @docs-private */
export function MAT_PROGRESS_BAR_LOCATION_FACTORY(): MatProgressBarLocation {
  return typeof window !== 'undefined' ? window.location : {pathname: ''};
}


/** Counter used to generate unique IDs for progress bars. */
let progressbarId = 0;

/**
 * `<mat-progress-bar>` component.
 */
@Component({
  moduleId: module.id,
  selector: 'mat-progress-bar',
  exportAs: 'matProgressBar',
  host: {
    'role': 'progressbar',
    'aria-valuemin': '0',
    'aria-valuemax': '100',
    '[attr.aria-valuenow]': 'value',
    '[attr.mode]': 'mode',
    'class': 'mat-progress-bar',
    '[class._mat-animation-noopable]': `_animationMode === 'NoopAnimations'`,
  },
  inputs: ['color'],
  templateUrl: 'progress-bar.html',
  styleUrls: ['progress-bar.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MatProgressBar extends _MatProgressBarMixinBase implements CanColor {
  constructor(public _elementRef: ElementRef,
              @Optional() @Inject(ANIMATION_MODULE_TYPE) public _animationMode?: string,
              /**
               * @deprecated `location` parameter to be made required.
               * @breaking-change 8.0.0
               */
              @Optional() @Inject(MAT_PROGRESS_BAR_LOCATION) location?: MatProgressBarLocation) {
    super(_elementRef);

    // We need to prefix the SVG reference with the current path, otherwise they won't work
    // in Safari if the page has a `<base>` tag. Note that we need quotes inside the `url()`,
    // because named route URLs can contain parentheses (see #12338). Also we don't use
    // `Location` from `@angular/common` since we can't tell the difference between whether
    // the consumer is using the hash location strategy or not, because `Location` normalizes
    // both `/#/foo/bar` and `/foo/bar` to the same thing.
    const path = location && location.pathname ? location.pathname.split('#')[0] : '';
    this._rectangleFillValue = `url('${path}#${this.progressbarId}')`;
  }

  /** Value of the progress bar. Defaults to zero. Mirrored to aria-valuenow. */
  @Input()
  get value(): number { return this._value; }
  set value(v: number) { this._value = clamp(v || 0); }
  private _value: number = 0;

  /** Buffer value of the progress bar. Defaults to zero. */
  @Input()
  get bufferValue(): number { return this._bufferValue; }
  set bufferValue(v: number) { this._bufferValue = clamp(v || 0); }
  private _bufferValue: number = 0;

  /**
   * Mode of the progress bar.
   *
   * Input must be one of these values: determinate, indeterminate, buffer, query, defaults to
   * 'determinate'.
   * Mirrored to mode attribute.
   */
  @Input() mode: 'determinate' | 'indeterminate' | 'buffer' | 'query' = 'determinate';

  /** ID of the progress bar. */
  progressbarId = `mat-progress-bar-${progressbarId++}`;

  /** Attribute to be used for the `fill` attribute on the internal `rect` element. */
  _rectangleFillValue: string;

  /** Gets the current transform value for the progress bar's primary indicator. */
  _primaryTransform() {
    const scale = this.value / 100;
    return {transform: `scaleX(${scale})`};
  }

  /**
   * Gets the current transform value for the progress bar's buffer indicator. Only used if the
   * progress mode is set to buffer, otherwise returns an undefined, causing no transformation.
   */
  _bufferTransform() {
    if (this.mode === 'buffer') {
      const scale = this.bufferValue / 100;
      return {transform: `scaleX(${scale})`};
    }
  }
}

/** Clamps a value to be between two numbers, by default 0 and 100. */
function clamp(v: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, v));
}
