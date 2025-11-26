/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {VERSION} from '@angular/compiler';

import {ErrorCode} from '../../../diagnostics';

/**
 * Base URL for the extended error details page.
 *
 * Keep the files below in full sync:
 *  - packages/compiler-cli/src/ngtsc/diagnostics/src/error_details_base_url.ts
 *  - packages/core/src/error_details_base_url.ts
 */
export const EXTENDED_ERROR_DETAILS_PAGE_BASE_URL: string = (() => {
  const versionSubDomain = VERSION.major !== '0' ? `v${VERSION.major}.` : '';
  return `https://${versionSubDomain}angular.dev/extended-diagnostics`;
})();

export function formatExtendedError(code: ErrorCode, message: null | false | string): string {
  // Note: Runtime error codes are prefixed with 0 (e.g., NG0100-999) while compiler errors
  // use plain numbers (e.g., NG1001), keeping them distinct despite numerical overlap.
  const fullCode = `NG${Math.abs(code)}`;
  const errorMessage = `${fullCode}${message ? ': ' + message : ''}`;
  const addPeriodSeparator = !errorMessage.match(/[.,;!?\n]$/);
  const separator = addPeriodSeparator ? '.' : '';

  return `${errorMessage}${separator} Find more at ${EXTENDED_ERROR_DETAILS_PAGE_BASE_URL}/${fullCode}`;
}
