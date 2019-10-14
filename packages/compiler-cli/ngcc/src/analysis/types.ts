/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ConstantPool} from '@angular/compiler';
import * as ts from 'typescript';
import {Reexport} from '../../../src/ngtsc/imports';
import {ClassDeclaration, Decorator} from '../../../src/ngtsc/reflection';
import {CompileResult, DecoratorHandler} from '../../../src/ngtsc/transform';

export interface AnalyzedFile {
  sourceFile: ts.SourceFile;
  analyzedClasses: AnalyzedClass[];
}

export interface AnalyzedClass {
  name: string;
  decorators: Decorator[]|null;
  declaration: ClassDeclaration;
  diagnostics?: ts.Diagnostic[];
  matches: {handler: DecoratorHandler<any, any>; analysis: any;}[];
}

export interface CompiledClass extends AnalyzedClass {
  compilation: CompileResult[];

  /**
   * Any re-exports which should be added next to this class, both in .js and (if possible) .d.ts.
   */
  reexports: Reexport[];
}

export interface CompiledFile {
  compiledClasses: CompiledClass[];
  sourceFile: ts.SourceFile;
  constantPool: ConstantPool;
}

export type DecorationAnalyses = Map<ts.SourceFile, CompiledFile>;
export const DecorationAnalyses = Map;

export interface MatchingHandler<A, M> {
  handler: DecoratorHandler<A, M>;
  detected: M;
}
