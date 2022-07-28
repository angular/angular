/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Platform} from '@angular/cdk/platform';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  InjectionToken,
  NgZone,
  Optional,
  ViewEncapsulation,
} from '@angular/core';
import {ANIMATION_MODULE_TYPE} from '@angular/platform-browser/animations';

import {MatAnchor} from './button';
import {
  MAT_ANCHOR_HOST,
  MAT_ANCHOR_INPUTS,
  MAT_BUTTON_HOST,
  MAT_BUTTON_INPUTS,
  MatButtonBase,
} from './button-base';
import {ThemePalette} from '@angular/material/core';
import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion';

/** Default FAB options that can be overridden. */
export interface MatFabDefaultOptions {
  color?: ThemePalette;
}

/** Injection token to be used to override the default options for FAB. */
export const MAT_FAB_DEFAULT_OPTIONS = new InjectionToken<MatFabDefaultOptions>(
  'mat-mdc-fab-default-options',
  {
    providedIn: 'root',
    factory: MAT_FAB_DEFAULT_OPTIONS_FACTORY,
  },
);

/** @docs-private */
export function MAT_FAB_DEFAULT_OPTIONS_FACTORY(): MatFabDefaultOptions {
  return {
    // The FAB by default has its color set to accent.
    color: 'accent',
  };
}

// Default FAB configuration.
const defaults = MAT_FAB_DEFAULT_OPTIONS_FACTORY();

/**
 * Material Design floating action button (FAB) component. These buttons represent the primary
 * or most common action for users to interact with.
 * See https://material.io/components/buttons-floating-action-button/
 *
 * The `MatFabButton` class has two appearances: normal and extended.
 */
@Component({
  selector: `button[mat-fab]`,
  templateUrl: 'button.html',
  styleUrls: ['fab.css'],
  inputs: [...MAT_BUTTON_INPUTS, 'extended'],
  host: {
    ...MAT_BUTTON_HOST,
    '[class.mdc-fab--extended]': 'extended',
    '[class.mat-mdc-extended-fab]': 'extended',
  },
  exportAs: 'matButton',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatFabButton extends MatButtonBase {
  override _isFab = true;

  get extended(): boolean {
    return this._extended;
  }
  set extended(value: BooleanInput) {
    this._extended = coerceBooleanProperty(value);
  }
  private _extended: boolean;

  constructor(
    elementRef: ElementRef,
    platform: Platform,
    ngZone: NgZone,
    @Optional() @Inject(ANIMATION_MODULE_TYPE) animationMode?: string,
    @Optional() @Inject(MAT_FAB_DEFAULT_OPTIONS) private _options?: MatFabDefaultOptions,
  ) {
    super(elementRef, platform, ngZone, animationMode);
    this._options = this._options || defaults;
    this.color = this.defaultColor = this._options!.color || defaults.color;
  }
}

/**
 * Material Design mini floating action button (FAB) component. These buttons represent the primary
 * or most common action for users to interact with.
 * See https://material.io/components/buttons-floating-action-button/
 */
@Component({
  selector: `button[mat-mini-fab]`,
  templateUrl: 'button.html',
  styleUrls: ['fab.css'],
  inputs: MAT_BUTTON_INPUTS,
  host: MAT_BUTTON_HOST,
  exportAs: 'matButton',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatMiniFabButton extends MatButtonBase {
  override _isFab = true;

  constructor(
    elementRef: ElementRef,
    platform: Platform,
    ngZone: NgZone,
    @Optional() @Inject(ANIMATION_MODULE_TYPE) animationMode?: string,
    @Optional() @Inject(MAT_FAB_DEFAULT_OPTIONS) private _options?: MatFabDefaultOptions,
  ) {
    super(elementRef, platform, ngZone, animationMode);
    this._options = this._options || defaults;
    this.color = this.defaultColor = this._options!.color || defaults.color;
  }
}

/**
 * Material Design floating action button (FAB) component for anchor elements. Anchor elements
 * are used to provide links for the user to navigate across different routes or pages.
 * See https://material.io/components/buttons-floating-action-button/
 *
 * The `MatFabAnchor` class has two appearances: normal and extended.
 */
@Component({
  selector: `a[mat-fab]`,
  templateUrl: 'button.html',
  styleUrls: ['fab.css'],
  inputs: [...MAT_ANCHOR_INPUTS, 'extended'],
  host: {
    ...MAT_ANCHOR_HOST,
    '[class.mdc-fab--extended]': 'extended',
    '[class.mat-mdc-extended-fab]': 'extended',
  },
  exportAs: 'matButton, matAnchor',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatFabAnchor extends MatAnchor {
  override _isFab = true;

  get extended(): boolean {
    return this._extended;
  }
  set extended(value: BooleanInput) {
    this._extended = coerceBooleanProperty(value);
  }
  private _extended: boolean;

  constructor(
    elementRef: ElementRef,
    platform: Platform,
    ngZone: NgZone,
    @Optional() @Inject(ANIMATION_MODULE_TYPE) animationMode?: string,
    @Optional() @Inject(MAT_FAB_DEFAULT_OPTIONS) private _options?: MatFabDefaultOptions,
  ) {
    super(elementRef, platform, ngZone, animationMode);
    this._options = this._options || defaults;
    this.color = this.defaultColor = this._options!.color || defaults.color;
  }
}

/**
 * Material Design mini floating action button (FAB) component for anchor elements. Anchor elements
 * are used to provide links for the user to navigate across different routes or pages.
 * See https://material.io/components/buttons-floating-action-button/
 */
@Component({
  selector: `a[mat-mini-fab]`,
  templateUrl: 'button.html',
  styleUrls: ['fab.css'],
  inputs: MAT_ANCHOR_INPUTS,
  host: MAT_ANCHOR_HOST,
  exportAs: 'matButton, matAnchor',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatMiniFabAnchor extends MatAnchor {
  override _isFab = true;

  constructor(
    elementRef: ElementRef,
    platform: Platform,
    ngZone: NgZone,
    @Optional() @Inject(ANIMATION_MODULE_TYPE) animationMode?: string,
    @Optional() @Inject(MAT_FAB_DEFAULT_OPTIONS) private _options?: MatFabDefaultOptions,
  ) {
    super(elementRef, platform, ngZone, animationMode);
    this._options = this._options || defaults;
    this.color = this.defaultColor = this._options!.color || defaults.color;
  }
}
