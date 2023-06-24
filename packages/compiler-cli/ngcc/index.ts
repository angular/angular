#!/usr/bin/env node
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// https://github.com/chalk/chalk/blob/a370f468a43999e4397094ff5c3d17aadcc4860e/source/utilities.js#L21
function stringEncaseCRLFWithFirstIndex(
    value: string, prefix: string, postfix: string, index: number): string {
  let endIndex = 0;
  let returnValue = '';

  do {
    const gotCR = value[index - 1] === '\r';
    returnValue += value.substring(endIndex, gotCR ? index - 1 : index) + prefix +
        (gotCR ? '\r\n' : '\n') + postfix;
    endIndex = index + 1;
    index = value.indexOf('\n', endIndex);
  } while (index !== -1);

  returnValue += value.substring(endIndex);
  return returnValue;
}

// adapted from
// https://github.com/chalk/chalk/blob/a370f468a43999e4397094ff5c3d17aadcc4860e/source/index.js#L194
function styleMessage(message: string): string {
  // red + bold
  const open = '\x1b[31m\x1b[1m';
  const close = '\x1b[22m\x1b[39m';

  let styledMessage = message;
  const lfIndex = styledMessage.indexOf('\n');
  if (lfIndex !== -1) {
    styledMessage = stringEncaseCRLFWithFirstIndex(styledMessage, close, open, lfIndex);
  }

  return open + styledMessage + close;
}

const warningMsg = `

==========================================

ALERT: As of Angular 16, "ngcc" is no longer required and not invoked during CLI builds. You are seeing this message because the current operation invoked the "ngcc" command directly. This "ngcc" invocation can be safely removed.

A common reason for this is invoking "ngcc" from a "postinstall" hook in package.json.

In Angular 17, this command will be removed. Remove this and any other invocations to prevent errors in later versions.

==========================================

`;

console.warn(styleMessage(warningMsg));
process.exit(0);
