/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// TCB generation exports for ng-hybrid-preprocessor
export {generateTypeCheckBlock} from '../src/ngtsc/typecheck/src/type_check_block';
export {
  type TypeCheckingConfig,
  type TcbComponentMetadata,
  type TcbTypeCheckBlockMetadata,
  type TcbTypeParameter,
  type TypeCheckId,
  type TcbDirectiveMetadata,
  type TemplateDiagnostic,
  type TcbReferenceMetadata,
  type SourceMapping,
  type OutOfBandDiagnosticRecorder,
  type DomSchemaChecker,
  OutOfBadDiagnosticCategory,
} from '../src/ngtsc/typecheck/api';
export {RegistryDomSchemaChecker} from '../src/ngtsc/typecheck/src/dom';
export {Environment} from '../src/ngtsc/typecheck/src/environment';
export {TcbGenericContextBehavior} from '../src/ngtsc/typecheck/src/ops/context';
export {ImportManager} from '../src/ngtsc/translator';
export type {ReferenceEmitter} from '../src/ngtsc/imports';
export type {ReflectionHost, ClassDeclaration} from '../src/ngtsc/reflection';
export type {TypeCheckSourceResolver} from '../src/ngtsc/typecheck/src/tcb_util';
export {
  createHostElement,
  type SourceNode,
  type StaticSourceNode,
  type HostObjectLiteralBinding,
  type HostListenerDecorator,
  type HostBindingDecorator,
} from '../src/ngtsc/typecheck/src/host_bindings';
export {
  findFirstMatchingNode,
  ExpressionIdentifier,
  hasExpressionIdentifier,
} from '../src/ngtsc/typecheck/src/comments';
export {SymbolBuilder} from '../src/ngtsc/typecheck/src/template_symbol_builder';
