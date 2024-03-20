/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Request will be used to examine diagnostics for the given `file`.
 */
export interface DiagnosticsRequest {
  file: string;
}

export interface DiagnosticsResult {
  from?: number;
  to?: number;
  message: string;
  source?: string;
  code: number;
  severity: string;
  lineNumber?: number;
  characterPosition?: number;
}

export type DiagnosticsResponse = DiagnosticsResult[];
