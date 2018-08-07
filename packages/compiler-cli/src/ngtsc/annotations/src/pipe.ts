/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LiteralExpr, R3PipeMetadata, WrappedNodeExpr, compilePipeFromMetadata} from '@angular/compiler';
import * as ts from 'typescript';

import {Decorator, ReflectionHost} from '../../host';
import {reflectObjectLiteral, staticallyResolve} from '../../metadata';
import {AnalysisOutput, CompileResult, DecoratorHandler} from '../../transform';

import {SelectorScopeRegistry} from './selector_scope';
import {getConstructorDependencies, isAngularCore, unwrapExpression} from './util';

export class PipeDecoratorHandler implements DecoratorHandler<R3PipeMetadata, Decorator> {
  constructor(
      private checker: ts.TypeChecker, private reflector: ReflectionHost,
      private scopeRegistry: SelectorScopeRegistry, private isCore: boolean) {}

  detect(node: ts.Declaration, decorators: Decorator[]|null): Decorator|undefined {
    if (!decorators) {
      return undefined;
    }
    return decorators.find(
        decorator => decorator.name === 'Pipe' && (this.isCore || isAngularCore(decorator)));
  }

  analyze(clazz: ts.ClassDeclaration, decorator: Decorator): AnalysisOutput<R3PipeMetadata> {
    if (clazz.name === undefined) {
      throw new Error(`@Pipes must have names`);
    }
    const name = clazz.name.text;
    const type = new WrappedNodeExpr(clazz.name);
    if (decorator.args === null) {
      throw new Error(`@Pipe must be called`);
    }
    const meta = unwrapExpression(decorator.args[0]);
    if (!ts.isObjectLiteralExpression(meta)) {
      throw new Error(`Decorator argument must be literal.`);
    }
    const pipe = reflectObjectLiteral(meta);

    if (!pipe.has('name')) {
      throw new Error(`@Pipe decorator is missing name field`);
    }
    const pipeName = staticallyResolve(pipe.get('name') !, this.reflector, this.checker);
    if (typeof pipeName !== 'string') {
      throw new Error(`@Pipe.name must be a string`);
    }
    this.scopeRegistry.registerPipe(clazz, pipeName);

    let pure = true;
    if (pipe.has('pure')) {
      const pureValue = staticallyResolve(pipe.get('pure') !, this.reflector, this.checker);
      if (typeof pureValue !== 'boolean') {
        throw new Error(`@Pipe.pure must be a boolean`);
      }
      pure = pureValue;
    }

    return {
      analysis: {
        name,
        type,
        pipeName,
        deps: getConstructorDependencies(clazz, this.reflector, this.isCore), pure,
      }
    };
  }

  compile(node: ts.ClassDeclaration, analysis: R3PipeMetadata): CompileResult {
    const res = compilePipeFromMetadata(analysis);
    return {
      name: 'ngPipeDef',
      initializer: res.expression,
      statements: [],
      type: res.type,
    };
  }
}
