/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {coerceNumberProperty, NumberInput} from '@angular/cdk/coercion';
import {Platform, _getShadowRoot} from '@angular/cdk/platform';
import {ViewportRuler} from '@angular/cdk/scrolling';
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
  OnInit,
  ChangeDetectorRef,
  OnDestroy,
  NgZone,
} from '@angular/core';
import {CanColor, mixinColor, ThemePalette} from '@angular/material/core';
import {ANIMATION_MODULE_TYPE} from '@angular/platform-browser/animations';
import {Subscription} from 'rxjs';

/** Possible mode for a progress spinner. */
export type LegacyProgressSpinnerMode = 'determinate' | 'indeterminate';

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

// Boilerplate for applying mixins to MatLegacyProgressSpinner.
/** @docs-private */
const _MatProgressSpinnerBase = mixinColor(
  class {
    constructor(public _elementRef: ElementRef) {}
  },
  'primary',
);

/** Default `mat-progress-spinner` options that can be overridden. */
export interface MatLegacyProgressSpinnerDefaultOptions {
  /** Default color of the spinner. */
  color?: ThemePalette;
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
export const MAT_LEGACY_PROGRESS_SPINNER_DEFAULT_OPTIONS =
  new InjectionToken<MatLegacyProgressSpinnerDefaultOptions>(
    'mat-progress-spinner-default-options',
    {
      providedIn: 'root',
      factory: MAT_LEGACY_PROGRESS_SPINNER_DEFAULT_OPTIONS_FACTORY,
    },
  );

/** @docs-private */
export function MAT_LEGACY_PROGRESS_SPINNER_DEFAULT_OPTIONS_FACTORY(): MatLegacyProgressSpinnerDefaultOptions {
  return {diameter: BASE_SIZE};
}

// .0001 percentage difference is necessary in order to avoid unwanted animation frames
// for example because the animation duration is 4 seconds, .1% accounts to 4ms
// which are enough to see the flicker described in
// https://github.com/angular/components/issues/8984
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
  selector: 'mat-progress-spinner, mat-spinner',
  exportAs: 'matProgressSpinner',
  host: {
    'role': 'progressbar',
    // `mat-spinner` is here for backward compatibility.
    'class': 'mat-progress-spinner mat-spinner',
    // set tab index to -1 so screen readers will read the aria-label
    // Note: there is a known issue with JAWS that does not read progressbar aria labels on FireFox
    'tabindex': '-1',
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
export class MatLegacyProgressSpinner
  extends _MatProgressSpinnerBase
  implements OnInit, OnDestroy, CanColor
{
  private _diameter = BASE_SIZE;
  private _value = 0;
  private _strokeWidth: number;
  private _resizeSubscription = Subscription.EMPTY;

  /**
   * Element to which we should add the generated style tags for the indeterminate animation.
   * For most elements this is the document, but for the ones in the Shadow DOM we need to
   * use the shadow root.
   */
  private _styleRoot: Node;

  /**
   * Tracks diameters of existing instances to de-dupe generated styles (default d = 100).
   * We need to keep track of which elements the diameters were attached to, because for
   * elements in the Shadow DOM the style tags are attached to the shadow root, rather
   * than the document head.
   */
  private static _diameters = new WeakMap<Node, Set<number>>();

  /** Whether the _mat-animation-noopable class should be applied, disabling animations.  */
  _noopAnimations: boolean;

  /** A string that is used for setting the spinner animation-name CSS property */
  _spinnerAnimationLabel: string;

  /** The diameter of the progress spinner (will set width and height of svg). */
  @Input()
  get diameter(): number {
    return this._diameter;
  }
  set diameter(size: NumberInput) {
    this._diameter = coerceNumberProperty(size);
    this._spinnerAnimationLabel = this._getSpinnerAnimationLabel();

    // If this is set before `ngOnInit`, the style root may not have been resolved yet.
    if (this._styleRoot) {
      this._attachStyleNode();
    }
  }

  /** Stroke width of the progress spinner. */
  @Input()
  get strokeWidth(): number {
    return this._strokeWidth || this.diameter / 10;
  }
  set strokeWidth(value: NumberInput) {
    this._strokeWidth = coerceNumberProperty(value);
  }

  /** Mode of the progress circle */
  @Input() mode: LegacyProgressSpinnerMode = 'determinate';

  /** Value of the progress circle. */
  @Input()
  get value(): number {
    return this.mode === 'determinate' ? this._value : 0;
  }
  set value(newValue: NumberInput) {
    this._value = Math.max(0, Math.min(100, coerceNumberProperty(newValue)));
  }

  constructor(
    elementRef: ElementRef<HTMLElement>,
    _platform: Platform,
    @Optional() @Inject(DOCUMENT) private _document: any,
    @Optional() @Inject(ANIMATION_MODULE_TYPE) animationMode: string,
    @Inject(MAT_LEGACY_PROGRESS_SPINNER_DEFAULT_OPTIONS)
    defaults?: MatLegacyProgressSpinnerDefaultOptions,
    /**
     * @deprecated `changeDetectorRef`, `viewportRuler` and `ngZone`
     * parameters to become required.
     * @breaking-change 14.0.0
     */
    changeDetectorRef?: ChangeDetectorRef,
    viewportRuler?: ViewportRuler,
    ngZone?: NgZone,
  ) {
    super(elementRef);

    const trackedDiameters = MatLegacyProgressSpinner._diameters;
    this._spinnerAnimationLabel = this._getSpinnerAnimationLabel();

    // The base size is already inserted via the component's structural styles. We still
    // need to track it so we don't end up adding the same styles again.
    if (!trackedDiameters.has(_document.head)) {
      trackedDiameters.set(_document.head, new Set<number>([BASE_SIZE]));
    }

    this._noopAnimations =
      animationMode === 'NoopAnimations' && !!defaults && !defaults._forceAnimations;

    if (elementRef.nativeElement.nodeName.toLowerCase() === 'mat-spinner') {
      this.mode = 'indeterminate';
    }

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

    // Safari has an issue where the circle isn't positioned correctly when the page has a
    // different zoom level from the default. This handler triggers a recalculation of the
    // `transform-origin` when the page zoom level changes.
    // See `_getCircleTransformOrigin` for more info.
    // @breaking-change 14.0.0 Remove null checks for `_changeDetectorRef`,
    // `viewportRuler` and `ngZone`.
    if (_platform.isBrowser && _platform.SAFARI && viewportRuler && changeDetectorRef && ngZone) {
      this._resizeSubscription = viewportRuler.change(150).subscribe(() => {
        // When the window is resize while the spinner is in `indeterminate` mode, we
        // have to mark for check so the transform origin of the circle can be recomputed.
        if (this.mode === 'indeterminate') {
          ngZone.run(() => changeDetectorRef.markForCheck());
        }
      });
    }
  }

  ngOnInit() {
    const element = this._elementRef.nativeElement;

    // Note that we need to look up the root node in ngOnInit, rather than the constructor, because
    // Angular seems to create the element outside the shadow root and then moves it inside, if the
    // node is inside an `ngIf` and a ShadowDom-encapsulated component.
    this._styleRoot = _getShadowRoot(element) || this._document.head;
    this._attachStyleNode();
    element.classList.add('mat-progress-spinner-indeterminate-animation');
  }

  ngOnDestroy() {
    this._resizeSubscription.unsubscribe();
  }

  /** The radius of the spinner, adjusted for stroke width. */
  _getCircleRadius() {
    return (this.diameter - BASE_STROKE_WIDTH) / 2;
  }

  /** The view box of the spinner's svg element. */
  _getViewBox() {
    const viewBox = this._getCircleRadius() * 2 + this.strokeWidth;
    return `0 0 ${viewBox} ${viewBox}`;
  }

  /** The stroke circumference of the svg circle. */
  _getStrokeCircumference(): number {
    return 2 * Math.PI * this._getCircleRadius();
  }

  /** The dash offset of the svg circle. */
  _getStrokeDashOffset() {
    if (this.mode === 'determinate') {
      return (this._getStrokeCircumference() * (100 - this._value)) / 100;
    }

    return null;
  }

  /** Stroke width of the circle in percent. */
  _getCircleStrokeWidth() {
    return (this.strokeWidth / this.diameter) * 100;
  }

  /** Gets the `transform-origin` for the inner circle element. */
  _getCircleTransformOrigin(svg: HTMLElement): string {
    // Safari has an issue where the `transform-origin` doesn't work as expected when the page
    // has a different zoom level from the default. The problem appears to be that a zoom
    // is applied on the `svg` node itself. We can work around it by calculating the origin
    // based on the zoom level. On all other browsers the `currentScale` appears to always be 1.
    const scale = ((svg as unknown as SVGSVGElement).currentScale ?? 1) * 50;
    return `${scale}% ${scale}%`;
  }

  /** Dynamically generates a style tag containing the correct animation for this diameter. */
  private _attachStyleNode(): void {
    const styleRoot = this._styleRoot;
    const currentDiameter = this._diameter;
    const diameters = MatLegacyProgressSpinner._diameters;
    let diametersForElement = diameters.get(styleRoot);

    if (!diametersForElement || !diametersForElement.has(currentDiameter)) {
      const styleTag: HTMLStyleElement = this._document.createElement('style');
      styleTag.setAttribute('mat-spinner-animation', this._spinnerAnimationLabel);
      styleTag.textContent = this._getAnimationText();
      styleRoot.appendChild(styleTag);

      if (!diametersForElement) {
        diametersForElement = new Set<number>();
        diameters.set(styleRoot, diametersForElement);
      }

      diametersForElement.add(currentDiameter);
    }
  }

  /** Generates animation styles adjusted for the spinner's diameter. */
  private _getAnimationText(): string {
    const strokeCircumference = this._getStrokeCircumference();
    return (
      INDETERMINATE_ANIMATION_TEMPLATE
        // Animation should begin at 5% and end at 80%
        .replace(/START_VALUE/g, `${0.95 * strokeCircumference}`)
        .replace(/END_VALUE/g, `${0.2 * strokeCircumference}`)
        .replace(/DIAMETER/g, `${this._spinnerAnimationLabel}`)
    );
  }

  /** Returns the circle diameter formatted for use with the animation-name CSS property. */
  private _getSpinnerAnimationLabel(): string {
    // The string of a float point number will include a period ‘.’ character,
    // which is not valid for a CSS animation-name.
    return this.diameter.toString().replace('.', '_');
  }
}
