/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../output/output_ast';

import {R3DependencyMetadata, compileFactoryFunction} from './r3_factory';
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
