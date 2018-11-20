/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ConstantPool, Expression, Statement, Type} from '@angular/compiler';
import * as ts from 'typescript';

import {Decorator} from '../../host';
import {TypeCheckContext} from '../../typecheck';


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
   * Scan a set of reflected decorators and determine if this handler is responsible for compilation
   * of one of them.
   */
  detect(node: ts.Declaration, decorators: Decorator[]|null): M|undefined;


  /**
   * Asynchronously perform pre-analysis on the decorator/class combination.
   *
   * `preAnalyze` is optional and is not guaranteed to be called through all compilation flows. It
   * will only be called if asynchronicity is supported in the CompilerHost.
   */
  preanalyze?(node: ts.Declaration, metadata: M): Promise<void>|undefined;

  /**
   * Perform analysis on the decorator/class combination, producing instructions for compilation
   * if successful, or an array of diagnostic messages if the analysis fails or the decorator
   * isn't valid.
   */
  analyze(node: ts.Declaration, metadata: M): AnalysisOutput<A>;

  typeCheck?(ctx: TypeCheckContext, node: ts.Declaration, metadata: A): void;

  /**
   * Generate a description of the field which should be added to the class, including any
   * initialization code to be generated.
   */
  compile(node: ts.Declaration, analysis: A, constantPool: ConstantPool): CompileResult
      |CompileResult[];
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
