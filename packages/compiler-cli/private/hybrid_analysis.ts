/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export {
  type TemplateDiagnostic,
  type SourceMapping,
  type SymbolReference,
  SymbolKind,
} from '../src/ngtsc/typecheck/api';
export {RegistryDomSchemaChecker} from '../src/ngtsc/typecheck/src/dom';
export {Environment} from '../src/ngtsc/typecheck/src/environment';
export {ImportManager} from '../src/ngtsc/translator';
export type {ReferenceEmitter} from '../src/ngtsc/imports';
export type {ReflectionHost, ClassDeclaration} from '../src/ngtsc/reflection';
export type {TypeCheckSourceResolver} from '../src/ngtsc/typecheck/src/tcb_util';
export {
  findFirstMatchingNode,
  ExpressionIdentifier,
  hasExpressionIdentifier,
} from '../src/ngtsc/typecheck/src/comments';
export {
  SymbolBuilder,
  SymbolBoundTarget,
  SymbolDirectiveMeta,
} from '../src/ngtsc/typecheck/src/template_symbol_builder';
