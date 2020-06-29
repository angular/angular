/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export * from './src/api';
export {ReusedProgramStrategy} from './src/augmented_program';
export {TemplateTypeChecker, ProgramTypeCheckAdapter} from './src/checker';
export {TypeCheckContext} from './src/context';
export {TemplateDiagnostic, isTemplateDiagnostic} from './src/diagnostics';
export {TypeCheckShimGenerator} from './src/shim';
export {TypeCheckProgramHost} from './src/host';
export {typeCheckFilePath} from './src/type_check_file';
