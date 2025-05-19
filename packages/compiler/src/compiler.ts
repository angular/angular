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
import * as outputAst from './output/output_ast';
import {global} from './util';

export {SECURITY_SCHEMA} from './schema/dom_security_schema';
export {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, SchemaMetadata} from './core';
export {core};

export {CompilerConfig, preserveWhitespacesDefault} from './config';
export {ConstantPool} from './constant_pool';
export {
  ChangeDetectionStrategy,
  emitDistinctChangesOnlyDefaultValue,
  ViewEncapsulation,
} from './core';
export * from './expression_parser/ast';
export * from './expression_parser/lexer';
export * from './expression_parser/parser';
export * from './i18n/index';
export * from './injectable_compiler_2';
export {publishFacade} from './jit_compiler_facade';
export * from './ml_parser/ast';
export {DEFAULT_INTERPOLATION_CONFIG, InterpolationConfig} from './ml_parser/defaults';
export * from './ml_parser/html_parser';
export * from './ml_parser/html_tags';
export {LexerRange} from './ml_parser/lexer';
export {ParseTreeResult, TreeError} from './ml_parser/parser';
export * from './ml_parser/tags';
export {TokenType as LexerTokenType} from './ml_parser/tokens';
export * from './ml_parser/xml_parser';
export {EmitterVisitorContext} from './output/abstract_emitter';
export {
  ArrayType,
  ArrowFunctionExpr,
  BinaryOperator,
  BinaryOperatorExpr,
  BuiltinType,
  BuiltinTypeName,
  CommaExpr,
  ConditionalExpr,
  DeclareFunctionStmt,
  DeclareVarStmt,
  DYNAMIC_TYPE,
  DynamicImportExpr,
  Expression,
  ExpressionStatement,
  ExpressionType,
  ExpressionVisitor,
  ExternalExpr,
  ExternalReference,
  FunctionExpr,
  IfStmt,
  InstantiateExpr,
  InvokeFunctionExpr,
  jsDocComment,
  JSDocComment,
  leadingComment,
  LeadingComment,
  literal,
  LiteralArrayExpr,
  LiteralExpr,
  literalMap,
  LiteralMapExpr,
  LocalizedString,
  MapType,
  NONE_TYPE,
  NotExpr,
  ParenthesizedExpr,
  ReadKeyExpr,
  ReadPropExpr,
  ReadVarExpr,
  ReturnStatement,
  Statement,
  StatementVisitor,
  StmtModifier,
  STRING_TYPE,
  TaggedTemplateLiteralExpr,
  TemplateLiteralElementExpr,
  TemplateLiteralExpr,
  TransplantedType,
  Type,
  TypeModifier,
  TypeofExpr,
  TypeVisitor,
  UnaryOperator,
  UnaryOperatorExpr,
  VoidExpr,
  WrappedNodeExpr,
  WriteKeyExpr,
  WritePropExpr,
  WriteVarExpr,
} from './output/output_ast';
export {JitEvaluator} from './output/output_jit';
export {SourceMap} from './output/source_map';
export * from './parse_util';
export * from './render3/partial/api';
export {
  compileComponentDeclareClassMetadata,
  compileDeclareClassMetadata,
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
export {
  BlockNode as TmplAstBlockNode,
  BoundAttribute as TmplAstBoundAttribute,
  BoundDeferredTrigger as TmplAstBoundDeferredTrigger,
  BoundEvent as TmplAstBoundEvent,
  BoundText as TmplAstBoundText,
  Content as TmplAstContent,
  DeferredBlock as TmplAstDeferredBlock,
  DeferredBlockError as TmplAstDeferredBlockError,
  DeferredBlockLoading as TmplAstDeferredBlockLoading,
  DeferredBlockPlaceholder as TmplAstDeferredBlockPlaceholder,
  DeferredBlockTriggers as TmplAstDeferredBlockTriggers,
  DeferredTrigger as TmplAstDeferredTrigger,
  Element as TmplAstElement,
  ForLoopBlock as TmplAstForLoopBlock,
  ForLoopBlockEmpty as TmplAstForLoopBlockEmpty,
  HoverDeferredTrigger as TmplAstHoverDeferredTrigger,
  Icu as TmplAstIcu,
  IdleDeferredTrigger as TmplAstIdleDeferredTrigger,
  IfBlock as TmplAstIfBlock,
  IfBlockBranch as TmplAstIfBlockBranch,
  ImmediateDeferredTrigger as TmplAstImmediateDeferredTrigger,
  InteractionDeferredTrigger as TmplAstInteractionDeferredTrigger,
  LetDeclaration as TmplAstLetDeclaration,
  NeverDeferredTrigger as TmplAstNeverDeferredTrigger,
  Node as TmplAstNode,
  RecursiveVisitor as TmplAstRecursiveVisitor,
  Reference as TmplAstReference,
  SwitchBlock as TmplAstSwitchBlock,
  SwitchBlockCase as TmplAstSwitchBlockCase,
  Template as TmplAstTemplate,
  Text as TmplAstText,
  TextAttribute as TmplAstTextAttribute,
  TimerDeferredTrigger as TmplAstTimerDeferredTrigger,
  UnknownBlock as TmplAstUnknownBlock,
  Variable as TmplAstVariable,
  ViewportDeferredTrigger as TmplAstViewportDeferredTrigger,
  HostElement as TmplAstHostElement,
  Component as TmplAstComponent,
  Directive as TmplAstDirective,
  visitAll as tmplAstVisitAll,
  Visitor as TmplAstVisitor,
} from './render3/r3_ast';
export {compileClassDebugInfo, R3ClassDebugInfo} from './render3/r3_class_debug_info_compiler';
export {
  compileClassMetadata,
  CompileClassMetadataFn,
  compileComponentClassMetadata,
  compileOpaqueAsyncClassMetadata,
  R3ClassMetadata,
} from './render3/r3_class_metadata_compiler';
export {
  compileFactoryFunction,
  FactoryTarget,
  R3DependencyMetadata,
  R3FactoryMetadata,
} from './render3/r3_factory';
export {
  compileHmrInitializer,
  compileHmrUpdateCallback,
  R3HmrMetadata,
  R3HmrNamespaceDependency,
} from './render3/r3_hmr_compiler';
export {Identifiers as R3Identifiers} from './render3/r3_identifiers';
export {compileInjector, R3InjectorMetadata} from './render3/r3_injector_compiler';
export {
  compileNgModule,
  R3NgModuleMetadata,
  R3NgModuleMetadataGlobal,
  R3NgModuleMetadataKind,
  R3SelectorScopeMode,
} from './render3/r3_module_compiler';
export {compilePipeFromMetadata, R3PipeMetadata} from './render3/r3_pipe_compiler';
export {
  createMayBeForwardRefExpression,
  devOnlyGuardedExpression,
  ForwardRefHandling,
  getSafePropertyAccessString,
  MaybeForwardRefExpression,
  R3CompiledExpression,
  R3Reference,
} from './render3/util';
export * from './render3/view/api';
export {
  compileComponentFromMetadata,
  compileDeferResolverFunction,
  compileDirectiveFromMetadata,
  encapsulateStyle,
  ParsedHostBindings,
  parseHostBindings,
  verifyHostBindings,
} from './render3/view/compiler';
export * from './render3/view/t2_api';
export * from './render3/view/t2_binder';
export {
  makeBindingParser,
  ParsedTemplate,
  parseTemplate,
  ParseTemplateOptions,
} from './render3/view/template';
export {CombinedRecursiveAstVisitor} from './combined_visitor';

// Note: BindingParser is intentionally exported as a type only, because it should
// be constructed through `makeBindingParser`, rather than its constructor.
export {type BindingParser} from './template_parser/binding_parser';
export {createCssSelectorFromNode} from './render3/view/util';
export * from './resource_loader';
export * from './schema/dom_element_schema_registry';
export * from './schema/element_schema_registry';
export * from './directive_matching';
export {Version, escapeRegExp} from './util';
export * from './version';
export {outputAst};
export {CompilerFacadeImpl} from './jit_compiler_facade';

// This file only reexports content of the `src` folder. Keep it that way.

// This function call has a global side effects and publishes the compiler into global namespace for
// the late binding of the Compiler to the @angular/core for jit compilation.
publishFacade(global);
