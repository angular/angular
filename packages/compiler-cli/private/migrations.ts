/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * @fileoverview The API from compiler-cli that the `@angular/core`
 * package requires for migration schematics.
 */

export {createForwardRefResolver} from '../src/ngtsc/annotations';
export {AbsoluteFsPath} from '../src/ngtsc/file_system';
export {Reference} from '../src/ngtsc/imports';
export {
  DynamicValue,
  PartialEvaluator,
  ResolvedValue,
  ResolvedValueMap,
  StaticInterpreter,
} from '../src/ngtsc/partial_evaluator';
export {reflectObjectLiteral, TypeScriptReflectionHost} from '../src/ngtsc/reflection';
export {
  PotentialImport,
  PotentialImportKind,
  PotentialImportMode,
  TemplateTypeChecker,
} from '../src/ngtsc/typecheck/api';
export {ImportManager} from '../src/ngtsc/translator';
