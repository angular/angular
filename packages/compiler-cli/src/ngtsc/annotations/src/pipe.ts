/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Expression, ExpressionType, LiteralExpr, R3DependencyMetadata, R3InjectableMetadata, R3ResolvedDependencyType, WrappedNodeExpr, compileInjectable as compileIvyInjectable} from '@angular/compiler';
import * as ts from 'typescript';

import {Decorator, ReflectionHost} from '../../host';
import {AnalysisOutput, CompileResult, DecoratorHandler} from '../../transform';

import {isAngularCore} from './util';

export class PipeDecoratorHandler implements DecoratorHandler<string> {
  constructor(private reflector: ReflectionHost, private isCore: boolean) {}

  detect(decorator: Decorator[]): Decorator|undefined {
    return decorator.find(
        decorator => decorator.name === 'Pipe' && (this.isCore || isAngularCore(decorator)));
  }

  analyze(node: ts.ClassDeclaration, decorator: Decorator): AnalysisOutput<string> {
    return {
      analysis: 'test',
    };
  }

  compile(node: ts.ClassDeclaration, analysis: string): CompileResult {
    return {
      name: 'ngPipeDef',
      initializer: new LiteralExpr(null),
      statements: [],
      type: new ExpressionType(new LiteralExpr(null)),
    };
  }
}
