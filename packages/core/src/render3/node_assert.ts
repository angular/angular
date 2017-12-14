/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertEqual, assertNotEqual} from './assert';
import {LNode, LNodeFlags} from './l_node';

export function assertNodeType(node: LNode, type: LNodeFlags) {
  assertNotEqual(node, null, 'node');
  assertEqual(node.flags & LNodeFlags.TYPE_MASK, type, 'Node.type', typeSerializer);
}


function typeSerializer(type: LNodeFlags): string {
  if (type == LNodeFlags.Projection) return 'Projection';
  if (type == LNodeFlags.Container) return 'Container';
  if (type == LNodeFlags.View) return 'View';
  if (type == LNodeFlags.Element) return 'Element';
  return '??? ' + type + ' ???';
}
