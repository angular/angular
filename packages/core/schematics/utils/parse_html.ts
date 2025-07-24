/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {TmplAstNode} from '@angular/compiler';

/**
 * Parses the given HTML content using the Angular compiler. In case the parsing
 * fails, null is being returned.
 */
export function parseHtmlGracefully(
  htmlContent: string,
  filePath: string,
  compilerModule: typeof import('@angular/compiler'),
): TmplAstNode[] | null {
  try {
    return compilerModule.parseTemplate(htmlContent, filePath).nodes;
  } catch {
    // Do nothing if the template couldn't be parsed. We don't want to throw any
    // exception if a template is syntactically not valid. e.g. template could be
    // using preprocessor syntax.
    return null;
  }
}
