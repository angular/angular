/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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

export {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, SchemaMetadata} from './core';
export {core};

export * from './version';
export {CompilerConfig, preserveWhitespacesDefault} from './config';
export * from './resource_loader';
export {ConstantPool} from './constant_pool';
export {DEFAULT_INTERPOLATION_CONFIG, InterpolationConfig} from './ml_parser/defaults';
export * from './schema/element_schema_registry';
export * from './i18n/index';
export * from './expression_parser/ast';
export * from './expression_parser/lexer';
export * from './expression_parser/parser';
export * from './ml_parser/ast';
export * from './ml_parser/html_parser';
export * from './ml_parser/html_tags';
export * from './ml_parser/tags';
export {ParseTreeResult, TreeError} from './ml_parser/parser';
export {LexerRange} from './ml_parser/lexer';
export * from './ml_parser/xml_parser';
export {TokenType as LexerTokenType} from './ml_parser/tokens';
export {
  ArrayType,
  DYNAMIC_TYPE,
  BinaryOperator,
  BinaryOperatorExpr,
  BuiltinType,
  BuiltinTypeName,
  CommaExpr,
  ConditionalExpr,
  DeclareFunctionStmt,
  DeclareVarStmt,
  Expression,
  ExpressionStatement,
  ExpressionType,
  ExpressionVisitor,
  ExternalExpr,
  ExternalReference,
  literalMap,
  FunctionExpr,
  IfStmt,
  InstantiateExpr,
  InvokeFunctionExpr,
  ArrowFunctionExpr,
  LiteralArrayExpr,
  LiteralExpr,
  LiteralMapExpr,
  MapType,
  NotExpr,
  NONE_TYPE,
  ReadKeyExpr,
  ReadPropExpr,
  ReadVarExpr,
  ReturnStatement,
  StatementVisitor,
  TaggedTemplateLiteralExpr,
  TemplateLiteralExpr,
  TemplateLiteralElementExpr,
  Type,
  TypeModifier,
  TypeVisitor,
  WrappedNodeExpr,
  literal,
  WriteKeyExpr,
  WritePropExpr,
  WriteVarExpr,
  StmtModifier,
  Statement,
  STRING_TYPE,
  TypeofExpr,
  jsDocComment,
  leadingComment,
  LeadingComment,
  JSDocComment,
  UnaryOperator,
  UnaryOperatorExpr,
  LocalizedString,
  TransplantedType,
  DynamicImportExpr,
} from './output/output_ast';
export {EmitterVisitorContext} from './output/abstract_emitter';
export {JitEvaluator} from './output/output_jit';
export * from './parse_util';
export * from './schema/dom_element_schema_registry';
export * from './selector';
export {Version} from './util';
export {SourceMap} from './output/source_map';
export * from './injectable_compiler_2';
export * from './render3/partial/api';
export * from './render3/view/api';
export {
  visitAll as tmplAstVisitAll,
  BlockNode as TmplAstBlockNode,
  BoundAttribute as TmplAstBoundAttribute,
  BoundEvent as TmplAstBoundEvent,
  BoundText as TmplAstBoundText,
  Content as TmplAstContent,
  Element as TmplAstElement,
  Icu as TmplAstIcu,
  Node as TmplAstNode,
  Visitor as TmplAstVisitor,
  RecursiveVisitor as TmplAstRecursiveVisitor,
  Reference as TmplAstReference,
  Template as TmplAstTemplate,
  Text as TmplAstText,
  TextAttribute as TmplAstTextAttribute,
  Variable as TmplAstVariable,
  DeferredBlock as TmplAstDeferredBlock,
  DeferredBlockPlaceholder as TmplAstDeferredBlockPlaceholder,
  DeferredBlockLoading as TmplAstDeferredBlockLoading,
  DeferredBlockError as TmplAstDeferredBlockError,
  DeferredTrigger as TmplAstDeferredTrigger,
  BoundDeferredTrigger as TmplAstBoundDeferredTrigger,
  IdleDeferredTrigger as TmplAstIdleDeferredTrigger,
  ImmediateDeferredTrigger as TmplAstImmediateDeferredTrigger,
  HoverDeferredTrigger as TmplAstHoverDeferredTrigger,
  TimerDeferredTrigger as TmplAstTimerDeferredTrigger,
  InteractionDeferredTrigger as TmplAstInteractionDeferredTrigger,
  ViewportDeferredTrigger as TmplAstViewportDeferredTrigger,
  NeverDeferredTrigger as TmplAstNeverDeferredTrigger,
  SwitchBlock as TmplAstSwitchBlock,
  SwitchBlockCase as TmplAstSwitchBlockCase,
  ForLoopBlock as TmplAstForLoopBlock,
  ForLoopBlockEmpty as TmplAstForLoopBlockEmpty,
  IfBlock as TmplAstIfBlock,
  IfBlockBranch as TmplAstIfBlockBranch,
  DeferredBlockTriggers as TmplAstDeferredBlockTriggers,
  UnknownBlock as TmplAstUnknownBlock,
  LetDeclaration as TmplAstLetDeclaration,
} from './render3/r3_ast';
export * from './render3/view/t2_api';
export * from './render3/view/t2_binder';
export {createCssSelectorFromNode} from './render3/view/util';
export {Identifiers as R3Identifiers} from './render3/r3_identifiers';
export {
  R3ClassMetadata,
  CompileClassMetadataFn,
  compileClassMetadata,
  compileComponentClassMetadata,
  compileOpaqueAsyncClassMetadata,
} from './render3/r3_class_metadata_compiler';
export {compileClassDebugInfo, R3ClassDebugInfo} from './render3/r3_class_debug_info_compiler';
export {
  compileHmrInitializer,
  compileHmrUpdateCallback,
  R3HmrMetadata,
  R3HmrNamespaceDependency,
} from './render3/r3_hmr_compiler';
export {
  compileFactoryFunction,
  R3DependencyMetadata,
  R3FactoryMetadata,
  FactoryTarget,
} from './render3/r3_factory';
export {
  compileNgModule,
  R3NgModuleMetadata,
  R3SelectorScopeMode,
  R3NgModuleMetadataKind,
  R3NgModuleMetadataGlobal,
} from './render3/r3_module_compiler';
export {compileInjector, R3InjectorMetadata} from './render3/r3_injector_compiler';
export {compilePipeFromMetadata, R3PipeMetadata} from './render3/r3_pipe_compiler';
export {
  makeBindingParser,
  ParsedTemplate,
  parseTemplate,
  ParseTemplateOptions,
} from './render3/view/template';
export {
  ForwardRefHandling,
  MaybeForwardRefExpression,
  R3CompiledExpression,
  R3Reference,
  createMayBeForwardRefExpression,
  devOnlyGuardedExpression,
  getSafePropertyAccessString,
} from './render3/util';
export {
  compileComponentFromMetadata,
  compileDirectiveFromMetadata,
  parseHostBindings,
  ParsedHostBindings,
  verifyHostBindings,
  encapsulateStyle,
  compileDeferResolverFunction,
} from './render3/view/compiler';
export {
  compileDeclareClassMetadata,
  compileComponentDeclareClassMetadata,
} from './render3/partial/class_metadata';
export {
  compileDeclareComponentFromMetadata,
  DeclareComponentTemplateInfo,
} from './render3/partial/component';
export {compileDeclareDirectiveFromMetadata} from './render3/partial/directive';
export {compileDeclareFactoryFunction} from './render3/partial/factory';
export {compileDeclareInjectableFromMetadata} from './render3/partial/injectable';
export {compileDeclareInjectorFromMetadata} from './render3/partial/injector';
export {compileDeclareNgModuleFromMetadata} from './render3/partial/ng_module';
export {compileDeclarePipeFromMetadata} from './render3/partial/pipe';
export {publishFacade} from './jit_compiler_facade';
export {
  emitDistinctChangesOnlyDefaultValue,
  ChangeDetectionStrategy,
  ViewEncapsulation,
} from './core';
import * as outputAst from './output/output_ast';
export {outputAst};
// This file only reexports content of the `src` folder. Keep it that way.

// This function call has a global side effects and publishes the compiler into global namespace for
// the late binding of the Compiler to the @angular/core for jit compilation.
publishFacade(global);
