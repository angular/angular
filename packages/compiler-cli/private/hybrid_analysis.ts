/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// TCB generation exports for ng-hybrid-preprocessor
export {generateTypeCheckBlock} from '../src/ngtsc/typecheck/src/type_check_block';
export type {
  TypeCheckingConfig,
  TcbComponentMetadata,
  TcbTypeCheckBlockMetadata,
  TcbTypeParameter,
  TypeCheckId,
  TcbDirectiveMetadata,
  TemplateDiagnostic,
  TcbReferenceMetadata,
  SourceMapping,
} from '../src/ngtsc/typecheck/api';
export {DomSchemaChecker, RegistryDomSchemaChecker} from '../src/ngtsc/typecheck/src/dom';
export {Environment} from '../src/ngtsc/typecheck/src/environment';
export {OutOfBandDiagnosticRecorder} from '../src/ngtsc/typecheck/src/oob';
export {TcbGenericContextBehavior} from '../src/ngtsc/typecheck/src/ops/context';
export {ImportManager} from '../src/ngtsc/translator';
export type {ReferenceEmitter} from '../src/ngtsc/imports';
export type {ReflectionHost, ClassDeclaration} from '../src/ngtsc/reflection';
export {ClassPropertyMapping} from '../src/ngtsc/metadata/src/property_mapping';
export type {TypeCheckSourceResolver} from '../src/ngtsc/typecheck/src/tcb_util';
export {
  createHostElement,
  type SourceNode,
  type StaticSourceNode,
  type HostObjectLiteralBinding,
  type HostListenerDecorator,
  type HostBindingDecorator,
} from '../src/ngtsc/typecheck/src/host_bindings';
