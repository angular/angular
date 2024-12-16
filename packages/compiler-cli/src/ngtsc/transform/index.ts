/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export * from './src/api';
export {aliasTransformFactory} from './src/alias';
export {ClassRecord, TraitCompiler} from './src/compilation';
export {
  declarationTransformFactory,
  DtsTransformRegistry,
  IvyDeclarationDtsTransform,
} from './src/declaration';
export {
  AnalyzedTrait,
  PendingTrait,
  ResolvedTrait,
  SkippedTrait,
  Trait,
  TraitState,
} from './src/trait';
export {ivyTransformFactory} from './src/transform';
export {signalMetadataTransform} from './src/implicit_signal_debug_name_transform';
