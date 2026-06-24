/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {HighlighterGeneric, ShikiTransformer} from 'shiki';

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
    transformers: [removeWhitespaceTransformer(), highlightTransformer(config.highlight)],
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
function removeWhitespaceTransformer(highlight?: Set<number>): ShikiTransformer {
  return {
    code(code) {
      code.children = code.children.filter(
        (line) => line.type !== 'text' || line.value.trim().length !== 0,
      );
    },
  };
}
