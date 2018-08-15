/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ConstantPool} from '@angular/compiler';
import * as ts from 'typescript';
import {Reexport} from '../../../src/ngtsc/imports';
import {ClassDeclaration, Decorator} from '../../../src/ngtsc/reflection';
import {CompileResult} from '../../../src/ngtsc/transform';

export interface CompiledClass {
  name: string;
  decorators: Decorator[]|null;
  declaration: ClassDeclaration;
  compilation: CompileResult[];
}

export interface CompiledFile {
  compiledClasses: CompiledClass[];
  sourceFile: ts.SourceFile;
  constantPool: ConstantPool;

  /**
   * Any re-exports which should be added next to this class, both in .js and (if possible) .d.ts.
   */
  reexports: Reexport[];
}

export type DecorationAnalyses = Map<ts.SourceFile, CompiledFile>;
export const DecorationAnalyses = Map;
