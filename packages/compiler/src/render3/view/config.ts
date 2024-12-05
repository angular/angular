/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Whether to produce instructions that will attach the source location to each DOM node.
 *
 * !!!Important!!! at the time of writing this flag isn't exposed externally, but internal debug
 * tools enable it via a local change. Any modifications to this flag need to update the
 * internal tooling as well.
 */
let ENABLE_TEMPLATE_SOURCE_LOCATIONS = false;

/**
 * Utility function to enable source locations. Intended to be used **only** inside unit tests.
 */
export function setEnableTemplateSourceLocations(value: boolean): void {
  ENABLE_TEMPLATE_SOURCE_LOCATIONS = value;
}

/** Gets whether template source locations are enabled. */
export function getTemplateSourceLocationsEnabled(): boolean {
  return ENABLE_TEMPLATE_SOURCE_LOCATIONS;
}
