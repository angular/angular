/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as o from '../output/output_ast';

import {R3DependencyMetadata} from './r3_factory';
import {Identifiers as R3} from './r3_identifiers';
import {R3CompiledExpression, R3Reference, typeWithParameters} from './util';

export interface R3PipeMetadata {
  /**
   * Name of the pipe type.
   */
  name: string;

  /**
   * An expression representing a reference to the pipe itself.
   */
  type: R3Reference;

  /**
   * An expression representing the pipe being compiled, intended for use within a class definition
   * itself.
   *
   * This can differ from the outer `type` if the class is being compiled by ngcc and is inside an
   * IIFE structure that uses a different name internally.
   */
  internalType: o.Expression;

  /**
   * Number of generic type parameters of the type itself.
   */
  typeArgumentCount: number;

  /**
   * Name of the pipe.
   */
  pipeName: string;

  /**
   * Dependencies of the pipe's constructor.
   */
  deps: R3DependencyMetadata[]|null;

  /**
   * Whether the pipe is marked as pure.
   */
  pure: boolean;
}

export function compilePipeFromMetadata(metadata: R3PipeMetadata): R3CompiledExpression {
  const definitionMapValues: {key: string, quoted: boolean, value: o.Expression}[] = [];

  // e.g. `name: 'myPipe'`
  definitionMapValues.push({key: 'name', value: o.literal(metadata.pipeName), quoted: false});

  // e.g. `type: MyPipe`
  definitionMapValues.push({key: 'type', value: metadata.type.value, quoted: false});

  // e.g. `pure: true`
  definitionMapValues.push({key: 'pure', value: o.literal(metadata.pure), quoted: false});

  const expression =
      o.importExpr(R3.definePipe).callFn([o.literalMap(definitionMapValues)], undefined, true);
  const type = createPipeType(metadata);

  return {expression, type, statements: []};
}

export function createPipeType(metadata: R3PipeMetadata): o.Type {
  return new o.ExpressionType(o.importExpr(R3.PipeDeclaration, [
    typeWithParameters(metadata.type.type, metadata.typeArgumentCount),
    new o.ExpressionType(new o.LiteralExpr(metadata.pipeName)),
  ]));
}
