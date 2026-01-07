/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {VERSION} from './version';

export const DOC_PAGE_BASE_URL: string = (() => {
  const full = VERSION.full;
  const isPreRelease =
    full.includes('-next') || full.includes('-rc') || full === '0.0.0-PLACEHOLDER';
  const prefix = isPreRelease ? 'next' : `v${VERSION.major}`;
  return `https://${prefix}.angular.dev`;
})();

/**
 * Base URL for the error details page.
 *
 * Keep this constant in sync across:
 *  - packages/compiler-cli/src/ngtsc/diagnostics/src/error_details_base_url.ts
 *  - packages/core/src/error_details_base_url.ts
 */
export const ERROR_DETAILS_PAGE_BASE_URL: string = (() => {
  return `${DOC_PAGE_BASE_URL}/errors`;
})();

/**
 * URL for the XSS security documentation.
 */
export const XSS_SECURITY_URL =
  'https://angular.dev/best-practices/security#preventing-cross-site-scripting-xss';
