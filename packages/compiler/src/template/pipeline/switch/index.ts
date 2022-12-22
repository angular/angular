/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// During 3P builds, this file is replaced with a `genrule()` that conditionally sets the
// `USE_TEMPLATE_PIPELINE` constant instead. In 1P builds, this file is read directly.

/**
 * Whether the prototype template pipeline should be enabled.
 */
export const USE_TEMPLATE_PIPELINE: boolean = false;
