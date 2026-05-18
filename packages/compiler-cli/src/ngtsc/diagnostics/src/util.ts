/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {ErrorCode} from './error_code';
import {ERROR_DETAILS_PAGE_BASE_URL} from './error_details_base_url';

const ERROR_CODE_MATCHER = /(\u001b\[\d+m ?)TS-99(\d+: ?\u001b\[\d+m)/g;

const ERROR_CODE_MARKER = 99;

const ERROR_CODE_MARKER_DIGITS = String(ERROR_CODE_MARKER).length;

/**
 * During formatting of `ts.Diagnostic`s, the numeric code of each diagnostic is prefixed with the
 * hard-coded "TS" prefix. For Angular's own error codes, a prefix of "NG" is desirable. To achieve
 * this, all Angular error codes start with "-99" so that the sequence "TS-99" can be assumed to
 * correspond with an Angular specific error code. This function replaces those occurrences with
 * just "NG".
 *
 * @param errors The formatted diagnostics
 */
export function replaceTsWithNgInErrors(errors: string): string {
  return errors.replace(ERROR_CODE_MATCHER, '$1NG$2');
}

export function ngErrorCode(code: ErrorCode): number {
  const absoluteCode = Math.abs(code);
  return -(ERROR_CODE_MARKER * 10 ** decimalDigits(absoluteCode) + absoluteCode);
}

export function formatCompilerErrorCode(code: number): string {
  return `NG${Math.abs(code)}`;
}

/**
 * Given a raw TypeScript diagnostic code, returns the corresponding {@link ErrorCode} if it is a
 * negative Angular error code that has an associated error guide, or `null` otherwise.
 */
export function errorCodeWithGuideFromDiagnosticCode(code: number): ErrorCode | null {
  const absoluteErrorCode = absoluteErrorCodeFromDiagnosticCode(code);
  if (absoluteErrorCode === null) {
    return null;
  }

  const codeWithGuide = -absoluteErrorCode;
  return ErrorCode[codeWithGuide] !== undefined ? codeWithGuide : null;
}

/**
 * Appends a "Find more at <url>" guide link to the root message of a diagnostic.
 * Nested messages in {@link ts.DiagnosticMessageChain.next} are left unchanged.
 */
export function addDiagnosticDetails(
  code: ErrorCode,
  messageText: string | ts.DiagnosticMessageChain,
): string | ts.DiagnosticMessageChain {
  const details = `Find more at ${ERROR_DETAILS_PAGE_BASE_URL}/${formatCompilerErrorCode(code)}`;

  if (typeof messageText === 'string') {
    return appendMessageText(messageText, details);
  }

  return {
    ...messageText,
    messageText: appendMessageText(messageText.messageText, details),
  };
}

function appendMessageText(messageText: string, textToAppend: string): string {
  if (messageText === '') {
    return textToAppend;
  }

  const separator = messageText.match(/[.,;!?\n]$/) ? ' ' : '. ';
  return `${messageText}${separator}${textToAppend}`;
}

function absoluteErrorCodeFromDiagnosticCode(code: number): number | null {
  if (code >= 0) return null;

  const diagnosticCode = Math.abs(code);
  const markerMultiplier = 10 ** (decimalDigits(diagnosticCode) - ERROR_CODE_MARKER_DIGITS);

  if (markerMultiplier <= 1) return null;

  const marker = Math.trunc(diagnosticCode / markerMultiplier);
  return marker === ERROR_CODE_MARKER ? diagnosticCode % markerMultiplier : null;
}

function decimalDigits(value: number): number {
  return String(value).length;
}
