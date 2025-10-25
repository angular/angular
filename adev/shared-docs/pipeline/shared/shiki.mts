/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {HighlighterGeneric} from 'shiki';

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
  language: string | undefined,
): string {
  const html = highlighter.codeToHtml(code, {
    lang: language ?? 'text',
    themes: {
      light: LIGHT_THEME,
      dark: DARK_THEME,
    },
    cssVariablePrefix: '--shiki-',
    defaultColor: false,
  });

  return html;
}
