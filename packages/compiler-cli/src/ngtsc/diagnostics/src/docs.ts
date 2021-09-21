/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ErrorCode} from './error_code';

/**
 * Base URL for the error details page.
 * Keep this value in sync with a similar const in
 * `packages/core/src/render3/error_code.ts`.
 */
export const ERROR_DETAILS_PAGE_BASE_URL = 'https://angular.io/errors';

/**
 * Contains a set of error messages that have detailed guides at angular.io.
 * Full list of available error guides can be found at https://angular.io/errors
 */
export const COMPILER_ERRORS_WITH_GUIDES = new Set([
  ErrorCode.DECORATOR_ARG_NOT_LITERAL,
  ErrorCode.IMPORT_CYCLE_DETECTED,
  ErrorCode.PARAM_MISSING_TOKEN,
  ErrorCode.SCHEMA_INVALID_ELEMENT,
  ErrorCode.SCHEMA_INVALID_ATTRIBUTE,
  ErrorCode.MISSING_REFERENCE_TARGET,
  ErrorCode.COMPONENT_INVALID_SHADOW_DOM_SELECTOR,
]);
