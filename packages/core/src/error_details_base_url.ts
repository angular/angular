/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {VERSION} from './version';

/**
 * Base URL for the error details page.
 *
 * Keep this constant in sync across:
 *  - packages/compiler-cli/src/ngtsc/diagnostics/src/error_details_base_url.ts
 *  - packages/core/src/error_details_base_url.ts
 */
export const ERROR_DETAILS_PAGE_BASE_URL: string = (() => {
  const versionSubDomain = VERSION.major !== '0' ? `v${VERSION.major}.` : '';
  return `https://${versionSubDomain}angular.dev/errors`;
})();

/**
 * URL for the XSS security documentation.
 */
export const XSS_SECURITY_URL =
  'https://angular.dev/best-practices/security#preventing-cross-site-scripting-xss';
