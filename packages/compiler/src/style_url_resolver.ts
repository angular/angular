/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Some of the code comes from WebComponents.JS
// https://github.com/webcomponents/webcomponentsjs/blob/master/src/HTMLImports/path.js

import {UrlResolver} from './url_resolver';

export class StyleWithImports {
  constructor(public style: string, public styleUrls: string[]) {}
}

export function isStyleUrlResolvable(url: string): boolean {
  if (url == null || url.length === 0 || url[0] == '/') return false;
  const schemeMatch = url.match(URL_WITH_SCHEMA_REGEXP);
  return schemeMatch === null || schemeMatch[1] == 'package' || schemeMatch[1] == 'asset';
}

/**
 * Rewrites stylesheets by resolving and removing the @import urls that
 * are either relative or don't have a `package:` scheme
 */
export function extractStyleUrls(
    resolver: UrlResolver, baseUrl: string, cssText: string): StyleWithImports {
  const foundUrls: string[] = [];

  const modifiedCssText = cssText.replace(CSS_STRIPPABLE_COMMENT_REGEXP, '')
                              .replace(CSS_IMPORT_REGEXP, (...m: string[]) => {
                                const url = m[1] || m[2];
                                if (!isStyleUrlResolvable(url)) {
                                  // Do not attempt to resolve non-package absolute URLs with URI
                                  // scheme
                                  return m[0];
                                }
                                foundUrls.push(resolver.resolve(baseUrl, url));
                                return '';
                              });
  return new StyleWithImports(modifiedCssText, foundUrls);
}

const CSS_IMPORT_REGEXP = /@import\s+(?:url\()?\s*(?:(?:['"]([^'"]*))|([^;\)\s]*))[^;]*;?/g;
const CSS_STRIPPABLE_COMMENT_REGEXP = /\/\*(?!#\s*(?:sourceURL|sourceMappingURL)=)[\s\S]+?\*\//g;
const URL_WITH_SCHEMA_REGEXP = /^([^:/?#]+):/;
