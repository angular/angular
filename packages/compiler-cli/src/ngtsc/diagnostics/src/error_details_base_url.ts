/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {VERSION} from '@angular/compiler';

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
 * Keep the files below in full sync:
 *  - packages/compiler-cli/src/ngtsc/diagnostics/src/error_details_base_url.ts
 *  - packages/core/src/error_details_base_url.ts
 */
export const ERROR_DETAILS_PAGE_BASE_URL: string = (() => {
  return `${DOC_PAGE_BASE_URL}/errors`;
})();
