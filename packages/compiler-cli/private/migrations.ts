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

export {
  createForwardRefResolver,
  ExternalTemplateDeclaration,
  extractDecoratorQueryMetadata,
  extractTemplate,
  findAngularDecorator,
  getAngularDecorators,
  InlineTemplateDeclaration,
  queryDecoratorNames,
  QueryFunctionName,
  ResourceLoader,
  unwrapExpression,
  parseDecoratorInputTransformFunction,
} from '../src/ngtsc/annotations';
export {
  AbsoluteFsPath,
  FileSystem,
  getFileSystem,
  isLocalRelativePath,
  NodeJSFileSystem,
} from '../src/ngtsc/file_system';
export {CompilationMode} from '../src/ngtsc/transform';

export {
  DiagnosticCategoryLabel,
  NgCompiler,
  NgCompilerOptions,
  UnifiedModulesHost,
} from '../src/ngtsc/core';
export {Reference, ReferenceEmitter, ReferenceEmitKind} from '../src/ngtsc/imports';
export {
  DecoratorInputTransform,
  DtsMetadataReader,
  MetadataReader,
  DirectiveMeta,
  InputMapping,
} from '../src/ngtsc/metadata';
export {
  DynamicValue,
  PartialEvaluator,
  ResolvedValue,
  ResolvedValueMap,
  StaticInterpreter,
} from '../src/ngtsc/partial_evaluator';
export {
  ClassDeclaration,
  Decorator,
  ReflectionHost,
  reflectObjectLiteral,
  TypeScriptReflectionHost,
} from '../src/ngtsc/reflection';
export {
  PotentialImport,
  PotentialImportKind,
  PotentialImportMode,
  SymbolKind,
  TemplateTypeChecker,
} from '../src/ngtsc/typecheck/api';

export {getRootDirs} from '../src/ngtsc/util/src/typescript';

export {FatalDiagnosticError} from '../src/ngtsc/diagnostics';
export {isShim} from '../src/ngtsc/shims';
export {ImportManager} from '../src/ngtsc/translator';
