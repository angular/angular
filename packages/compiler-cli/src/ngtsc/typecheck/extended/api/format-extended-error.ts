/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ErrorCode} from '../../../diagnostics';
import {EXTENDED_ERROR_DETAILS_PAGE_BASE_URL} from '../../../diagnostics/src/error_details_base_url';

export function formatExtendedError(code: ErrorCode, message: null | false | string): string {
  // Note: Runtime error codes are prefixed with 0 (e.g., NG0100-999) while compiler errors
  // use plain numbers (e.g., NG1001), keeping them distinct despite numerical overlap.
  const fullCode = `NG${Math.abs(code)}`;
  const errorMessage = `${fullCode}${message ? ': ' + message : ''}`;
  const addPeriodSeparator = !errorMessage.match(/[.,;!?\n]$/);
  const separator = addPeriodSeparator ? '.' : '';

  return `${errorMessage}${separator} Find more at ${EXTENDED_ERROR_DETAILS_PAGE_BASE_URL}/${fullCode}`;
}
