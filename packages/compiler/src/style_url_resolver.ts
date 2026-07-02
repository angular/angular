/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// Some of the code comes from WebComponents.JS
// https://github.com/webcomponents/webcomponentsjs/blob/master/src/HTMLImports/path.js

export function isStyleUrlResolvable(url: string | null): url is string {
  if (url == null || url.length === 0 || url[0] == '/') return false;
  const schemeMatch = url.match(URL_WITH_SCHEMA_REGEXP);
  return schemeMatch === null || schemeMatch[1] == 'package' || schemeMatch[1] == 'asset';
}

const URL_WITH_SCHEMA_REGEXP = /^([^:/?#]+):/;
