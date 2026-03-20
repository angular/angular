/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {HighlighterGeneric, ShikiTransformer} from 'shiki';
import {ApiEntries, getSymbolUrl} from './linking.mjs';

const scanner = ts.createScanner(ts.ScriptTarget.Latest, true);
const LIGHT_THEME = 'github-light';
const DARK_THEME = 'github-dark';

export async function initHighlighter(): Promise<HighlighterGeneric<any, any>> {
  const {createHighlighter} = await import('shiki');
  return await createHighlighter({
    themes: [LIGHT_THEME, DARK_THEME],
    langs: [
      'javascript',
      'typescript',
      'angular-html',
      'angular-ts',
      'shell',
      'html',
      'http',
      'json',
      'jsonc',
      'nginx',
      'markdown',
      'apache',
    ],
  });
}

export function codeToHtml(
  highlighter: HighlighterGeneric<any, any>,
  code: string,
  config: {
    apiEntries?: ApiEntries;
    language?: string;
    highlight?: Set<number>;
  },
): string {
  const html = highlighter.codeToHtml(code, {
    lang: config.language ?? 'text',
    themes: {
      light: LIGHT_THEME,
      dark: DARK_THEME,
    },
    cssVariablePrefix: '--shiki-',
    defaultColor: false,
    transformers: [
      removeWhitespaceTransformer(),
      highlightTransformer(config.highlight),
      linkApiEntriesTransformer(config.apiEntries),
    ],
  });
  return html;
}

/** A custom transformer which will mark all of the provided line numbers in a set as highlighted. */
function highlightTransformer(highlight?: Set<number>): ShikiTransformer {
  return {
    line(node, lineNumber) {
      if (highlight?.has(lineNumber)) {
        this.addClassToHast(node, 'highlighted');
      }
    },
  };
}

/** A custom transformer which removes all of the whitespace between lines of code in the generated output. */
function removeWhitespaceTransformer(): ShikiTransformer {
  return {
    code(code) {
      code.children = code.children.filter(
        (line) => line.type !== 'text' || line.value.trim().length !== 0,
      );
    },
  };
}

/** A custom transformer which adds a link to local API entries whenever a matching identifier is discovered in the code block. */
function linkApiEntriesTransformer(apiEntries?: ApiEntries): ShikiTransformer {
  if (apiEntries === undefined) {
    return {};
  }
  return {
    preprocess(code, options) {
      options.decorations ??= [];
      scanner.setText(code);
      let token = scanner.scan();

      while (token !== ts.SyntaxKind.EndOfFileToken) {
        if (token === ts.SyntaxKind.Identifier) {
          const symbolUrl = getSymbolUrl(scanner.getTokenText(), apiEntries);
          if (symbolUrl !== undefined) {
            options.decorations.push({
              transform: (el) => {
                el.tagName = 'a';
                el.properties['href'] = symbolUrl;
                return el;
              },
              start: scanner.getTokenStart(),
              end: scanner.getTokenEnd(),
            });
          }
        }

        token = scanner.scan();
      }

      return code;
    },
  };
}
