/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ConstantPool, Expression, Statement, Type} from '@angular/compiler';
import * as ts from 'typescript';

import {Reexport} from '../../imports';
import {IndexingContext} from '../../indexer';
import {ClassDeclaration, Decorator} from '../../reflection';
import {TypeCheckContext} from '../../typecheck';

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
 */
export interface DecoratorHandler<A, M> {
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
  detect(node: ClassDeclaration, decorators: Decorator[]|null): DetectResult<M>|undefined;


  /**
   * Asynchronously perform pre-analysis on the decorator/class combination.
   *
   * `preAnalyze` is optional and is not guaranteed to be called through all compilation flows. It
   * will only be called if asynchronicity is supported in the CompilerHost.
   */
  preanalyze?(node: ClassDeclaration, metadata: M): Promise<void>|undefined;

  /**
   * Perform analysis on the decorator/class combination, producing instructions for compilation
   * if successful, or an array of diagnostic messages if the analysis fails or the decorator
   * isn't valid.
   */
  analyze(node: ClassDeclaration, metadata: M): AnalysisOutput<A>;

  /**
   * Registers information about the decorator for the indexing phase in a
   * `IndexingContext`, which stores information about components discovered in the
   * program.
   */
  index?(context: IndexingContext, node: ClassDeclaration, metadata: A): void;

  /**
   * Perform resolution on the given decorator along with the result of analysis.
   *
   * The resolution phase happens after the entire `ts.Program` has been analyzed, and gives the
   * `DecoratorHandler` a chance to leverage information from the whole compilation unit to enhance
   * the `analysis` before the emit phase.
   */
  resolve?(node: ClassDeclaration, analysis: A): ResolveResult;

  typeCheck?(ctx: TypeCheckContext, node: ClassDeclaration, metadata: A): void;

  /**
   * Generate a description of the field which should be added to the class, including any
   * initialization code to be generated.
   */
  compile(node: ClassDeclaration, analysis: A, constantPool: ConstantPool): CompileResult
      |CompileResult[];
}

export interface DetectResult<M> {
  trigger: ts.Node|null;
  metadata: M;
}

/**
 * The output of an analysis operation, consisting of possibly an arbitrary analysis object (used as
 * the input to code generation) and potentially diagnostics if there were errors uncovered during
 * analysis.
 */
export interface AnalysisOutput<A> {
  analysis?: A;
  diagnostics?: ts.Diagnostic[];
  factorySymbolName?: string;
  typeCheck?: boolean;
}

/**
 * A description of the static field to add to a class, including an initialization expression
 * and a type for the .d.ts file.
 */
export interface CompileResult {
  name: string;
  initializer: Expression;
  statements: Statement[];
  type: Type;
}

export interface ResolveResult {
  reexports?: Reexport[];
  diagnostics?: ts.Diagnostic[];
}
