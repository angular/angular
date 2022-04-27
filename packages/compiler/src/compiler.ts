/**
 * @license
 * Copyright Google LLC All Rights Reserved.
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

import * as core from './core.js';
import {publishFacade} from './jit_compiler_facade.js';
import {global} from './util.js';

export {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, SchemaMetadata} from './core.js';
export {core};

export * from './version.js';
export {CompilerConfig, preserveWhitespacesDefault} from './config.js';
export * from './resource_loader.js';
export {ConstantPool} from './constant_pool.js';
export {DEFAULT_INTERPOLATION_CONFIG, InterpolationConfig} from './ml_parser/interpolation_config.js';
export * from './schema/element_schema_registry.js';
export * from './i18n/index.js';
export * from './expression_parser/ast.js';
export * from './expression_parser/lexer.js';
export * from './expression_parser/parser.js';
export * from './ml_parser/ast.js';
export * from './ml_parser/html_parser.js';
export * from './ml_parser/html_tags.js';
export * from './ml_parser/interpolation_config.js';
export * from './ml_parser/tags.js';
export {ParseTreeResult, TreeError} from './ml_parser/parser.js';
export {LexerRange} from './ml_parser/lexer.js';
export * from './ml_parser/xml_parser.js';
export {ArrayType, DYNAMIC_TYPE, BinaryOperator, BinaryOperatorExpr, BuiltinType, BuiltinTypeName, CommaExpr, ConditionalExpr, DeclareFunctionStmt, DeclareVarStmt, Expression, ExpressionStatement, ExpressionType, ExpressionVisitor, ExternalExpr, ExternalReference, literalMap, FunctionExpr, IfStmt, InstantiateExpr, InvokeFunctionExpr, LiteralArrayExpr, LiteralExpr, LiteralMapExpr, MapType, NotExpr, NONE_TYPE, ReadKeyExpr, ReadPropExpr, ReadVarExpr, ReturnStatement, StatementVisitor, TaggedTemplateExpr, TemplateLiteral, TemplateLiteralElement, Type, TypeModifier, TypeVisitor, WrappedNodeExpr, WriteKeyExpr, WritePropExpr, WriteVarExpr, StmtModifier, Statement, STRING_TYPE, TypeofExpr, jsDocComment, leadingComment, LeadingComment, JSDocComment, UnaryOperator, UnaryOperatorExpr, LocalizedString} from './output/output_ast.js';
export {EmitterVisitorContext} from './output/abstract_emitter.js';
export {JitEvaluator} from './output/output_jit.js';
export * from './parse_util.js';
export * from './schema/dom_element_schema_registry.js';
export * from './selector.js';
export {Version} from './util.js';
export {SourceMap} from './output/source_map.js';
export * from './injectable_compiler_2.js';
export * from './render3/partial/api.js';
export * from './render3/view/api.js';
export {BoundAttribute as TmplAstBoundAttribute, BoundEvent as TmplAstBoundEvent, BoundText as TmplAstBoundText, Content as TmplAstContent, Element as TmplAstElement, Icu as TmplAstIcu, Node as TmplAstNode, RecursiveVisitor as TmplAstRecursiveVisitor, Reference as TmplAstReference, Template as TmplAstTemplate, Text as TmplAstText, TextAttribute as TmplAstTextAttribute, Variable as TmplAstVariable} from './render3/r3_ast.js';
export * from './render3/view/t2_api.js';
export * from './render3/view/t2_binder.js';
export {Identifiers as R3Identifiers} from './render3/r3_identifiers.js';
export {R3ClassMetadata, CompileClassMetadataFn, compileClassMetadata} from './render3/r3_class_metadata_compiler.js';
export {compileFactoryFunction, R3DependencyMetadata, R3FactoryMetadata, FactoryTarget} from './render3/r3_factory.js';
export {compileNgModule, R3NgModuleMetadata, R3SelectorScopeMode} from './render3/r3_module_compiler.js';
export {compileInjector, R3InjectorMetadata} from './render3/r3_injector_compiler.js';
export {compilePipeFromMetadata, R3PipeMetadata} from './render3/r3_pipe_compiler.js';
export {makeBindingParser, ParsedTemplate, parseTemplate, ParseTemplateOptions} from './render3/view/template.js';
export {ForwardRefHandling, MaybeForwardRefExpression, R3CompiledExpression, R3Reference, createMayBeForwardRefExpression, devOnlyGuardedExpression, getSafePropertyAccessString} from './render3/util.js';
export {compileComponentFromMetadata, compileDirectiveFromMetadata, parseHostBindings, ParsedHostBindings, verifyHostBindings} from './render3/view/compiler.js';
export {compileDeclareClassMetadata} from './render3/partial/class_metadata.js';
export {compileDeclareComponentFromMetadata, DeclareComponentTemplateInfo} from './render3/partial/component.js';
export {compileDeclareDirectiveFromMetadata} from './render3/partial/directive.js';
export {compileDeclareFactoryFunction} from './render3/partial/factory.js';
export {compileDeclareInjectableFromMetadata} from './render3/partial/injectable.js';
export {compileDeclareInjectorFromMetadata} from './render3/partial/injector.js';
export {compileDeclareNgModuleFromMetadata} from './render3/partial/ng_module.js';
export {compileDeclarePipeFromMetadata} from './render3/partial/pipe.js';
export {publishFacade} from './jit_compiler_facade.js';
export {emitDistinctChangesOnlyDefaultValue, ChangeDetectionStrategy, ViewEncapsulation} from './core.js';
import * as outputAst from './output/output_ast.js';
export {outputAst};
// This file only reexports content of the `src` folder. Keep it that way.

// This function call has a global side effects and publishes the compiler into global namespace for
// the late binding of the Compiler to the @angular/core for jit compilation.
publishFacade(global);
