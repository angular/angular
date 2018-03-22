/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertEqual, assertNotNull} from './assert';
import {LNode, LNodeType} from './interfaces/node';

export function assertNodeType(node: LNode, type: LNodeType) {
  assertNotNull(node, 'should be called with a node');
  assertEqual(node.type, type, `should be a ${typeName(type)}`);
}

export function assertNodeOfPossibleTypes(node: LNode, ...types: LNodeType[]) {
  assertNotNull(node, 'should be called with a node');
  const found = types.some(type => node.type === type);
  assertEqual(found, true, `Should be one of ${types.map(typeName).join(', ')}`);
}

function typeName(type: LNodeType): string {
  if (type == LNodeType.Projection) return 'Projection';
  if (type == LNodeType.Container) return 'Container';
  if (type == LNodeType.View) return 'View';
  if (type == LNodeType.Element) return 'Element';
  return '<unknown>';
}
