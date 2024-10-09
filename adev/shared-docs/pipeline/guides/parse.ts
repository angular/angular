/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {marked} from 'marked';
import {hooks} from './hooks';
import {Renderer} from './renderer';
import {docsAlertExtension} from './extensions/docs-alert';
import {docsCalloutExtension} from './extensions/docs-callout';
import {docsPillExtension} from './extensions/docs-pill/docs-pill';
import {docsPillRowExtension} from './extensions/docs-pill/docs-pill-row';
import {docsVideoExtension} from './extensions/docs-video';
import {docsWorkflowExtension} from './extensions/docs-workflow/docs-workflow';
import {docsStepExtension} from './extensions/docs-workflow/docs-step';
import {docsCardExtension} from './extensions/docs-card/docs-card';
import {docsCardContainerExtension} from './extensions/docs-card/docs-card-container';
import {docsDecorativeHeaderExtension} from './extensions/docs-decorative-header';
import {docsCodeBlockExtension} from './extensions/docs-code/docs-code-block';
import {docsCodeExtension} from './extensions/docs-code/docs-code';
import {docsCodeMultifileExtension} from './extensions/docs-code/docs-code-multifile';
import {ParserContext, setContext} from './utils';
import {walkTokens} from './walk-tokens';

export async function parseMarkdown(
  markdownContent: string,
  context: ParserContext,
): Promise<string> {
  setContext(context);

  marked.use({
    hooks,
    extensions: [
      docsAlertExtension,
      docsCalloutExtension,
      docsPillExtension,
      docsPillRowExtension,
      docsVideoExtension,
      docsWorkflowExtension,
      docsStepExtension,
      docsCardExtension,
      docsCardContainerExtension,
      docsDecorativeHeaderExtension,
      docsCodeBlockExtension,
      docsCodeExtension,
      docsCodeMultifileExtension,
    ],
    walkTokens,
    // The async option causes marked to await walkTokens functions before parsing the tokens and returning an HTML string.
    // We leverage this to allow us to use async libraries like mermaid and building stackblitz examples.
    async: true,
  });

  return marked.parse(markdownContent, {renderer: new Renderer()});
}
