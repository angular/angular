/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ParseErrorLevel, ParseSourceSpan} from '@angular/compiler';

export class I18nError extends Error {
  constructor(
      public span: ParseSourceSpan, public msg: string,
      public level: ParseErrorLevel = ParseErrorLevel.ERROR) {
    super(msg);
  }

  contextualMessage(): string {
    const ctx = this.span.start.getContext(100, 3);
    return ctx ? `${this.msg} ("${ctx.before}[${ParseErrorLevel[this.level]} ->]${ctx.after}")` :
                 this.msg;
  }

  toString(): string {
    const details = this.span.details ? `, ${this.span.details}` : '';
    return `${this.contextualMessage()}: ${this.span.start}${details}`;
  }
}
