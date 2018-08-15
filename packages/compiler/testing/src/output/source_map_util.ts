/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SourceMap} from '@angular/compiler';
const b64 = require('base64-js');
const SourceMapConsumer = require('source-map').SourceMapConsumer;

export interface SourceLocation {
  line: number;
  column: number;
  source: string;
}

export function originalPositionFor(
    sourceMap: SourceMap, genPosition: {line: number|null, column: number|null}): SourceLocation {
  const smc = new SourceMapConsumer(sourceMap);
  // Note: We don't return the original object as it also contains a `name` property
  // which is always null and we don't want to include that in our assertions...
  const {line, column, source} = smc.originalPositionFor(genPosition);
  return {line, column, source};
}

export function extractSourceMap(source: string): SourceMap|null {
  let idx = source.lastIndexOf('\n//#');
  if (idx == -1) return null;
  const smComment = source.slice(idx).split('\n', 2)[1].trim();
  const smB64 = smComment.split('sourceMappingURL=data:application/json;base64,')[1];
  return smB64 ? JSON.parse(decodeB64String(smB64)) : null;
}

function decodeB64String(s: string): string {
  return b64.toByteArray(s).reduce((s: string, c: number) => s + String.fromCharCode(c), '');
}
