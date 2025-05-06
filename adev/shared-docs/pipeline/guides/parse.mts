/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {marked} from 'marked';
import {hooks} from './hooks.mjs';
import {Renderer} from './renderer.mjs';
import {docsAlertExtension} from './extensions/docs-alert.mjs';
import {docsCalloutExtension} from './extensions/docs-callout.mjs';
import {docsPillExtension} from './extensions/docs-pill/docs-pill.mjs';
import {docsPillRowExtension} from './extensions/docs-pill/docs-pill-row.mjs';
import {docsVideoExtension} from './extensions/docs-video.mjs';
import {docsWorkflowExtension} from './extensions/docs-workflow/docs-workflow.mjs';
import {docsStepExtension} from './extensions/docs-workflow/docs-step.mjs';
import {docsCardExtension} from './extensions/docs-card/docs-card.mjs';
import {docsCardContainerExtension} from './extensions/docs-card/docs-card-container.mjs';
import {docsDecorativeHeaderExtension} from './extensions/docs-decorative-header.mjs';
import {docsCodeBlockExtension} from './extensions/docs-code/docs-code-block.mjs';
import {docsCodeExtension} from './extensions/docs-code/docs-code.mjs';
import {docsCodeMultifileExtension} from './extensions/docs-code/docs-code-multifile.mjs';
import {ParserContext, setContext} from './utils.mjs';
import {walkTokens} from './walk-tokens.mjs';

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
