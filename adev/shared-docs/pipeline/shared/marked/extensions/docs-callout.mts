/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Tokens, Token, TokenizerThis, RendererThis} from 'marked';

/** Enum of all available callout severities. */
export enum CalloutSeverityLevel {
  HELPFUL = 'HELPFUL',
  IMPORTANT = 'IMPORTANT',
  CRITICAL = 'CRITICAL',
}

/** Token for docs-callouts */
interface DocsCalloutToken extends Tokens.Generic {
  type: 'docs-callout';
  title: string;
  titleTokens: Token[];
  severityLevel: CalloutSeverityLevel;
  body: string;
  bodyTokens: Token[];
}

// Capture group 1: all attributes on the opening tag
// Capture group 2: all content between the open and close tags
const calloutRule = /^<docs-callout([^>]*)>((?:.(?!\/docs-callout))*)<\/docs-callout>/s;

const titleRule = /title="([^"]*)"/;
const isImportantRule = /important/;
const isCriticalRule = /critical/;

export const docsCalloutExtension = {
  name: 'docs-callout',
  level: 'block' as const,
  start(src: string) {
    return src.match(/^\s*<docs-callout/m)?.index;
  },
  tokenizer(this: TokenizerThis, src: string) {
    const match = calloutRule.exec(src);

    if (match) {
      const attr = match[1].trim();
      const title = titleRule.exec(attr);

      let severityLevel = CalloutSeverityLevel.HELPFUL;
      if (isImportantRule.exec(attr)) severityLevel = CalloutSeverityLevel.IMPORTANT;
      if (isCriticalRule.exec(attr)) severityLevel = CalloutSeverityLevel.CRITICAL;

      const body = match[2].trim();

      const token: DocsCalloutToken = {
        type: 'docs-callout',
        raw: match[0],
        severityLevel: severityLevel,
        title: title ? title[1] : '',
        titleTokens: [],
        body: body ?? '',
        bodyTokens: [],
      };
      this.lexer.inlineTokens(token.title, token.titleTokens);
      this.lexer.blockTokens(token.body, token.bodyTokens);
      return token;
    }
    return undefined;
  },
  renderer(this: RendererThis, token: DocsCalloutToken) {
    return `
    <div class="docs-callout docs-callout-${token.severityLevel.toLowerCase()}">
      <h3>${this.parser.parseInline(token.titleTokens)}</h3>
      ${this.parser.parse(token.bodyTokens)}
    </div>
    `;
  },
};
