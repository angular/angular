/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {marked} from 'marked';
import {CalloutSeverityLevel} from './enums/levels.mjs';
interface DocsCalloutToken extends marked.Tokens.Generic {
  type: 'docs-callout';
  title: string;
  titleTokens: marked.Token[];
  severityLevel: CalloutSeverityLevel;
  body: string;
  bodyTokens: marked.Token[];
}

// Capture group 1: all attributes on the opening tag
// Capture group 2: all content between the open and close tags
const calloutRule = /^<docs-callout([^>]*)>((?:.(?!\/docs-callout))*)<\/docs-callout>/s;

const titleRule = /title="([^"]*)"/;
const isImportantRule = /important/;
const isCriticalRule = /critical/;

export const docsCalloutExtension = {
  name: 'docs-callout',
  level: 'block',
  start(src: string) {
    return src.match(/^\s*<docs-callout/m)?.index;
  },
  tokenizer(this: marked.TokenizerThis, src: string): DocsCalloutToken | undefined {
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
  renderer(this: marked.RendererThis, token: DocsCalloutToken) {
    return `
    <div class="docs-callout docs-callout-${token.severityLevel.toLowerCase()}">
      <h3>${this.parser.parseInline(token.titleTokens)}</h3>
      <p>${this.parser.parse(token.bodyTokens)}</p>
    </div>
    `;
  },
};
