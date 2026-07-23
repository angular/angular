/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export {
  addDiagnosticChain,
  FatalDiagnosticError,
  isFatalDiagnosticError,
  isLocalCompilationDiagnostics,
  makeDiagnostic,
  makeDiagnosticChain,
  makeRelatedInformation,
} from './src/error';
export {ErrorCode} from './src/error_code';
export {ERROR_DETAILS_PAGE_BASE_URL, DOC_PAGE_BASE_URL} from './src/error_details_base_url';
export {ExtendedTemplateDiagnosticName} from './src/extended_template_diagnostic_name';
export {
  addDiagnosticDetails,
  errorCodeWithGuideFromDiagnosticCode,
  formatCompilerErrorCode,
  ngErrorCode,
  replaceTsWithNgInErrors,
} from './src/util';
