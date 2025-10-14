/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {marked} from 'marked';
import {AdevDocsRenderer} from './renderer.mjs';
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
import {hooks} from './hooks.mjs';
let markedInstance;
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
export async function parseMarkdownAsync(markdownContent, context) {
  markedInstance ??= marked.use({hooks, extensions, walkTokens, async: true});
  return markedInstance.parse(markdownContent, {renderer: new AdevDocsRenderer(context)});
}
export function parseMarkdown(markdownContent, context) {
  markedInstance ??= marked.use({hooks, extensions, walkTokens});
  return markedInstance.parse(markdownContent, {renderer: new AdevDocsRenderer(context)});
}
/** Type guard for if a provided token is the DocsCodeToken. */
function isDocsCodeToken(token) {
  return !!token.language;
}
/**
 * Handle the provided token based on the token itself replacing its content/data in place
 * as appropriate.
 */
let mermaid;
export async function walkTokens(token) {
  if (!isDocsCodeToken(token) || token.language !== 'mermaid') {
    return;
  }
  if (HANDLE_MERMAID) {
    mermaid ??= await import('./mermaid/index.mjs');
    return mermaid.processMermaidCodeBlock(token);
  }
}
//# sourceMappingURL=parse.mjs.map
