/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {marked, Token} from 'marked';
import {AdevDocsRenderer, RendererContext} from './renderer.mjs';
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
import {docsCodeExtension, DocsCodeToken} from './extensions/docs-code/docs-code.mjs';
import {docsCodeMultifileExtension} from './extensions/docs-code/docs-code-multifile.mjs';
import {hooks} from './hooks.mjs';

let markedInstance: typeof marked;
const extensions = [
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
];

export async function parseMarkdownAsync(
  markdownContent: string,
  context: RendererContext,
): Promise<string> {
  markedInstance ??= marked.use({hooks, extensions, walkTokens, async: true});
  return markedInstance.parse(markdownContent, {renderer: new AdevDocsRenderer(context)});
}

export function parseMarkdown(markdownContent: string, context: RendererContext): string {
  markedInstance ??= marked.use({hooks, extensions, walkTokens});
  return markedInstance.parse(markdownContent, {renderer: new AdevDocsRenderer(context)}) as string;
}

/**
 * Describe a HANDLE_MERMAID value which esbuild will use at build time to determine if the mermaid
 * related code should be included in the bundle.
 * THIS VALUE IS NOT AVAILABLE AT RUNTIME.
 */
export declare const HANDLE_MERMAID: boolean;

/** Type guard for if a provided token is the DocsCodeToken. */
function isDocsCodeToken(token: Token): token is DocsCodeToken {
  return !!(token as DocsCodeToken).language;
}

/**
 * Handle the provided token based on the token itself replacing its content/data in place
 * as appropriate.
 */
let mermaid: typeof import('./mermaid/index.mjs');
export async function walkTokens(token: Token): Promise<void> {
  if (!isDocsCodeToken(token) || token.language !== 'mermaid') {
    return;
  }

  if (HANDLE_MERMAID) {
    mermaid ??= await import('./mermaid/index.mjs');
    return mermaid.processMermaidCodeBlock(token);
  }
}
