/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {DEFAULT_ERROR_CODE, SOURCE} from './api';


export function error(msg: string): never {
  throw new Error(`Internal error: ${msg}`);
}

export function createMessageDiagnostic(messageText: string): ts.Diagnostic {
  return {
    file: undefined,
    start: undefined,
    length: undefined,
    category: ts.DiagnosticCategory.Message,
    messageText,
    code: DEFAULT_ERROR_CODE,
    source: SOURCE,
  };
}

/**
 * Strip multiline comment start and end markers from the `commentText` string.
 *
 * This will also strip the JSDOC comment start marker (`/**`).
 */
export function stripComment(commentText: string): string {
  return commentText.replace(/^\/\*\*?/, '').replace(/\*\/$/, '').trim();
}
