/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// Note: semver isn't available internally so this import will be commented out.
// When adding more dependencies here, the caretaker may have to update a patch internally.
import semver from 'semver';

/**
 * Whether a version of `@angular/core` supports a specific feature.
 * @param coreVersion Current version of core.
 * @param minVersion Minimum required version for the feature.
 */
export function coreVersionSupportsFeature(coreVersion: string, minVersion: string): boolean {
  // A version of `0.0.0-PLACEHOLDER` usually means that core is at head so it supports
  // all features. Use string interpolation prevent the placeholder from being replaced
  // with the current version during build time.
  if (coreVersion === `0.0.0-${'PLACEHOLDER'}`) {
    return true;
  }

  return semver.satisfies(coreVersion, minVersion, {includePrerelease: true});
}
