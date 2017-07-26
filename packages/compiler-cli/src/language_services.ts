/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/*

The API from compiler-cli that language-service can see.
It is important that none the exported modules require anything other than
Angular modules and Typescript as this will indirectly add a dependency
to the language service.

*/
export {CompilerHost, CompilerHostContext, ModuleResolutionHostAdapter, NodeCompilerHostContext} from './compiler_host';
export {DiagnosticTemplateInfo, ExpressionDiagnostic, getExpressionDiagnostics, getExpressionScope, getTemplateExpressionDiagnostics} from './diagnostics/expression_diagnostics';
export {AstType, DiagnosticKind, ExpressionDiagnosticsContext, TypeDiagnostic} from './diagnostics/expression_type';
export {BuiltinType, DeclarationKind, Definition, Location, PipeInfo, Pipes, Signature, Span, Symbol, SymbolDeclaration, SymbolQuery, SymbolTable} from './diagnostics/symbols';
export {getClassFromStaticSymbol, getClassMembers, getClassMembersFromDeclaration, getPipesTable, getSymbolQuery} from './diagnostics/typescript_symbols';
export {CompilerOptions} from './transformers/api';
