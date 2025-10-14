/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {InjectionToken, inject} from '@angular/core';
export const DOCS_CONTENT_LOADER = new InjectionToken('DOCS_CONTENT_LOADER');
export function contentResolver(contentPath) {
  return () => inject(DOCS_CONTENT_LOADER).getContent(contentPath);
}
//# sourceMappingURL=docs-content-loader.js.map
