/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {StaticSymbol} from '../aot/static_symbol';
import * as o from '../output/output_ast';
import {OutputContext, error, valueCollectOthers} from '../util';

export function collectStaticSymbols(value: any): StaticSymbol[] {
  return valueCollectOthers(value, v => v instanceof StaticSymbol);
}

export function isPrimitive(o: any): boolean {
  return o === null || (typeof o !== 'function' && typeof o !== 'object');
}

export function convertMetadataToOutput(meta: any, ctx: OutputContext): o.Expression {
  const emitted = new Set<any>();
  function convert(meta: any) {
    if (Array.isArray(meta)) {
      return o.literalArr(meta.map(entry => convertMetadataToOutput(entry, ctx)), o.INFERRED_TYPE);
    } else if (meta instanceof StaticSymbol) {
      return ctx.importExpr(meta);
    } else if (meta == null || isPrimitive(meta)) {
      return o.literal(meta, o.INFERRED_TYPE);
    } else {
      if (meta['__symbolic'] || typeof meta === 'function') {
        error(`Unsupported or unknown metadata: ${meta}`);
      }
      if (emitted.has(meta)) {
        error('Unsupported recursive data');
      }
      emitted.add(meta);
      try {
        return o.literalMap(Object.keys(meta).map(
            key => ({key, quoted: false, value: convertMetadataToOutput(meta[key], ctx)})));
      } finally {
        // Supports multi-references to the same object  but not recursive data structures.
        emitted.delete(meta);
      }
    }
  }
  return convert(meta);
}
