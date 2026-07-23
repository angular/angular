/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {OnDestroy, Service} from '@angular/core';
import angularHtml from '@shikijs/langs/angular-html';
import angularTs from '@shikijs/langs/angular-ts';
import githubDark from '@shikijs/themes/github-dark';
import githubLight from '@shikijs/themes/github-light';
import {CodeToHastOptions, createHighlighterCoreSync, HighlighterCore} from 'shiki/core';
import {createOnigurumaEngine} from 'shiki/engine/oniguruma';

@Service()
export class CodeHighlighter implements OnDestroy {
  private cachedHighlighter: HighlighterCore | undefined;

  async codeToHtml(code: string, options: CodeToHastOptions): Promise<string> {
    const highlighter = await this.getHighlighter();
    return highlighter.codeToHtml(code, options);
  }

  ngOnDestroy(): void {
    this.cachedHighlighter?.dispose();
  }

  private async getHighlighter() {
    if (!this.cachedHighlighter) {
      const engine = await createOnigurumaEngine(import('shiki/wasm'));
      this.cachedHighlighter = createHighlighterCoreSync({
        themes: [githubLight, githubDark],
        langs: [angularTs, angularHtml],
        engine,
      });
    }

    return this.cachedHighlighter;
  }
}
