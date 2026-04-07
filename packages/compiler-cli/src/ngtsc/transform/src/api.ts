/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ConstantPool, Expression, Statement, Type} from '@angular/compiler';
import ts from 'typescript';

import {Reexport, ReferenceEmitter} from '../../imports';
import {SemanticSymbol} from '../../incremental/semantic_graph';
import {IndexingContext} from '../../indexer';
import {ClassDeclaration, Decorator, ReflectionHost} from '../../reflection';
import {ImportManager} from '../../translator';
import {TypeCheckContext} from '../../typecheck/api';
import {ExtendedTemplateChecker} from '../../typecheck/extended/api';
import {TemplateSemanticsChecker} from '../../typecheck/template_semantics/api/api';
import {Xi18nContext} from '../../xi18n';

/**
 * Specifies the compilation mode that is used for the compilation.
 */
export enum CompilationMode {
  /**
   * Generates fully AOT compiled code using Ivy instructions.
   */
  FULL,

  /**
   * Generates code using a stable, but intermediate format suitable to be published to NPM.
   */
  PARTIAL,

  /**
   * Generates code based on each individual source file without using its
   * dependencies (suitable for local dev edit/refresh workflow).
   */
  LOCAL,
}

export enum HandlerPrecedence {
  /**
   * Handler with PRIMARY precedence cannot overlap - there can only be one on a given class.
   *
   * If more than one PRIMARY handler matches a class, an error is produced.
   */
  PRIMARY,

  /**
   * Handlers with SHARED precedence can match any class, possibly in addition to a single PRIMARY
   * handler.
   *
   * It is not an error for a class to have any number of SHARED handlers.
   */
  SHARED,

  /**
   * Handlers with WEAK precedence that match a class are ignored if any handlers with stronger
   * precedence match a class.
   */
  WEAK,
}

/**
 * Provides the interface between a decorator compiler from @angular/compiler and the Typescript
 * compiler/transform.
 *
 * The decorator compilers in @angular/compiler do not depend on Typescript. The handler is
 * responsible for extracting the information required to perform compilation from the decorators
 * and Typescript source, invoking the decorator compiler, and returning the result.
 *
 * @param `D` The type of decorator metadata produced by `detect`.
 * @param `A` The type of analysis metadata produced by `analyze`.
 * @param `R` The type of resolution metadata produced by `resolve`.
 */
export interface DecoratorHandler<D, A, S extends SemanticSymbol | null, R> {
  readonly name: string;

  /**
   * The precedence of a handler controls how it interacts with other handlers that match the same
   * class.
   *
   * See the descriptions on `HandlerPrecedence` for an explanation of the behaviors involved.
   */
  readonly precedence: HandlerPrecedence;

  /**
   * Scan a set of reflected decorators and determine if this handler is responsible for compilation
   * of one of them.
   */
  detect(node: ClassDeclaration, decorators: Decorator[] | null): DetectResult<D> | undefined;

  /**
   * Asynchronously perform pre-analysis on the decorator/class combination.
   *
   * `preanalyze` is optional and is not guaranteed to be called through all compilation flows. It
   * will only be called if asynchronicity is supported in the CompilerHost.
   */
  preanalyze?(node: ClassDeclaration, metadata: Readonly<D>): Promise<void> | undefined;

  /**
   * Perform analysis on the decorator/class combination, extracting information from the class
   * required for compilation.
   *
   * Returns analyzed metadata if successful, or an array of diagnostic messages if the analysis
   * fails or the decorator isn't valid.
   *
   * Analysis should always be a "pure" operation, with no side effects. This is because the
   * detect/analysis steps might be skipped for files which have not changed during incremental
   * builds. Any side effects required for compilation (e.g. registration of metadata) should happen
   * in the `register` phase, which is guaranteed to run even for incremental builds.
   */
  analyze(node: ClassDeclaration, metadata: Readonly<D>): AnalysisOutput<A>;

  /**
   * React to a change in a resource file by updating the `analysis` or `resolution`, under the
   * assumption that nothing in the TypeScript code has changed.
   */
  updateResources?(node: ClassDeclaration, analysis: A, resolution: R): void;

  /**
   * Produces a `SemanticSymbol` that represents the class, which is registered into the semantic
   * dependency graph. The symbol is used in incremental compilations to let the compiler determine
   * how a change to the class affects prior emit results. See the `incremental` target's README for
   * details on how this works.
   *
   * The symbol is passed in to `resolve`, where it can be extended with references into other parts
   * of the compilation as needed.
   *
   * Only primary handlers are allowed to have symbols; handlers with `precedence` other than
   * `HandlerPrecedence.PRIMARY` must return a `null` symbol.
   */
  symbol(node: ClassDeclaration, analysis: Readonly<A>): S;

  /**
   * Post-process the analysis of a decorator/class combination and record any necessary information
   * in the larger compilation.
   *
   * Registration always occurs for a given decorator/class, regardless of whether analysis was
   * performed directly or whether the analysis results were reused from the previous program.
   */
  register?(node: ClassDeclaration, analysis: A): void;

  /**
   * Registers information about the decorator for the indexing phase in a
   * `IndexingContext`, which stores information about components discovered in the
   * program.
   */
  index?(
    context: IndexingContext,
    node: ClassDeclaration,
    analysis: Readonly<A>,
    resolution: Readonly<R>,
  ): void;

  /**
   * Perform resolution on the given decorator along with the result of analysis.
   *
   * The resolution phase happens after the entire `ts.Program` has been analyzed, and gives the
   * `DecoratorHandler` a chance to leverage information from the whole compilation unit to enhance
   * the `analysis` before the emit phase.
   */
  resolve?(node: ClassDeclaration, analysis: Readonly<A>, symbol: S): ResolveResult<R>;

  /**
   * Extract i18n messages into the `Xi18nContext`, which is useful for generating various formats
   * of message file outputs.
   */
  xi18n?(bundle: Xi18nContext, node: ClassDeclaration, analysis: Readonly<A>): void;

  typeCheck?(
    ctx: TypeCheckContext,
    node: ClassDeclaration,
    analysis: Readonly<A>,
    resolution: Readonly<R>,
  ): void;

  extendedTemplateCheck?(
    component: ts.ClassDeclaration,
    extendedTemplateChecker: ExtendedTemplateChecker,
  ): ts.Diagnostic[];

  templateSemanticsCheck?(
    component: ts.ClassDeclaration,
    templateSemanticsChecker: TemplateSemanticsChecker,
  ): ts.Diagnostic[];

  /**
   * Generate a description of the field which should be added to the class, including any
   * initialization code to be generated.
   *
   * If the compilation mode is configured as other than full but an implementation of the
   * corresponding method is not provided, then this method is called as a fallback.
   */
  compileFull(
    node: ClassDeclaration,
    analysis: Readonly<A>,
    resolution: Readonly<R>,
    constantPool: ConstantPool,
  ): CompileResult | CompileResult[];

  /**
   * Generates code for the decorator using a stable, but intermediate format suitable to be
   * published to NPM. This code is meant to be processed by the linker to achieve the final AOT
   * compiled code.
   *
   * If present, this method is used if the compilation mode is configured as partial, otherwise
   * `compileFull` is.
   */
  compilePartial?(
    node: ClassDeclaration,
    analysis: Readonly<A>,
    resolution: Readonly<R>,
  ): CompileResult | CompileResult[];

  /**
   * Generates the function that will update a class' metadata at runtime during HMR.
   */
  compileHmrUpdateDeclaration?(
    node: ClassDeclaration,
    analysis: Readonly<A>,
    resolution: Readonly<R>,
  ): ts.FunctionDeclaration | null;

  /**
   * Generates code based on each individual source file without using its
   * dependencies (suitable for local dev edit/refresh workflow)
   */
  compileLocal(
    node: ClassDeclaration,
    analysis: Readonly<A>,
    resolution: Readonly<Partial<R>>,
    constantPool: ConstantPool,
  ): CompileResult | CompileResult[];
}

/**
 * The output of detecting a trait for a declaration as the result of the first phase of the
 * compilation pipeline.
 */
export interface DetectResult<M> {
  /**
   * The node that triggered the match, which is typically a decorator.
   */
  trigger: ts.Node | null;

  /**
   * Refers to the decorator that was recognized for this detection, if any. This can be a concrete
   * decorator that is actually present in a file, or a synthetic decorator as inserted
   * programmatically.
   */
  decorator: Decorator | null;

  /**
   * An arbitrary object to carry over from the detection phase into the analysis phase.
   */
  metadata: Readonly<M>;
}

/**
 * The output of an analysis operation, consisting of possibly an arbitrary analysis object (used as
 * the input to code generation) and potentially diagnostics if there were errors uncovered during
 * analysis.
 */
export interface AnalysisOutput<A> {
  analysis?: Readonly<A>;
  diagnostics?: ts.Diagnostic[];
}

/**
 * A description of the static field to add to a class, including an initialization expression
 * and a type for the .d.ts file.
 */
export interface CompileResult {
  name: string;
  initializer: Expression | null;
  statements: Statement[];
  type: Type;
  deferrableImports: Set<ts.ImportDeclaration> | null;
}

export interface ResolveResult<R> {
  reexports?: Reexport[];
  diagnostics?: ts.Diagnostic[];
  data?: Readonly<R>;
}

export interface DtsTransform {
  transformClass?(
    clazz: ts.ClassDeclaration,
    elements: ReadonlyArray<ts.ClassElement>,
    reflector: ReflectionHost,
    refEmitter: ReferenceEmitter,
    imports: ImportManager,
  ): ts.ClassDeclaration;
}
