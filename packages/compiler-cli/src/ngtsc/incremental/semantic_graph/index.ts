/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export {SemanticReference, SemanticSymbol} from './src/api';
export {SemanticDepGraph, SemanticDepGraphUpdater} from './src/graph';
export {
  areTypeParametersEqual,
  extractSemanticTypeParameters,
  SemanticTypeParameter,
} from './src/type_parameters';
export {isArrayEqual, isReferenceEqual, isSetEqual, isSymbolEqual} from './src/util';
