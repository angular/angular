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
  Input,
  ElementRef,
  SimpleChanges,
  OnChanges,
  ViewEncapsulation,
  Optional,
  Inject,
} from '@angular/core';
import {CanColor, mixinColor} from '@angular/material/core';
import {Platform} from '@angular/cdk/platform';
import {DOCUMENT} from '@angular/common';
import {coerceNumberProperty} from '@angular/cdk/coercion';

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
export const _MatProgressSpinnerMixinBase = mixinColor(MatProgressSpinnerBase, 'primary');

const INDETERMINATE_ANIMATION_TEMPLATE = `
 @keyframes mat-progress-spinner-stroke-rotate-DIAMETER {
    0%      { stroke-dashoffset: START_VALUE;  transform: rotate(0); }
    12.5%   { stroke-dashoffset: END_VALUE;    transform: rotate(0); }
    12.51%  { stroke-dashoffset: END_VALUE;    transform: rotateX(180deg) rotate(72.5deg); }
    25%     { stroke-dashoffset: START_VALUE;  transform: rotateX(180deg) rotate(72.5deg); }

    25.1%   { stroke-dashoffset: START_VALUE;  transform: rotate(270deg); }
    37.5%   { stroke-dashoffset: END_VALUE;    transform: rotate(270deg); }
    37.51%  { stroke-dashoffset: END_VALUE;    transform: rotateX(180deg) rotate(161.5deg); }
    50%     { stroke-dashoffset: START_VALUE;  transform: rotateX(180deg) rotate(161.5deg); }

    50.01%  { stroke-dashoffset: START_VALUE;  transform: rotate(180deg); }
    62.5%   { stroke-dashoffset: END_VALUE;    transform: rotate(180deg); }
    62.51%  { stroke-dashoffset: END_VALUE;    transform: rotateX(180deg) rotate(251.5deg); }
    75%     { stroke-dashoffset: START_VALUE;  transform: rotateX(180deg) rotate(251.5deg); }

    75.01%  { stroke-dashoffset: START_VALUE;  transform: rotate(90deg); }
    87.5%   { stroke-dashoffset: END_VALUE;    transform: rotate(90deg); }
    87.51%  { stroke-dashoffset: END_VALUE;    transform: rotateX(180deg) rotate(341.5deg); }
    100%    { stroke-dashoffset: START_VALUE;  transform: rotateX(180deg) rotate(341.5deg); }
  }
`;

/**
 * <mat-progress-spinner> component.
 */
@Component({
  moduleId: module.id,
  selector: 'mat-progress-spinner',
  exportAs: 'matProgressSpinner',
  host: {
    'role': 'progressbar',
    'class': 'mat-progress-spinner',
    '[style.width.px]': '_elementSize',
    '[style.height.px]': '_elementSize',
    '[attr.aria-valuemin]': 'mode === "determinate" ? 0 : null',
    '[attr.aria-valuemax]': 'mode === "determinate" ? 100 : null',
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
export class MatProgressSpinner extends _MatProgressSpinnerMixinBase implements CanColor,
  OnChanges {

  private _value = 0;
  private _strokeWidth: number;
  private _fallbackAnimation = false;

  /** The width and height of the host element. Will grow with stroke width. **/
  _elementSize = BASE_SIZE;

  /** Tracks diameters of existing instances to de-dupe generated styles (default d = 100) */
  private static diameters = new Set<number>([BASE_SIZE]);

  /**
   * Used for storing all of the generated keyframe animations.
   * @dynamic
   */
  private static styleTag: HTMLStyleElement|null = null;

  /** The diameter of the progress spinner (will set width and height of svg). */
  @Input()
  get diameter(): number {
    return this._diameter;
  }
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
              @Optional() @Inject(DOCUMENT) private _document: any) {

    super(_elementRef);
    this._fallbackAnimation = platform.EDGE || platform.TRIDENT;

    // On IE and Edge, we can't animate the `stroke-dashoffset`
    // reliably so we fall back to a non-spec animation.
    const animationClass =
      `mat-progress-spinner-indeterminate${this._fallbackAnimation ? '-fallback' : ''}-animation`;

    _elementRef.nativeElement.classList.add(animationClass);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.strokeWidth || changes.diameter) {
      this._elementSize = this._diameter + Math.max(this.strokeWidth - BASE_STROKE_WIDTH, 0);
    }
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
    return this.strokeWidth / this._elementSize * 100;
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
    '[style.width.px]': '_elementSize',
    '[style.height.px]': '_elementSize',
  },
  inputs: ['color'],
  templateUrl: 'progress-spinner.html',
  styleUrls: ['progress-spinner.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
})
export class MatSpinner extends MatProgressSpinner {
  constructor(elementRef: ElementRef, platform: Platform,
              @Optional() @Inject(DOCUMENT) document: any) {
    super(elementRef, platform, document);
    this.mode = 'indeterminate';
  }
}
