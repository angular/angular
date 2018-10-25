/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompilePipeMetadata, identifierName} from '../compile_metadata';
import {CompileReflector} from '../compile_reflector';
import {DefinitionKind} from '../constant_pool';
import * as o from '../output/output_ast';
import {OutputContext, error} from '../util';

import {R3DependencyMetadata, compileFactoryFunction, dependenciesFromGlobalMetadata} from './r3_factory';
import {Identifiers as R3} from './r3_identifiers';

export interface R3PipeMetadata {
  name: string;
  type: o.Expression;
  pipeName: string;
  deps: R3DependencyMetadata[]|null;
  pure: boolean;
}

export interface R3PipeDef {
  expression: o.Expression;
  type: o.Type;
  statements: o.Statement[];
}

export function compilePipeFromMetadata(metadata: R3PipeMetadata) {
  const definitionMapValues: {key: string, quoted: boolean, value: o.Expression}[] = [];

  // e.g. `name: 'myPipe'`
  definitionMapValues.push({key: 'name', value: o.literal(metadata.pipeName), quoted: false});

  // e.g. `type: MyPipe`
  definitionMapValues.push({key: 'type', value: metadata.type, quoted: false});

  const templateFactory = compileFactoryFunction({
    name: metadata.name,
    type: metadata.type,
    deps: metadata.deps,
    injectFn: R3.directiveInject,
    extraStatementFn: null,
  });
  definitionMapValues.push({key: 'factory', value: templateFactory.factory, quoted: false});

  // e.g. `pure: true`
  definitionMapValues.push({key: 'pure', value: o.literal(metadata.pure), quoted: false});

  const expression = o.importExpr(R3.definePipe).callFn([o.literalMap(definitionMapValues)]);
  const type = new o.ExpressionType(o.importExpr(R3.PipeDefWithMeta, [
    new o.ExpressionType(metadata.type),
    new o.ExpressionType(new o.LiteralExpr(metadata.pipeName)),
  ]));
  return {expression, type, statements: templateFactory.statements};
}

/**
 * Write a pipe definition to the output context.
 */
export function compilePipeFromRender2(
    outputCtx: OutputContext, pipe: CompilePipeMetadata, reflector: CompileReflector) {
  const definitionMapValues: {key: string, quoted: boolean, value: o.Expression}[] = [];

  const name = identifierName(pipe.type);
  if (!name) {
    return error(`Cannot resolve the name of ${pipe.type}`);
  }

  const metadata: R3PipeMetadata = {
    name,
    pipeName: pipe.name,
    type: outputCtx.importExpr(pipe.type.reference),
    deps: dependenciesFromGlobalMetadata(pipe.type, outputCtx, reflector),
    pure: pipe.pure,
  };

  const res = compilePipeFromMetadata(metadata);

  const definitionField = outputCtx.constantPool.propertyNameOf(DefinitionKind.Pipe);

  outputCtx.statements.push(new o.ClassStmt(
      /* name */ name,
      /* parent */ null,
      /* fields */[new o.ClassField(
          /* name */ definitionField,
          /* type */ o.INFERRED_TYPE,
          /* modifiers */[o.StmtModifier.Static],
          /* initializer */ res.expression)],
      /* getters */[],
      /* constructorMethod */ new o.ClassMethod(null, [], []),
      /* methods */[]));
}
