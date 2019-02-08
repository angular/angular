/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

//////////////////////////////////////
// THIS FILE HAS GLOBAL SIDE EFFECT //
//       (see bottom of file)       //
//////////////////////////////////////

/**
 * @module
 * @description
 * Entry point for all APIs of the compiler package.
 *
 * <div class="callout is-critical">
 *   <header>Unstable APIs</header>
 *   <p>
 *     All compiler apis are currently considered experimental and private!
 *   </p>
 *   <p>
 *     We expect the APIs in this package to keep on changing. Do not rely on them.
 *   </p>
 * </div>
 */

import * as core from './core';
import {publishFacade} from './jit_compiler_facade';
import {global} from './util';

export {core};

export * from './version';
export * from './template_parser/template_ast';
export {CompilerConfig, preserveWhitespacesDefault} from './config';
export * from './compile_metadata';
export * from './aot/compiler_factory';
export * from './aot/compiler';
export * from './aot/generated_file';
export * from './aot/compiler_options';
export * from './aot/compiler_host';
export * from './aot/formatted_error';
export * from './aot/partial_module';
export * from './aot/static_reflector';
export * from './aot/static_symbol';
export * from './aot/static_symbol_resolver';
export * from './aot/summary_resolver';
export {isLoweredSymbol, createLoweredSymbol} from './aot/util';
export {LazyRoute} from './aot/lazy_routes';
export * from './ast_path';
export * from './summary_resolver';
export {Identifiers} from './identifiers';
export {JitCompiler} from './jit/compiler';
export * from './compile_reflector';
export * from './url_resolver';
export * from './resource_loader';
export {ConstantPool} from './constant_pool';
export {DirectiveResolver} from './directive_resolver';
export {PipeResolver} from './pipe_resolver';
export {NgModuleResolver} from './ng_module_resolver';
export {DEFAULT_INTERPOLATION_CONFIG, InterpolationConfig} from './ml_parser/interpolation_config';
export * from './schema/element_schema_registry';
export * from './i18n/index';
export * from './directive_normalizer';
export * from './expression_parser/ast';
export * from './expression_parser/lexer';
export * from './expression_parser/parser';
export * from './metadata_resolver';
export * from './ml_parser/ast';
export * from './ml_parser/html_parser';
export * from './ml_parser/html_tags';
export * from './ml_parser/interpolation_config';
export * from './ml_parser/tags';
export {NgModuleCompiler} from './ng_module_compiler';
export {ArrayType, AssertNotNull, BinaryOperator, BinaryOperatorExpr, BuiltinMethod, BuiltinType, BuiltinTypeName, BuiltinVar, CastExpr, ClassField, ClassMethod, ClassStmt, CommaExpr, CommentStmt, ConditionalExpr, DeclareFunctionStmt, DeclareVarStmt, Expression, ExpressionStatement, ExpressionType, ExpressionVisitor, ExternalExpr, ExternalReference, FunctionExpr, IfStmt, InstantiateExpr, InvokeFunctionExpr, InvokeMethodExpr, JSDocCommentStmt, LiteralArrayExpr, LiteralExpr, LiteralMapExpr, MapType, NotExpr, ReadKeyExpr, ReadPropExpr, ReadVarExpr, ReturnStatement, StatementVisitor, ThrowStmt, TryCatchStmt, Type, TypeVisitor, WrappedNodeExpr, WriteKeyExpr, WritePropExpr, WriteVarExpr, StmtModifier, Statement, TypeofExpr, collectExternalReferences} from './output/output_ast';
export {EmitterVisitorContext} from './output/abstract_emitter';
export {JitEvaluator} from './output/output_jit';
export * from './output/ts_emitter';
export * from './parse_util';
export * from './schema/dom_element_schema_registry';
export * from './selector';
export * from './style_compiler';
export * from './template_parser/template_parser';
export {ViewCompiler} from './view_compiler/view_compiler';
export {getParseErrors, isSyntaxError, syntaxError, Version} from './util';
export {SourceMap} from './output/source_map';
export * from './injectable_compiler_2';
export * from './render3/view/api';
export {BoundAttribute as TmplAstBoundAttribute, BoundEvent as TmplAstBoundEvent, BoundText as TmplAstBoundText, Content as TmplAstContent, Element as TmplAstElement, Node as TmplAstNode, Reference as TmplAstReference, Template as TmplAstTemplate, Text as TmplAstText, TextAttribute as TmplAstTextAttribute, Variable as TmplAstVariable,} from './render3/r3_ast';
export * from './render3/view/t2_api';
export * from './render3/view/t2_binder';
export {Identifiers as R3Identifiers} from './render3/r3_identifiers';
export {R3DependencyMetadata, R3FactoryMetadata, R3ResolvedDependencyType} from './render3/r3_factory';
export {compileInjector, compileNgModule, R3InjectorMetadata, R3NgModuleMetadata} from './render3/r3_module_compiler';
export {compilePipeFromMetadata, R3PipeMetadata} from './render3/r3_pipe_compiler';
export {makeBindingParser, parseTemplate} from './render3/view/template';
export {R3Reference} from './render3/util';
export {compileBaseDefFromMetadata, R3BaseRefMetaData, compileComponentFromMetadata, compileDirectiveFromMetadata, parseHostBindings, verifyHostBindings} from './render3/view/compiler';
export {publishFacade} from './jit_compiler_facade';
// This file only reexports content of the `src` folder. Keep it that way.

// This function call has a global side effects and publishes the compiler into global namespace for
// the late binding of the Compiler to the @angular/core for jit compilation.
publishFacade(global);