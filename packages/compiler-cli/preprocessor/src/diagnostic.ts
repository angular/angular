/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {OutOfBandDiagnosticCategory, TypeCheckId, VERSION} from '@angular/compiler';
import {ErrorCode} from './error_code.js';
import type {NgDiagnostic} from './types.js';

export interface DiagnosticRelatedInformation {
  readonly message: string;
  readonly start: number;
  readonly end: number;
  readonly sourceFilePath?: string;
}

export interface Diagnostic {
  readonly typeCheckId: TypeCheckId;
  readonly category: OutOfBandDiagnosticCategory;
  readonly code?: number;
  readonly message: string;
  readonly start: number;
  readonly end: number;
  readonly sourceFilePath?: string;
  readonly relatedInformation?: readonly DiagnosticRelatedInformation[];
}

/**
 * Base URL of the error guides for the version of Angular being compiled with.
 *
 * Keep in sync with `packages/compiler-cli/src/ngtsc/diagnostics/src/error_details_base_url.ts`.
 */
const ERROR_DETAILS_PAGE_BASE_URL: string = (() => {
  const full = VERSION.full;
  const isPreRelease =
    full.includes('-next') || full.includes('-rc') || full === '0.0.0' + '-PLACEHOLDER';
  const prefix = isPreRelease ? 'next' : `v${VERSION.major}`;
  return `https://${prefix}.angular.dev/errors`;
})();

/**
 * Appends the "Find more at <url>" link to a diagnostic whose Angular error code has an error
 * guide on angular.dev, as ngtsc does for every diagnostic it reports
 * (`NgCompiler.addMessageTextDetails`). `ErrorCode` marks codes with guides by negating their
 * discriminant, so reverse-indexing `-Math.abs(code)` checks membership directly.
 */
export function withErrorGuide(diag: NgDiagnostic): NgDiagnostic {
  if (ErrorCode[-Math.abs(diag.code)] === undefined) {
    return diag;
  }
  const details = `Find more at ${ERROR_DETAILS_PAGE_BASE_URL}/NG${diag.code}`;
  const message = diag.messageText;
  if (message === '') {
    return {...diag, messageText: details};
  }
  const separator = /[.,;!?\n]$/.test(message) ? ' ' : '. ';
  return {...diag, messageText: `${message}${separator}${details}`};
}

export function flattenNgDiagnosticMessage(diag: NgDiagnostic): string {
  return [diag.messageText, ...(diag.next ?? [])].join('\n  ');
}
