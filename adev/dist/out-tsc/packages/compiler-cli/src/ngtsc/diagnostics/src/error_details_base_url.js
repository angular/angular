/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {VERSION} from '@angular/compiler';
/**
 * Base URL for the error details page.
 *
 * Keep the files below in full sync:
 *  - packages/compiler-cli/src/ngtsc/diagnostics/src/error_details_base_url.ts
 *  - packages/core/src/error_details_base_url.ts
 */
export const ERROR_DETAILS_PAGE_BASE_URL = (() => {
  const versionSubDomain = VERSION.major !== '0' ? `v${VERSION.major}.` : '';
  return `https://${versionSubDomain}angular.dev/errors`;
})();
//# sourceMappingURL=error_details_base_url.js.map
