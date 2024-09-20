/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export {
  AstFactory,
  BinaryOperator,
  LeadingComment,
  ObjectLiteralProperty,
  SourceMapLocation,
  SourceMapRange,
  TemplateElement,
  TemplateLiteral,
  UnaryOperator,
  VariableDeclarationType,
} from './src/api/ast_factory';
export {ImportGenerator, ImportRequest} from './src/api/import_generator';
export {Context} from './src/context';
export {
  ImportManager,
  ImportManagerConfig,
  presetImportManagerForceNamespaceImports,
} from './src/import_manager/import_manager';
export {
  ExpressionTranslatorVisitor,
  RecordWrappedNodeFn,
  TranslatorOptions,
} from './src/translator';
export {canEmitType, TypeEmitter, TypeReferenceTranslator} from './src/type_emitter';
export {translateType} from './src/type_translator';
export {
  attachComments,
  createTemplateMiddle,
  createTemplateTail,
  TypeScriptAstFactory,
} from './src/typescript_ast_factory';
export {translateExpression, translateStatement} from './src/typescript_translator';
