/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export {AstFactory, BinaryOperator, LeadingComment, ObjectLiteralProperty, SourceMapLocation, SourceMapRange, TemplateElement, TemplateLiteral, UnaryOperator, VariableDeclarationType} from './src/api/ast_factory.js';
export {ImportGenerator, NamedImport} from './src/api/import_generator.js';
export {Context} from './src/context.js';
export {Import, ImportManager} from './src/import_manager.js';
export {ExpressionTranslatorVisitor, RecordWrappedNodeFn, TranslatorOptions} from './src/translator.js';
export {translateType} from './src/type_translator.js';
export {attachComments, createTemplateMiddle, createTemplateTail, TypeScriptAstFactory} from './src/typescript_ast_factory.js';
export {translateExpression, translateStatement} from './src/typescript_translator.js';
