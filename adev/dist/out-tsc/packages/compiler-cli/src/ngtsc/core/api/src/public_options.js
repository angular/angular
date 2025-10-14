/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * A label referring to a `ts.DiagnosticCategory` or `'suppress'`, meaning the associated diagnostic
 * should not be displayed at all.
 *
 * @publicApi
 */
export var DiagnosticCategoryLabel;
(function (DiagnosticCategoryLabel) {
  /** Treat the diagnostic as a warning, don't fail the compilation. */
  DiagnosticCategoryLabel['Warning'] = 'warning';
  /** Treat the diagnostic as a hard error, fail the compilation. */
  DiagnosticCategoryLabel['Error'] = 'error';
  /** Ignore the diagnostic altogether. */
  DiagnosticCategoryLabel['Suppress'] = 'suppress';
})(DiagnosticCategoryLabel || (DiagnosticCategoryLabel = {}));
//# sourceMappingURL=public_options.js.map
