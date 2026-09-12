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
export const ENABLE_TEMPLATE_SOURCE_LOCATIONS = false;
