/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {SourceMap} from '@angular/compiler';
import {SourceMapConsumer} from 'source-map';

export interface SourceLocation {
  line: number | null;
  column: number | null;
  source: string | null;
}

export async function originalPositionFor(
  sourceMap: SourceMap,
  genPosition: {line: number; column: number},
): Promise<SourceLocation> {
  // Note: The `SourceMap` type from the compiler is different to `RawSourceMap`
  // from the `source-map` package, but the method we rely on works as expected.
  const smc = await new SourceMapConsumer(sourceMap as any);
  // Note: We don't return the original object as it also contains a `name` property
  // which is always null and we don't want to include that in our assertions...
  const {line, column, source} = smc.originalPositionFor(genPosition);
  return {line, column, source};
}

export function extractSourceMap(source: string): SourceMap | null {
  let idx = source.lastIndexOf('\n//#');
  if (idx == -1) return null;
  const smComment = source.slice(idx).split('\n', 2)[1].trim();
  const smB64 = smComment.split('sourceMappingURL=data:application/json;base64,')[1];
  return smB64 ? (JSON.parse(Buffer.from(smB64, 'base64').toString()) as SourceMap) : null;
}
