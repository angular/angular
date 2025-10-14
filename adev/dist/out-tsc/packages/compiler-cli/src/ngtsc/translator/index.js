/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export {Context} from './src/context';
export {
  ImportManager,
  presetImportManagerForceNamespaceImports,
} from './src/import_manager/import_manager';
export {ExpressionTranslatorVisitor} from './src/translator';
export {canEmitType, TypeEmitter} from './src/type_emitter';
export {translateType} from './src/type_translator';
export {
  attachComments,
  createTemplateMiddle,
  createTemplateTail,
  TypeScriptAstFactory,
} from './src/typescript_ast_factory';
export {translateExpression, translateStatement} from './src/typescript_translator';
//# sourceMappingURL=index.js.map
