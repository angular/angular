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
  ViewEncapsulation,
  ElementRef,
  NgZone,
  Optional,
  Inject,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  OnDestroy,
  ChangeDetectorRef,
  InjectionToken,
  inject,
} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {CanColor, mixinColor, ThemePalette} from '@angular/material/core';
import {ANIMATION_MODULE_TYPE} from '@angular/platform-browser/animations';
import {coerceNumberProperty, NumberInput} from '@angular/cdk/coercion';

/** Last animation end data. */
export interface ProgressAnimationEnd {
  value: number;
}

/** Default `mat-progress-bar` options that can be overridden. */
export interface MatProgressBarDefaultOptions {
  /** Default color of the progress bar. */
  color?: ThemePalette;

  /** Default mode of the progress bar. */
  mode?: ProgressBarMode;
}

/** Injection token to be used to override the default options for `mat-progress-bar`. */
export const MAT_PROGRESS_BAR_DEFAULT_OPTIONS = new InjectionToken<MatProgressBarDefaultOptions>(
  'MAT_PROGRESS_BAR_DEFAULT_OPTIONS',
);

/**
 * Injection token used to provide the current location to `MatProgressBar`.
 * Used to handle server-side rendering and to stub out during unit tests.
 * @docs-private
 */
export const MAT_PROGRESS_BAR_LOCATION = new InjectionToken<MatProgressBarLocation>(
  'mat-progress-bar-location',
  {providedIn: 'root', factory: MAT_PROGRESS_BAR_LOCATION_FACTORY},
);

/**
 * Stubbed out location for `MatProgressBar`.
 * @docs-private
 */
export interface MatProgressBarLocation {
  getPathname: () => string;
}

/** @docs-private */
export function MAT_PROGRESS_BAR_LOCATION_FACTORY(): MatProgressBarLocation {
  const _document = inject(DOCUMENT);
  const _location = _document ? _document.location : null;

  return {
    // Note that this needs to be a function, rather than a property, because Angular
    // will only resolve it once, but we want the current path on each call.
    getPathname: () => (_location ? _location.pathname + _location.search : ''),
  };
}

// Boilerplate for applying mixins to MatProgressBar.
/** @docs-private */
const _MatProgressBarBase = mixinColor(
  class {
    constructor(public _elementRef: ElementRef<HTMLElement>) {}
  },
  'primary',
);

export type ProgressBarMode = 'determinate' | 'indeterminate' | 'buffer' | 'query';

@Component({
  selector: 'mat-progress-bar',
  exportAs: 'matProgressBar',
  host: {
    'role': 'progressbar',
    'aria-valuemin': '0',
    'aria-valuemax': '100',
    // set tab index to -1 so screen readers will read the aria-label
    // Note: there is a known issue with JAWS that does not read progressbar aria labels on FireFox
    'tabindex': '-1',
    '[attr.aria-valuenow]': '_isIndeterminate() ? null : value',
    '[attr.mode]': 'mode',
    'class': 'mat-mdc-progress-bar mdc-linear-progress',
    '[class._mat-animation-noopable]': '_isNoopAnimation',
    '[class.mdc-linear-progress--animation-ready]': '!_isNoopAnimation',
    '[class.mdc-linear-progress--indeterminate]': '_isIndeterminate()',
  },
  inputs: ['color'],
  templateUrl: 'progress-bar.html',
  styleUrls: ['progress-bar.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MatProgressBar
  extends _MatProgressBarBase
  implements AfterViewInit, OnDestroy, CanColor
{
  constructor(
    elementRef: ElementRef<HTMLElement>,
    private _ngZone: NgZone,
    private _changeDetectorRef: ChangeDetectorRef,
    @Optional() @Inject(ANIMATION_MODULE_TYPE) public _animationMode?: string,
    @Optional()
    @Inject(MAT_PROGRESS_BAR_DEFAULT_OPTIONS)
    defaults?: MatProgressBarDefaultOptions,
  ) {
    super(elementRef);
    this._isNoopAnimation = _animationMode === 'NoopAnimations';

    if (defaults) {
      if (defaults.color) {
        this.color = this.defaultColor = defaults.color;
      }

      this.mode = defaults.mode || this.mode;
    }
  }

  /** Flag that indicates whether NoopAnimations mode is set to true. */
  _isNoopAnimation = false;

  /** Value of the progress bar. Defaults to zero. Mirrored to aria-valuenow. */
  @Input()
  get value(): number {
    return this._value;
  }
  set value(v: NumberInput) {
    this._value = clamp(coerceNumberProperty(v));
    this._changeDetectorRef.markForCheck();
  }
  private _value = 0;

  /** Buffer value of the progress bar. Defaults to zero. */
  @Input()
  get bufferValue(): number {
    return this._bufferValue || 0;
  }
  set bufferValue(v: NumberInput) {
    this._bufferValue = clamp(coerceNumberProperty(v));
    this._changeDetectorRef.markForCheck();
  }
  private _bufferValue = 0;

  /**
   * Event emitted when animation of the primary progress bar completes. This event will not
   * be emitted when animations are disabled, nor will it be emitted for modes with continuous
   * animations (indeterminate and query).
   */
  @Output() readonly animationEnd = new EventEmitter<ProgressAnimationEnd>();

  /**
   * Mode of the progress bar.
   *
   * Input must be one of these values: determinate, indeterminate, buffer, query, defaults to
   * 'determinate'.
   * Mirrored to mode attribute.
   */
  @Input()
  get mode(): ProgressBarMode {
    return this._mode;
  }
  set mode(value: ProgressBarMode) {
    // Note that we don't technically need a getter and a setter here,
    // but we use it to match the behavior of the existing mat-progress-bar.
    this._mode = value;
    this._changeDetectorRef.markForCheck();
  }
  private _mode: ProgressBarMode = 'determinate';

  ngAfterViewInit() {
    // Run outside angular so change detection didn't get triggered on every transition end
    // instead only on the animation that we care about (primary value bar's transitionend)
    this._ngZone.runOutsideAngular(() => {
      this._elementRef.nativeElement.addEventListener('transitionend', this._transitionendHandler);
    });
  }

  ngOnDestroy() {
    this._elementRef.nativeElement.removeEventListener('transitionend', this._transitionendHandler);
  }

  /** Gets the transform style that should be applied to the primary bar. */
  _getPrimaryBarTransform(): string {
    return `scaleX(${this._isIndeterminate() ? 1 : this.value / 100})`;
  }

  /** Gets the `flex-basis` value that should be applied to the buffer bar. */
  _getBufferBarFlexBasis(): string {
    return `${this.mode === 'buffer' ? this.bufferValue : 100}%`;
  }

  /** Returns whether the progress bar is indeterminate. */
  _isIndeterminate(): boolean {
    return this.mode === 'indeterminate' || this.mode === 'query';
  }

  /** Event handler for `transitionend` events. */
  private _transitionendHandler = (event: TransitionEvent) => {
    if (
      this.animationEnd.observers.length === 0 ||
      !event.target ||
      !(event.target as HTMLElement).classList.contains('mdc-linear-progress__primary-bar')
    ) {
      return;
    }

    if (this.mode === 'determinate' || this.mode === 'buffer') {
      this._ngZone.run(() => this.animationEnd.next({value: this.value}));
    }
  };
}

/** Clamps a value to be between two numbers, by default 0 and 100. */
function clamp(v: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, v));
}
