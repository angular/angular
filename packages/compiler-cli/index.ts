/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export {AotCompilerHost, AotCompilerHost as StaticReflectorHost, StaticReflector, StaticSymbol} from '@angular/compiler';
export {CodeGenerator} from './src/codegen';
export {CompilerHost, CompilerHostContext, ModuleResolutionHostAdapter, NodeCompilerHostContext} from './src/compiler_host';
export {DiagnosticTemplateInfo, getExpressionScope, getTemplateExpressionDiagnostics} from './src/diagnostics/expression_diagnostics';
export {AstType, ExpressionDiagnosticsContext} from './src/diagnostics/expression_type';
export {BuiltinType, DeclarationKind, Definition, PipeInfo, Pipes, Signature, Span, Symbol, SymbolDeclaration, SymbolQuery, SymbolTable} from './src/diagnostics/symbols';
export {getClassMembersFromDeclaration, getPipesTable, getSymbolQuery} from './src/diagnostics/typescript_symbols';
export {Extractor} from './src/extractor';
export {VERSION} from './src/version';

export * from './src/metadata';
export * from './src/transformers/api';
export * from './src/transformers/entry_points';

export * from './src/perform_compile';

// TODO(tbosch): remove this once everyone is on transformers
export {CompilerOptions as AngularCompilerOptions} from './src/transformers/api';

// TODO(hansl): moving to Angular 4 need to update this API.
export {NgTools_InternalApi_NG_2 as __NGTOOLS_PRIVATE_API_2} from './src/ngtools_api';
