/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {RendererThis, Token, TokenizerAndRendererExtension, TokenizerThis, Tokens} from 'marked';

/** Enum of all available alert severities. */
export enum AlertSeverityLevel {
  NOTE = 'NOTE',
  TIP = 'TIP',
  TODO = 'TODO',
  QUESTION = 'QUESTION',
  SUMMARY = 'SUMMARY',
  TLDR = 'TL;DR',
  CRITICAL = 'CRITICAL',
  IMPORTANT = 'IMPORTANT',
  HELPFUL = 'HELPFUL',
}

/** Token for docs-alerts */
interface DocsAlertToken extends Tokens.Generic {
  type: 'docs-alert';
  severityLevel: string;
}

/** Alert severity level keys. */
const alertSeverityLevels = Object.keys(AlertSeverityLevel).map((lvl) => `${lvl}`);
const tokenMatcher = new RegExp(
  `^\s*(${alertSeverityLevels.join('|')}): (.*?)(?:\n{2,}|\s*$)`,
  's',
);

export const docsAlertExtension: TokenizerAndRendererExtension = {
  name: 'docs-alert',
  level: 'inline',
  tokenizer(this: TokenizerThis, src: string): DocsAlertToken | undefined {
    const execMatch = tokenMatcher.exec(src);
    if (execMatch === null) {
      return undefined;
    }

    const severityLevelKey = execMatch[1] as keyof typeof AlertSeverityLevel;
    const severityLevelValue = AlertSeverityLevel[severityLevelKey];
    return {
      type: 'docs-alert',
      raw: execMatch[0],
      severityLevel: severityLevelKey,
      tokens: this.lexer.inlineTokens(`**${severityLevelValue}:** ${execMatch[2].trim()}`, []),
    };
  },
  renderer(this: RendererThis, token: Tokens.Generic) {
    if (token.tokens) {
      return `
      <div class="docs-alert docs-alert-${token.severityLevel.toLowerCase()}">
        <p>${this.parser.parseInline(token.tokens)}</p>
      </div>
      `;
    }
  },
};
