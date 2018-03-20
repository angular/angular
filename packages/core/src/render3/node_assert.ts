/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertEqual, assertNotNull} from './assert';
import {LNode, LNodeFlags} from './interfaces/node';

export function assertNodeType(node: LNode, type: LNodeFlags) {
  assertNotNull(node, 'should be called with a node');
  assertEqual(node.flags & LNodeFlags.TYPE_MASK, type, `should be a ${typeName(type)}`);
}

export function assertNodeOfPossibleTypes(node: LNode, ...types: LNodeFlags[]) {
  assertNotNull(node, 'should be called with a node');
  const nodeType = node.flags & LNodeFlags.TYPE_MASK;
  const found = types.some(type => nodeType === type);
  assertEqual(found, true, `Should be one of ${types.map(typeName).join(', ')}`);
}

function typeName(type: LNodeFlags): string {
  if (type == LNodeFlags.Projection) return 'Projection';
  if (type == LNodeFlags.Container) return 'Container';
  if (type == LNodeFlags.View) return 'View';
  if (type == LNodeFlags.Element) return 'Element';
  return '<unknown>';
}
