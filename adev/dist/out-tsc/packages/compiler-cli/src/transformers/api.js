/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export const DEFAULT_ERROR_CODE = 100;
export const UNKNOWN_ERROR_CODE = 500;
export const SOURCE = 'angular';
export function isTsDiagnostic(diagnostic) {
  return diagnostic != null && diagnostic.source !== 'angular';
}
export var EmitFlags;
(function (EmitFlags) {
  EmitFlags[(EmitFlags['DTS'] = 1)] = 'DTS';
  EmitFlags[(EmitFlags['JS'] = 2)] = 'JS';
  EmitFlags[(EmitFlags['Metadata'] = 4)] = 'Metadata';
  EmitFlags[(EmitFlags['I18nBundle'] = 8)] = 'I18nBundle';
  EmitFlags[(EmitFlags['Codegen'] = 16)] = 'Codegen';
  EmitFlags[(EmitFlags['Default'] = 19)] = 'Default';
  EmitFlags[(EmitFlags['All'] = 31)] = 'All';
})(EmitFlags || (EmitFlags = {}));
//# sourceMappingURL=api.js.map
