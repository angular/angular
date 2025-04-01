/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {HtmlParser, ParseTreeResult} from '@angular/compiler';

type MigrateError = {
  type: string;
  error: unknown;
};

interface ParseResult {
  tree: ParseTreeResult | undefined;
  errors: MigrateError[];
}

export function parseTemplate(template: string): ParseResult {
  let parsed: ParseTreeResult;
  try {
    // Note: we use the HtmlParser here, instead of the `parseTemplate` function, because the
    // latter returns an Ivy AST, not an HTML AST. The HTML AST has the advantage of preserving
    // interpolated text as text nodes containing a mixture of interpolation tokens and text tokens,
    // rather than turning them into `BoundText` nodes like the Ivy AST does. This allows us to
    // easily get the text-only ranges without having to reconstruct the original text.
    parsed = new HtmlParser().parse(template, '', {
      // Allows for ICUs to be parsed.
      tokenizeExpansionForms: true,
      // Explicitly disable blocks so that their characters are treated as plain text.
      tokenizeBlocks: true,
      preserveLineEndings: true,
    });

    // Don't migrate invalid templates.
    if (parsed.errors && parsed.errors.length > 0) {
      const errors = parsed.errors.map((e) => ({type: 'parse', error: e}));
      return {tree: undefined, errors};
    }
  } catch (e: any) {
    return {tree: undefined, errors: [{type: 'parse', error: e}]};
  }
  return {tree: parsed, errors: []};
}
