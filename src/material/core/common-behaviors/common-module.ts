/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HighContrastModeDetector} from '@angular/cdk/a11y';
import {BidiModule} from '@angular/cdk/bidi';
import {Inject, InjectionToken, NgModule, Optional} from '@angular/core';
import {VERSION as CDK_VERSION} from '@angular/cdk';
import {DOCUMENT} from '@angular/common';
import {_isTestEnvironment} from '@angular/cdk/platform';
import {VERSION} from '../version';

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

  constructor(
    highContrastModeDetector: HighContrastModeDetector,
    @Optional() @Inject(MATERIAL_SANITY_CHECKS) private _sanityChecks: SanityChecks,
    @Inject(DOCUMENT) private _document: Document,
  ) {
    // While A11yModule also does this, we repeat it here to avoid importing A11yModule
    // in MatCommonModule.
    highContrastModeDetector._applyBodyHighContrastModeCssClasses();

    if (!this._hasDoneGlobalChecks) {
      this._hasDoneGlobalChecks = true;

      if (typeof ngDevMode === 'undefined' || ngDevMode) {
        if (this._checkIsEnabled('doctype')) {
          _checkDoctypeIsDefined(this._document);
        }

        if (this._checkIsEnabled('theme')) {
          _checkThemeIsPresent(this._document);
        }

        if (this._checkIsEnabled('version')) {
          _checkCdkVersionMatch();
        }
      }
    }
  }

  /** Gets whether a specific sanity check is enabled. */
  private _checkIsEnabled(name: keyof GranularSanityChecks): boolean {
    if (_isTestEnvironment()) {
      return false;
    }

    if (typeof this._sanityChecks === 'boolean') {
      return this._sanityChecks;
    }

    return !!this._sanityChecks[name];
  }
}

/** Checks that the page has a doctype. */
function _checkDoctypeIsDefined(doc: Document): void {
  if (!doc.doctype) {
    console.warn(
      'Current document does not have a doctype. This may cause ' +
        'some Angular Material components not to behave as expected.',
    );
  }
}

/** Checks that a theme has been included. */
function _checkThemeIsPresent(doc: Document): void {
  // We need to assert that the `body` is defined, because these checks run very early
  // and the `body` won't be defined if the consumer put their scripts in the `head`.
  if (!doc.body || typeof getComputedStyle !== 'function') {
    return;
  }

  const testElement = doc.createElement('div');
  testElement.classList.add('mat-theme-loaded-marker');
  doc.body.appendChild(testElement);

  const computedStyle = getComputedStyle(testElement);

  // In some situations the computed style of the test element can be null. For example in
  // Firefox, the computed style is null if an application is running inside of a hidden iframe.
  // See: https://bugzilla.mozilla.org/show_bug.cgi?id=548397
  if (computedStyle && computedStyle.display !== 'none') {
    console.warn(
      'Could not find Angular Material core theme. Most Material ' +
        'components may not work as expected. For more info refer ' +
        'to the theming guide: https://material.angular.io/guide/theming',
    );
  }

  testElement.remove();
}

/** Checks whether the Material version matches the CDK version. */
function _checkCdkVersionMatch(): void {
  if (VERSION.full !== CDK_VERSION.full) {
    console.warn(
      'The Angular Material version (' +
        VERSION.full +
        ') does not match ' +
        'the Angular CDK version (' +
        CDK_VERSION.full +
        ').\n' +
        'Please ensure the versions of these two packages exactly match.',
    );
  }
}
