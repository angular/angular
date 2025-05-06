/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Token} from 'marked';
import {DocsCodeToken} from './extensions/docs-code/docs-code.mjs';

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
