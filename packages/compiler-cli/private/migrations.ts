/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @fileoverview The API from compiler-cli that the `@angular/core`
 * package requires for migration schematics.
 */

export {forwardRefResolver} from '../src/ngtsc/annotations/index.js';
export {Reference} from '../src/ngtsc/imports/index.js';
export {DynamicValue, PartialEvaluator, ResolvedValue, ResolvedValueMap, StaticInterpreter} from '../src/ngtsc/partial_evaluator/index.js';
export {reflectObjectLiteral, TypeScriptReflectionHost} from '../src/ngtsc/reflection/index.js';
