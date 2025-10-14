/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as o from '../output/output_ast';
import {Identifiers as R3} from './r3_identifiers';
import {typeWithParameters} from './util';
export function compilePipeFromMetadata(metadata) {
  const definitionMapValues = [];
  // e.g. `name: 'myPipe'`
  definitionMapValues.push({
    key: 'name',
    value: o.literal(metadata.pipeName ?? metadata.name),
    quoted: false,
  });
  // e.g. `type: MyPipe`
  definitionMapValues.push({key: 'type', value: metadata.type.value, quoted: false});
  // e.g. `pure: true`
  definitionMapValues.push({key: 'pure', value: o.literal(metadata.pure), quoted: false});
  if (metadata.isStandalone === false) {
    definitionMapValues.push({key: 'standalone', value: o.literal(false), quoted: false});
  }
  const expression = o
    .importExpr(R3.definePipe)
    .callFn([o.literalMap(definitionMapValues)], undefined, true);
  const type = createPipeType(metadata);
  return {expression, type, statements: []};
}
export function createPipeType(metadata) {
  return new o.ExpressionType(
    o.importExpr(R3.PipeDeclaration, [
      typeWithParameters(metadata.type.type, metadata.typeArgumentCount),
      new o.ExpressionType(new o.LiteralExpr(metadata.pipeName)),
      new o.ExpressionType(new o.LiteralExpr(metadata.isStandalone)),
    ]),
  );
}
//# sourceMappingURL=r3_pipe_compiler.js.map
