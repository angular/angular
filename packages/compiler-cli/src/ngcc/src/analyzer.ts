/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
import {CompileResult, DecoratorHandler} from '../../ngtsc/transform';
import {DecoratedClass} from './parser/parser';

export interface AnalyzedClass {
  clazz: DecoratedClass;
  handler: DecoratorHandler<any>;
  analysis: any;
  diagnostics?: ts.Diagnostic[];
  compilation: CompileResult;
}

export class Analyzer {
  constructor(private handlers: DecoratorHandler<any>[]) {}

  analyze(clazz: DecoratedClass): AnalyzedClass|undefined {
    const detected = this.handlers
      .map(handler => ({ handler, decorator: handler.detect(clazz.decorators) }))
      .filter(detected => detected.decorator);

    if (detected.length > 0) {
      if (detected.length > 1) {
        throw new Error('TODO.Diagnostic: Class has multiple Angular decorators.');
      }
      const handler = detected[0].handler;
      const {analysis, diagnostics} = handler.analyze(clazz.declaration, detected[0].decorator!);
      const compilation = handler.compile(clazz.declaration, analysis);
      return { clazz, handler, analysis, diagnostics, compilation };
    }
  }
}
