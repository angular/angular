/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {VERSION} from './version';

// tslint:disable-next-line: no-toplevel-property-access
const versionSubDomain = VERSION.major !== '0' ? `v${VERSION.major}.` : '';

/**
 * Base URL for the error details page.
 *
 * Keep this constant in sync across:
 *  - packages/compiler-cli/src/ngtsc/diagnostics/src/error_details_base_url.ts
 *  - packages/core/src/error_details_base_url.ts
 */
export const ERROR_DETAILS_PAGE_BASE_URL = `https://${versionSubDomain}angular.io/errors`;

/**
 * URL for the XSS security documentation.
 */
export const XSS_SECURITY_URL = 'https://g.co/ng/security#xss';
