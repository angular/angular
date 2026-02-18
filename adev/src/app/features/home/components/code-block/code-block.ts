/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AsyncPipe} from '@angular/common';
import {ChangeDetectionStrategy, Component, computed, inject, input} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {ThemeManager} from '../../../../core/services/theme-manager.service';
import {CodeHighligher} from '../../code-highlighting/code-highlighter';

@Component({
  selector: 'adev-code-block',
  template: `<pre><code [innerHTML]="highlightedCode() | async"></code></pre>`,
  imports: [AsyncPipe],
  styles: `
    ::ng-deep pre {
      margin: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodeBlock {
  codeHighlighter = inject(CodeHighligher);
  code = input.required<string>();
  language = input<'angular-html' | 'angular-ts'>('angular-ts');
  sanitizer = inject(DomSanitizer);
  theme = inject(ThemeManager);

  highlightedCode = computed(() => {
    return this.codeHighlighter
      .codeToHtml(this.code(), {
        cssVariablePrefix: '--shiki-',
        lang: this.language(),
        theme: this.theme.theme() === 'light' ? 'github-light' : 'github-dark',
      })
      .then((hightlightedHtml) => {
        return this.sanitizer.bypassSecurityTrustHtml(hightlightedHtml);
      });
  });
}
