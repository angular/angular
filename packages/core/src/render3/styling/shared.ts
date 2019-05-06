/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * The default directive styling index value for template-based bindings.
 *
 * All host-level bindings (e.g. `hostStyleProp` and `hostStyleMap`) are
 * assigned a directive styling index value based on the current directive
 * uniqueId and the directive super-class inheritance depth. But for template
 * bindings they always have the same directive styling index value.
 */
export const DEFAULT_TEMPLATE_DIRECTIVE_INDEX = 0;
