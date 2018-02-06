/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompileDirectiveMetadata, CompilePipeMetadata, identifierName} from '../compile_metadata';
import {CompileReflector} from '../compile_reflector';
import {DefinitionKind} from '../constant_pool';
import * as o from '../output/output_ast';
import {OutputContext, error} from '../util';

import {Identifiers as R3} from './r3_identifiers';
import {createFactory} from './r3_view_compiler';

export function compilePipe(
    outputCtx: OutputContext, pipe: CompilePipeMetadata, reflector: CompileReflector) {
  const definitionMapValues: {key: string, quoted: boolean, value: o.Expression}[] = [];

  // e.g. 'type: MyPipe`
  definitionMapValues.push(
      {key: 'type', value: outputCtx.importExpr(pipe.type.reference), quoted: false});

  // e.g. factory: function MyPipe_Factory() { return new MyPipe(); },
  const templateFactory = createFactory(pipe.type, outputCtx, reflector);
  definitionMapValues.push({key: 'factory', value: templateFactory, quoted: false});

  // e.g. pure: true
  if (pipe.pure) {
    definitionMapValues.push({key: 'pure', value: o.literal(true), quoted: false});
  }

  const className = identifierName(pipe.type) !;
  className || error(`Cannot resolve the name of ${pipe.type}`);

  outputCtx.statements.push(new o.ClassStmt(
      /* name */ className,
      /* parent */ null,
      /* fields */[new o.ClassField(
          /* name */ outputCtx.constantPool.propertyNameOf(DefinitionKind.Pipe),
          /* type */ o.INFERRED_TYPE,
          /* modifiers */[o.StmtModifier.Static],
          /* initializer */ o.importExpr(R3.definePipe).callFn([o.literalMap(
              definitionMapValues)]))],
      /* getters */[],
      /* constructorMethod */ new o.ClassMethod(null, [], []),
      /* methods */[]));
}