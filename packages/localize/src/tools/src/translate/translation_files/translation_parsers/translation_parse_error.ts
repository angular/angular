/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ParseErrorLevel, ParseSourceSpan} from '@angular/compiler';

/**
 * This error is thrown when there is a problem parsing a translation file.
 */
export class TranslationParseError extends Error {
  constructor(
      public span: ParseSourceSpan, public msg: string,
      public level: ParseErrorLevel = ParseErrorLevel.ERROR) {
    super(contextualMessage(span, msg, level));
  }
}

function contextualMessage(span: ParseSourceSpan, msg: string, level: ParseErrorLevel): string {
  const ctx = span.start.getContext(100, 2);
  msg += `\nAt ${span.start}${span.details ? `, ${span.details}` : ''}:\n`;
  if (ctx) {
    msg += `...${ctx.before}[${ParseErrorLevel[level]} ->]${ctx.after}...\n`;
  }
  return msg;
}
