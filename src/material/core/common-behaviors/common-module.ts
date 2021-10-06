/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HighContrastModeDetector} from '@angular/cdk/a11y';
import {BidiModule} from '@angular/cdk/bidi';
import {Inject, InjectionToken, isDevMode, NgModule, Optional, Version} from '@angular/core';
import {VERSION as CDK_VERSION} from '@angular/cdk';
import {DOCUMENT} from '@angular/common';
import {_isTestEnvironment} from '@angular/cdk/platform';

// Private version constant to circumvent test/build issues,
// i.e. avoid core to depend on the @angular/material primary entry-point
// Can be removed once the Material primary entry-point no longer
// re-exports all secondary entry-points
const VERSION = new Version('0.0.0-PLACEHOLDER');

/** @docs-private */
export function MATERIAL_SANITY_CHECKS_FACTORY(): SanityChecks {
  return true;
}

/** Injection token that configures whether the Material sanity checks are enabled. */
export const MATERIAL_SANITY_CHECKS = new InjectionToken<SanityChecks>('mat-sanity-checks', {
  providedIn: 'root',
  factory: MATERIAL_SANITY_CHECKS_FACTORY,
});

/**
 * Possible sanity checks that can be enabled. If set to
 * true/false, all checks will be enabled/disabled.
 */
export type SanityChecks = boolean | GranularSanityChecks;

/** Object that can be used to configure the sanity checks granularly. */
export interface GranularSanityChecks {
  doctype: boolean;
  theme: boolean;
  version: boolean;
}

/**
 * Module that captures anything that should be loaded and/or run for *all* Angular Material
 * components. This includes Bidi, etc.
 *
 * This module should be imported to each top-level component module (e.g., MatTabsModule).
 */
@NgModule({
  imports: [BidiModule],
  exports: [BidiModule],
})
export class MatCommonModule {
  /** Whether we've done the global sanity checks (e.g. a theme is loaded, there is a doctype). */
  private _hasDoneGlobalChecks = false;

  /** Configured sanity checks. */
  private _sanityChecks: SanityChecks;

  /** Used to reference correct document/window */
  protected _document: Document;

  constructor(
      highContrastModeDetector: HighContrastModeDetector,
      @Optional() @Inject(MATERIAL_SANITY_CHECKS) sanityChecks: any,
      @Inject(DOCUMENT) document: any) {
    this._document = document;

    // While A11yModule also does this, we repeat it here to avoid importing A11yModule
    // in MatCommonModule.
    highContrastModeDetector._applyBodyHighContrastModeCssClasses();

    // Note that `_sanityChecks` is typed to `any`, because AoT
    // throws an error if we use the `SanityChecks` type directly.
    this._sanityChecks = sanityChecks;

    if (!this._hasDoneGlobalChecks) {
      this._checkDoctypeIsDefined();
      this._checkThemeIsPresent();
      this._checkCdkVersionMatch();
      this._hasDoneGlobalChecks = true;
    }
  }

  /** Gets whether a specific sanity check is enabled. */
  private _checkIsEnabled(name: keyof GranularSanityChecks): boolean {
    // TODO(crisbeto): we can't use `ngDevMode` here yet, because ViewEngine apps might not support
    // it. Since these checks can have performance implications and they aren't tree shakeable
    // in their current form, we can leave the `isDevMode` check in for now.
    // tslint:disable-next-line:ban
    if (!isDevMode() || _isTestEnvironment()) {
      return false;
    }

    if (typeof this._sanityChecks === 'boolean') {
      return this._sanityChecks;
    }

    return !!this._sanityChecks[name];
  }

  private _checkDoctypeIsDefined(): void {
    if (this._checkIsEnabled('doctype') && !this._document.doctype) {
      console.warn(
        'Current document does not have a doctype. This may cause ' +
        'some Angular Material components not to behave as expected.'
      );
    }
  }

  private _checkThemeIsPresent(): void {
    // We need to assert that the `body` is defined, because these checks run very early
    // and the `body` won't be defined if the consumer put their scripts in the `head`.
    if (!this._checkIsEnabled('theme') || !this._document.body ||
        typeof getComputedStyle !== 'function') {
      return;
    }

    const testElement = this._document.createElement('div');

    testElement.classList.add('mat-theme-loaded-marker');
    this._document.body.appendChild(testElement);

    const computedStyle = getComputedStyle(testElement);

    // In some situations the computed style of the test element can be null. For example in
    // Firefox, the computed style is null if an application is running inside of a hidden iframe.
    // See: https://bugzilla.mozilla.org/show_bug.cgi?id=548397
    if (computedStyle && computedStyle.display !== 'none') {
      console.warn(
        'Could not find Angular Material core theme. Most Material ' +
        'components may not work as expected. For more info refer ' +
        'to the theming guide: https://material.angular.io/guide/theming'
      );
    }

    testElement.remove();
  }

  /** Checks whether the material version matches the cdk version */
  private _checkCdkVersionMatch(): void {
    if (this._checkIsEnabled('version') && VERSION.full !== CDK_VERSION.full) {
      console.warn(
          'The Angular Material version (' + VERSION.full + ') does not match ' +
          'the Angular CDK version (' + CDK_VERSION.full + ').\n' +
          'Please ensure the versions of these two packages exactly match.'
      );
    }
  }
}
