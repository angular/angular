/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {coerceNumberProperty} from '@angular/cdk/coercion';
import {Platform} from '@angular/cdk/platform';
import {DOCUMENT} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  InjectionToken,
  Input,
  Optional,
  ViewEncapsulation,
} from '@angular/core';
import {CanColor, CanColorCtor, mixinColor} from '@angular/material/core';
import {ANIMATION_MODULE_TYPE} from '@angular/platform-browser/animations';


/** Possible mode for a progress spinner. */
export type ProgressSpinnerMode = 'determinate' | 'indeterminate';

/**
 * Base reference size of the spinner.
 * @docs-private
 */
const BASE_SIZE = 100;

/**
 * Base reference stroke width of the spinner.
 * @docs-private
 */
const BASE_STROKE_WIDTH = 10;

// Boilerplate for applying mixins to MatProgressSpinner.
/** @docs-private */
export class MatProgressSpinnerBase {
  constructor(public _elementRef: ElementRef) {}
}
export const _MatProgressSpinnerMixinBase: CanColorCtor & typeof MatProgressSpinnerBase =
    mixinColor(MatProgressSpinnerBase, 'primary');

/** Default `mat-progress-spinner` options that can be overridden. */
export interface MatProgressSpinnerDefaultOptions {
  /** Diameter of the spinner. */
  diameter?: number;
  /** Width of the spinner's stroke. */
  strokeWidth?: number;
  /**
   * Whether the animations should be force to be enabled, ignoring if the current environment is
   * using NoopAnimationsModule.
   */
  _forceAnimations?: boolean;
}

/** Injection token to be used to override the default options for `mat-progress-spinner`. */
export const MAT_PROGRESS_SPINNER_DEFAULT_OPTIONS =
    new InjectionToken<MatProgressSpinnerDefaultOptions>('mat-progress-spinner-default-options', {
      providedIn: 'root',
      factory: MAT_PROGRESS_SPINNER_DEFAULT_OPTIONS_FACTORY,
    });

/** @docs-private */
export function MAT_PROGRESS_SPINNER_DEFAULT_OPTIONS_FACTORY(): MatProgressSpinnerDefaultOptions {
  return {diameter: BASE_SIZE};
}

// .0001 percentage difference is necessary in order to avoid unwanted animation frames
// for example because the animation duration is 4 seconds, .1% accounts to 4ms
// which are enough to see the flicker described in
// https://github.com/angular/material2/issues/8984
const INDETERMINATE_ANIMATION_TEMPLATE = `
 @keyframes mat-progress-spinner-stroke-rotate-DIAMETER {
    0%      { stroke-dashoffset: START_VALUE;  transform: rotate(0); }
    12.5%   { stroke-dashoffset: END_VALUE;    transform: rotate(0); }
    12.5001%  { stroke-dashoffset: END_VALUE;    transform: rotateX(180deg) rotate(72.5deg); }
    25%     { stroke-dashoffset: START_VALUE;  transform: rotateX(180deg) rotate(72.5deg); }

    25.0001%   { stroke-dashoffset: START_VALUE;  transform: rotate(270deg); }
    37.5%   { stroke-dashoffset: END_VALUE;    transform: rotate(270deg); }
    37.5001%  { stroke-dashoffset: END_VALUE;    transform: rotateX(180deg) rotate(161.5deg); }
    50%     { stroke-dashoffset: START_VALUE;  transform: rotateX(180deg) rotate(161.5deg); }

    50.0001%  { stroke-dashoffset: START_VALUE;  transform: rotate(180deg); }
    62.5%   { stroke-dashoffset: END_VALUE;    transform: rotate(180deg); }
    62.5001%  { stroke-dashoffset: END_VALUE;    transform: rotateX(180deg) rotate(251.5deg); }
    75%     { stroke-dashoffset: START_VALUE;  transform: rotateX(180deg) rotate(251.5deg); }

    75.0001%  { stroke-dashoffset: START_VALUE;  transform: rotate(90deg); }
    87.5%   { stroke-dashoffset: END_VALUE;    transform: rotate(90deg); }
    87.5001%  { stroke-dashoffset: END_VALUE;    transform: rotateX(180deg) rotate(341.5deg); }
    100%    { stroke-dashoffset: START_VALUE;  transform: rotateX(180deg) rotate(341.5deg); }
  }
`;

/**
 * `<mat-progress-spinner>` component.
 */
@Component({
  moduleId: module.id,
  selector: 'mat-progress-spinner',
  exportAs: 'matProgressSpinner',
  host: {
    'role': 'progressbar',
    'class': 'mat-progress-spinner',
    '[class._mat-animation-noopable]': `_noopAnimations`,
    '[style.width.px]': 'diameter',
    '[style.height.px]': 'diameter',
    '[attr.aria-valuemin]': 'mode === "determinate" ? 0 : null',
    '[attr.aria-valuemax]': 'mode === "determinate" ? 100 : null',
    '[attr.aria-valuenow]': 'mode === "determinate" ? value : null',
    '[attr.mode]': 'mode',
  },
  inputs: ['color'],
  templateUrl: 'progress-spinner.html',
  styleUrls: ['progress-spinner.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MatProgressSpinner extends _MatProgressSpinnerMixinBase implements CanColor {

  private _value = 0;
  private _strokeWidth: number;
  private _fallbackAnimation = false;

  /** Tracks diameters of existing instances to de-dupe generated styles (default d = 100) */
  private static diameters = new Set<number>([BASE_SIZE]);

  /**
   * Used for storing all of the generated keyframe animations.
   * @dynamic
   */
  private static styleTag: HTMLStyleElement|null = null;

  /** Whether the _mat-animation-noopable class should be applied, disabling animations.  */
  _noopAnimations: boolean = this.animationMode === 'NoopAnimations' && (
      !!this.defaults && !this.defaults._forceAnimations);

  /** The diameter of the progress spinner (will set width and height of svg). */
  @Input()
  get diameter(): number { return this._diameter; }
  set diameter(size: number) {
    this._diameter = coerceNumberProperty(size);

    if (!this._fallbackAnimation && !MatProgressSpinner.diameters.has(this._diameter)) {
      this._attachStyleNode();
    }
  }
  private _diameter = BASE_SIZE;

  /** Stroke width of the progress spinner. */
  @Input()
  get strokeWidth(): number {
    return this._strokeWidth || this.diameter / 10;
  }
  set strokeWidth(value: number) {
    this._strokeWidth = coerceNumberProperty(value);
  }

  /** Mode of the progress circle */
  @Input() mode: ProgressSpinnerMode = 'determinate';

  /** Value of the progress circle. */
  @Input()
  get value(): number {
    return this.mode === 'determinate' ? this._value : 0;
  }
  set value(newValue: number) {
    this._value = Math.max(0, Math.min(100, coerceNumberProperty(newValue)));
  }

  constructor(public _elementRef: ElementRef,
              platform: Platform,
              @Optional() @Inject(DOCUMENT) private _document: any,
              // @breaking-change 8.0.0 animationMode and defaults parameters to be made required.
              @Optional() @Inject(ANIMATION_MODULE_TYPE) private animationMode?: string,
              @Inject(MAT_PROGRESS_SPINNER_DEFAULT_OPTIONS)
                  private defaults?: MatProgressSpinnerDefaultOptions) {

    super(_elementRef);
    this._fallbackAnimation = platform.EDGE || platform.TRIDENT;

    if (defaults) {
      if (defaults.diameter) {
        this.diameter = defaults.diameter;
      }

      if (defaults.strokeWidth) {
        this.strokeWidth = defaults.strokeWidth;
      }
    }

    // On IE and Edge, we can't animate the `stroke-dashoffset`
    // reliably so we fall back to a non-spec animation.
    const animationClass =
      `mat-progress-spinner-indeterminate${this._fallbackAnimation ? '-fallback' : ''}-animation`;

    _elementRef.nativeElement.classList.add(animationClass);
  }

  /** The radius of the spinner, adjusted for stroke width. */
  get _circleRadius() {
    return (this.diameter - BASE_STROKE_WIDTH) / 2;
  }

  /** The view box of the spinner's svg element. */
  get _viewBox() {
    const viewBox = this._circleRadius * 2 + this.strokeWidth;
    return `0 0 ${viewBox} ${viewBox}`;
  }

  /** The stroke circumference of the svg circle. */
  get _strokeCircumference(): number {
    return 2 * Math.PI * this._circleRadius;
  }

  /** The dash offset of the svg circle. */
  get _strokeDashOffset() {
    if (this.mode === 'determinate') {
      return this._strokeCircumference * (100 - this._value) / 100;
    }

    // In fallback mode set the circle to 80% and rotate it with CSS.
    if (this._fallbackAnimation && this.mode === 'indeterminate') {
      return this._strokeCircumference * 0.2;
    }

    return null;
  }

  /** Stroke width of the circle in percent. */
  get _circleStrokeWidth() {
    return this.strokeWidth / this.diameter * 100;
  }

  /** Dynamically generates a style tag containing the correct animation for this diameter. */
  private _attachStyleNode(): void {
    let styleTag = MatProgressSpinner.styleTag;

    if (!styleTag) {
      styleTag = this._document.createElement('style');
      this._document.head.appendChild(styleTag);
      MatProgressSpinner.styleTag = styleTag;
    }

    if (styleTag && styleTag.sheet) {
      (styleTag.sheet as CSSStyleSheet).insertRule(this._getAnimationText(), 0);
    }

    MatProgressSpinner.diameters.add(this.diameter);
  }

  /** Generates animation styles adjusted for the spinner's diameter. */
  private _getAnimationText(): string {
    return INDETERMINATE_ANIMATION_TEMPLATE
        // Animation should begin at 5% and end at 80%
        .replace(/START_VALUE/g, `${0.95 * this._strokeCircumference}`)
        .replace(/END_VALUE/g, `${0.2 * this._strokeCircumference}`)
        .replace(/DIAMETER/g, `${this.diameter}`);
  }
}


/**
 * `<mat-spinner>` component.
 *
 * This is a component definition to be used as a convenience reference to create an
 * indeterminate `<mat-progress-spinner>` instance.
 */
@Component({
  moduleId: module.id,
  selector: 'mat-spinner',
  host: {
    'role': 'progressbar',
    'mode': 'indeterminate',
    'class': 'mat-spinner mat-progress-spinner',
    '[class._mat-animation-noopable]': `_noopAnimations`,
    '[style.width.px]': 'diameter',
    '[style.height.px]': 'diameter',
  },
  inputs: ['color'],
  templateUrl: 'progress-spinner.html',
  styleUrls: ['progress-spinner.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MatSpinner extends MatProgressSpinner {
  constructor(elementRef: ElementRef, platform: Platform,
              @Optional() @Inject(DOCUMENT) document: any,
              // @breaking-change 8.0.0 animationMode and defaults parameters to be made required.
              @Optional() @Inject(ANIMATION_MODULE_TYPE) animationMode?: string,
              @Inject(MAT_PROGRESS_SPINNER_DEFAULT_OPTIONS)
                  defaults?: MatProgressSpinnerDefaultOptions) {
    super(elementRef, platform, document, animationMode, defaults);
    this.mode = 'indeterminate';
  }
}
