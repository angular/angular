/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

let highlighter: any;

export async function initHighlighter() {
  const {createHighlighter} = await import('shiki');
  highlighter = await createHighlighter({
    themes: ['github-light', 'github-dark'],
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

export function codeToHtml(code: string, language: string | undefined): string {
  const html = highlighter.codeToHtml(code, {
    lang: language ?? 'text',
    themes: {
      light: 'github-light',
      dark: 'github-dark',
    },
    cssVariablePrefix: '--shiki-',
    defaultColor: false,
  });

  return html;
}

export function replaceKeywordFromShikiHtml(
  keyword: string,
  shikiHtml: string,
  replaceWith = '',
): string {
  return (
    shikiHtml
      // remove the leading space of the element after the "function" element
      .replace(new RegExp(`(<[^>]*>${keyword}<\\/\\w+><[^>]*>)(\\s)(\\w+<\\/\\w+>)`, 'g'), '$1$3')
      // Shiki requires the keyword function for highlighting functions signatures
      // We don't want to display it so we remove elements with the keyword
      .replace(new RegExp(`<[^>]*>${keyword}<\\/\\w+>`, 'g'), replaceWith)
  );
}
