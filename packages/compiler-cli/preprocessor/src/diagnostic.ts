/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {OutOfBandDiagnosticCategory, TypeCheckId, VERSION} from '@angular/compiler';
import type {NgDiagnostic} from './types.js';

export interface Diagnostic {
  readonly typeCheckId: TypeCheckId;
  readonly category: OutOfBandDiagnosticCategory;
  readonly code?: number;
  readonly message: string;
  readonly start: number;
  readonly end: number;
}

/**
 * Angular error codes that have an error guide at `https://angular.dev/errors/NG<code>`.
 *
 * Keep in sync with the negative entries of `ErrorCode` in
 * `packages/compiler-cli/src/ngtsc/diagnostics/src/error_code.ts` (ngtsc marks a code as having
 * a guide by negating it).
 */
const ERROR_CODES_WITH_GUIDES: ReadonlySet<number> = new Set([
  1001, // DECORATOR_ARG_NOT_LITERAL
  2003, // PARAM_MISSING_TOKEN
  2009, // COMPONENT_INVALID_SHADOW_DOM_SELECTOR
  3003, // IMPORT_CYCLE_DETECTED
  6100, // WARN_NGMODULE_ID_UNNECESSARY
  8001, // SCHEMA_INVALID_ELEMENT
  8002, // SCHEMA_INVALID_ATTRIBUTE
  8003, // MISSING_REFERENCE_TARGET
  8011, // CONTROL_FLOW_PREVENTING_CONTENT_PROJECTION
  8023, // MULTIPLE_MATCHING_COMPONENTS
  8024, // CONFLICTING_HOST_DIRECTIVE_BINDING
]);

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
 * (`NgCompiler.addMessageTextDetails`). Diagnostics with other codes are returned unchanged.
 */
export function withErrorGuide(diag: NgDiagnostic): NgDiagnostic {
  if (!ERROR_CODES_WITH_GUIDES.has(diag.code)) {
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
