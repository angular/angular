/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export * from './src/api.js';
export {aliasTransformFactory} from './src/alias.js';
export {ClassRecord, TraitCompiler} from './src/compilation.js';
export {declarationTransformFactory, DtsTransformRegistry, IvyDeclarationDtsTransform} from './src/declaration.js';
export {AnalyzedTrait, PendingTrait, ResolvedTrait, SkippedTrait, Trait, TraitState} from './src/trait.js';
export {ivyTransformFactory} from './src/transform.js';
