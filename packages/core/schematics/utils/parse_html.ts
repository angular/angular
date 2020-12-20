/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {parseTemplate} from '@angular/compiler';
import {Node} from '@angular/compiler/src/render3/r3_ast';

/**
 * Parses the given HTML content using the Angular compiler. In case the parsing
 * fails, null is being returned.
 */
export function parseHtmlGracefully(htmlContent: string, filePath: string): Node[]|null {
  try {
    return parseTemplate(htmlContent, filePath).nodes;
  } catch {
    // Do nothing if the template couldn't be parsed. We don't want to throw any
    // exception if a template is syntactically not valid. e.g. template could be
    // using preprocessor syntax.
    return null;
  }
}
