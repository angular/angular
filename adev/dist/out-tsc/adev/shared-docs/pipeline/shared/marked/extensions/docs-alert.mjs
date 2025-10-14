/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/** Enum of all available alert severities. */
export var AlertSeverityLevel;
(function (AlertSeverityLevel) {
  AlertSeverityLevel['NOTE'] = 'NOTE';
  AlertSeverityLevel['TIP'] = 'TIP';
  AlertSeverityLevel['TODO'] = 'TODO';
  AlertSeverityLevel['QUESTION'] = 'QUESTION';
  AlertSeverityLevel['SUMMARY'] = 'SUMMARY';
  AlertSeverityLevel['TLDR'] = 'TL;DR';
  AlertSeverityLevel['CRITICAL'] = 'CRITICAL';
  AlertSeverityLevel['IMPORTANT'] = 'IMPORTANT';
  AlertSeverityLevel['HELPFUL'] = 'HELPFUL';
})(AlertSeverityLevel || (AlertSeverityLevel = {}));
export const docsAlertExtension = {
  name: 'docs-alert',
  level: 'block',
  tokenizer(src) {
    let match;
    for (const key of Object.keys(AlertSeverityLevel)) {
      // Capture group 1: all alert text content after the severity level
      const rule = new RegExp('^s*' + key + ': (.*?)(?:\n{2,}|\s*$)', 's');
      const possibleMatch = rule.exec(src);
      if (possibleMatch?.[1]) {
        match = {
          severityLevel: key,
          alert: possibleMatch,
        };
      }
    }
    if (match?.alert) {
      const token = {
        type: 'docs-alert',
        raw: match.alert[0],
        body: match.alert[1].trim(),
        severityLevel: match.severityLevel.toLowerCase(),
        tokens: [],
      };
      token.body = `**${AlertSeverityLevel[match.severityLevel]}:** ${token.body}`;
      this.lexer.blockTokens(token.body, token.tokens);
      return token;
    }
    return undefined;
  },
  renderer(token) {
    return `
    <div class="docs-alert docs-alert-${token.severityLevel.toLowerCase()}">
    ${this.parser.parse(token.tokens)}
    </div>
    `;
  },
};
//# sourceMappingURL=docs-alert.mjs.map
