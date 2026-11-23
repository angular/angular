/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, inject, input, resource} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {ThemeManager} from '../../../../core/services/theme-manager.service';
import {CodeHighlighter} from '../../code-highlighting/code-highlighter';

@Component({
  selector: 'adev-code-block',
  template: `<pre><code [innerHTML]="highlightedCode.value()"></code></pre>`,
  styles: `
    ::ng-deep pre {
      margin: 0;
    }
  `,
})
export class CodeBlock {
  codeHighlighter = inject(CodeHighlighter);
  code = input.required<string>();
  language = input<'angular-html' | 'angular-ts'>('angular-ts');
  sanitizer = inject(DomSanitizer);
  theme = inject(ThemeManager);

  highlightedCode = resource({
    params: () => ({
      code: this.code(),
      lang: this.language(),
      theme: this.theme.resolvedTheme() === 'dark' ? 'github-dark' : 'github-light',
    }),
    loader: async ({params: {code, lang, theme}}) => {
      const highlightedHtml = await this.codeHighlighter.codeToHtml(code, {
        cssVariablePrefix: '--shiki-',
        lang,
        theme,
      });
      return this.sanitizer.bypassSecurityTrustHtml(highlightedHtml);
    },
  });
}
