/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export {getAngularDecorators} from '../src/ngtsc/annotations';
export {isFatalDiagnosticError} from '../src/ngtsc/diagnostics';
export {
  CompilationTicket,
  freshCompilationTicket,
  incrementalFromCompilerTicket,
  InternalOptions,
  LegacyNgcOptions,
  NgCompiler,
  NgCompilerAdapter,
  NgCompilerOptions,
  resourceChangeTicket,
  TypeCheckingOptions,
} from '../src/ngtsc/core';
export {Reference} from '../src/ngtsc/imports';
export {TrackedIncrementalBuildStrategy} from '../src/ngtsc/incremental';
export {
  DirectiveMeta,
  isExternalResource,
  MetaKind,
  PipeMeta,
  Resource,
} from '../src/ngtsc/metadata';
export {PerfPhase} from '../src/ngtsc/perf';
export {FileUpdate, ProgramDriver} from '../src/ngtsc/program_driver';
export {
  ClassDeclaration,
  DeclarationNode,
  isNamedClassDeclaration,
  ReflectionHost,
} from '../src/ngtsc/reflection';
export {isShim} from '../src/ngtsc/shims';
export {
  ExpressionIdentifier,
  findFirstMatchingNode,
  hasExpressionIdentifier,
} from '../src/ngtsc/typecheck';
export {
  CompletionKind,
  DirectiveModuleExportDetails,
  DirectiveSymbol,
  DomBindingSymbol,
  ElementSymbol,
  InputBindingSymbol,
  LetDeclarationSymbol,
  OutputBindingSymbol,
  PipeSymbol,
  PotentialDirective,
  PotentialDirectiveModuleSpecifierResolver,
  PotentialImportMode,
  PotentialPipe,
  ReferenceSymbol,
  SelectorlessComponentSymbol,
  SelectorlessDirectiveSymbol,
  Symbol,
  SymbolKind,
  TcbLocation,
  TemplateDeclarationSymbol,
  TemplateSymbol,
  TemplateTypeChecker,
  TsCompletionEntryInfo,
  TypeCheckableDirectiveMeta,
  VariableSymbol,
} from '../src/ngtsc/typecheck/api';
export {getRootDirs} from '../src/ngtsc/util/src/typescript';
