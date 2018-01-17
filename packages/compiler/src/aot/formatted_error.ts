/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {syntaxError} from '../util';

export interface Position {
  fileName: string;
  line: number;
  column: number;
}

export interface FormattedMessageChain {
  message: string;
  position?: Position;
  next?: FormattedMessageChain;
}

export type FormattedError = Error & {
  chain: FormattedMessageChain;
  position?: Position;
};

const FORMATTED_MESSAGE = 'ngFormattedMessage';

function indentStr(level: number): string {
  if (level <= 0) return '';
  if (level < 6) return ['', ' ', '  ', '   ', '    ', '     '][level];
  const half = indentStr(Math.floor(level / 2));
  return half + half + (level % 2 === 1 ? ' ' : '');
}

function formatChain(chain: FormattedMessageChain | undefined, indent: number = 0): string {
  if (!chain) return '';
  const position = chain.position ?
      `${chain.position.fileName}(${chain.position.line+1},${chain.position.column+1})` :
      '';
  const prefix = position && indent === 0 ? `${position}: ` : '';
  const postfix = position && indent !== 0 ? ` at ${position}` : '';
  const message = `${prefix}${chain.message}${postfix}`;

  return `${indentStr(indent)}${message}${(chain.next && ('\n' + formatChain(chain.next, indent + 2))) || ''}`;
}

export function formattedError(chain: FormattedMessageChain): FormattedError {
  const message = formatChain(chain) + '.';
  const error = syntaxError(message) as FormattedError;
  (error as any)[FORMATTED_MESSAGE] = true;
  error.chain = chain;
  error.position = chain.position;
  return error;
}

export function isFormattedError(error: Error): error is FormattedError {
  return !!(error as any)[FORMATTED_MESSAGE];
}
