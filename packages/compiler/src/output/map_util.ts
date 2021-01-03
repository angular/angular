/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from './output_ast';

export type MapEntry = {
  key: string,
  quoted: boolean,
  value: o.Expression
};

export type MapLiteral = MapEntry[];

export function mapEntry(key: string, value: o.Expression): MapEntry {
  return {key, value, quoted: false};
}

export function mapLiteral(
    obj: {[key: string]: o.Expression}, quoted: boolean = false): o.Expression {
  return o.literalMap(Object.keys(obj).map(key => ({
                                             key,
                                             quoted,
                                             value: obj[key],
                                           })));
}
