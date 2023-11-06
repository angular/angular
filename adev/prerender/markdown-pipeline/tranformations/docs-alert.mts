/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {marked} from 'marked';
import {AlertSeverityLevel} from './enums/levels.mjs';

interface DocsAlertToken extends marked.Tokens.Generic {
  type: 'docs-alert';
  body: string;
  severityLevel: string;
  tokens: marked.Token[];
}

interface DocsAlert {
  alert: RegExpExecArray | null;
  severityLevel: string;
}

export const docsAlertExtension = {
  name: 'docs-alert',
  level: 'block',
  tokenizer(this: marked.TokenizerThis, src: string): DocsAlertToken | undefined {
    const match: DocsAlert = {
      alert: null,
      severityLevel: AlertSeverityLevel.HELPFUL,
    };
    for (let level in AlertSeverityLevel) {
      // Capture group 1: all alert text content after the severity level
      const rule = new RegExp('^s*' + level + ': (.*?)\n', 's');
      const possibleMatch = rule.exec(src);

      if (possibleMatch?.[1]) {
        match.alert = possibleMatch;
        match.severityLevel = level;
      }
    }

    if (match?.alert) {
      const token: DocsAlertToken = {
        type: 'docs-alert',
        raw: match.alert[0],
        body: match.alert[1].trim(),
        severityLevel: match.severityLevel,
        tokens: [],
      };
      token.body = `**${
        token.severityLevel === AlertSeverityLevel.TLDR ? 'TL;DR' : token.severityLevel
      }:** ${token.body}`;
      this.lexer.blockTokens(token.body, token.tokens);
      return token;
    }
    return undefined;
  },
  renderer(this: marked.RendererThis, token: DocsAlertToken) {
    return `
    <div class="docs-alert docs-alert-${token.severityLevel.toLowerCase()}">
    ${this.parser.parse(token.tokens)}
    </div>
    `;
  },
};
