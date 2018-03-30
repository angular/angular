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
import {BUILD_OPTIMIZER_COLOCATE, OutputMode} from './r3_types';
import {createFactory} from './r3_view_compiler';

/**
 * Write a pipe definition to the output context.
 */
export function compilePipe(
    outputCtx: OutputContext, pipe: CompilePipeMetadata, reflector: CompileReflector,
    mode: OutputMode) {
  const definitionMapValues: {key: string, quoted: boolean, value: o.Expression}[] = [];

  // e.g. `name: 'myPipe'`
  definitionMapValues.push({key: 'name', value: o.literal(pipe.name), quoted: false});

  // e.g. `type: MyPipe`
  definitionMapValues.push(
      {key: 'type', value: outputCtx.importExpr(pipe.type.reference), quoted: false});

  // e.g. factory: function MyPipe_Factory() { return new MyPipe(); },
  const templateFactory = createFactory(pipe.type, outputCtx, reflector, []);
  definitionMapValues.push({key: 'factory', value: templateFactory, quoted: false});

  // e.g. pure: true
  if (pipe.pure) {
    definitionMapValues.push({key: 'pure', value: o.literal(true), quoted: false});
  }

  const className = identifierName(pipe.type) !;
  className || error(`Cannot resolve the name of ${pipe.type}`);

  const definitionField = outputCtx.constantPool.propertyNameOf(DefinitionKind.Pipe);
  const definitionFunction =
      o.importExpr(R3.definePipe).callFn([o.literalMap(definitionMapValues)]);

  if (mode === OutputMode.PartialClass) {
    outputCtx.statements.push(new o.ClassStmt(
        /* name */ className,
        /* parent */ null,
        /* fields */[new o.ClassField(
            /* name */ definitionField,
            /* type */ o.INFERRED_TYPE,
            /* modifiers */[o.StmtModifier.Static],
            /* initializer */ definitionFunction)],
        /* getters */[],
        /* constructorMethod */ new o.ClassMethod(null, [], []),
        /* methods */[]));
  } else {
    // Create back-patch definition.
    const classReference = outputCtx.importExpr(pipe.type.reference);

    // Create the back-patch statement
    outputCtx.statements.push(
        new o.CommentStmt(BUILD_OPTIMIZER_COLOCATE),
        classReference.prop(definitionField).set(definitionFunction).toStmt());
  }
}