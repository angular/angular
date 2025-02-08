/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {RendererThis, Token, TokenizerThis, Tokens} from 'marked';

/** Enum of all available alert severities. */
export enum AlertSeverityLevel {
  Note = 'NOTE',
  Tip = 'TIP',
  TODO = 'TODO',
  QUESTION = 'QUESTION',
  Summary = 'SUMMARY',
  TLDR = 'TLDR',
  CRITICAL = 'CRITICAL',
  IMPORTANT = 'IMPORTANT',
  HELPFUL = 'HELPFUL',
}

/** Token for docs-alerts */
interface DocsAlertToken extends Tokens.Generic {
  type: 'docs-alert';
  body: string;
  severityLevel: string;
  tokens: Token[];
}

interface DocsAlert {
  alert: RegExpExecArray | null;
  severityLevel: string;
}

export const docsAlertExtension = {
  name: 'docs-alert',
  level: 'block' as const,
  tokenizer(this: TokenizerThis, src: string): DocsAlertToken | undefined {
    let match: DocsAlert | undefined;
    for (let level in AlertSeverityLevel) {
      // Capture group 1: all alert text content after the severity level
      const rule = new RegExp('^s*' + level + ': (.*?)\n(\n|$)', 's');
      const possibleMatch = rule.exec(src);

      if (possibleMatch?.[1]) {
        match = {
          severityLevel: level,
          alert: possibleMatch,
        };
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
  renderer(this: RendererThis, token: DocsAlertToken) {
    return `
    <div class="docs-alert docs-alert-${token.severityLevel.toLowerCase()}">
    ${this.parser.parse(token.tokens)}
    </div>
    `;
  },
};
