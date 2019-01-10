/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertDefined, assertEqual} from './assert';
import {TNode, TNodeType} from './interfaces/node';

export function assertNodeType(tNode: TNode, type: TNodeType) {
  assertDefined(tNode, 'should be called with a TNode');
  assertEqual(tNode.type, type, `should be a ${typeName(type)}`);
}

export function assertNodeOfPossibleTypes(tNode: TNode, ...types: TNodeType[]) {
  assertDefined(tNode, 'should be called with a TNode');
  const found = types.some(type => tNode.type === type);
  assertEqual(
      found, true,
      `Should be one of ${types.map(typeName).join(', ')} but got ${typeName(tNode.type)}`);
}

function typeName(type: TNodeType): string {
  if (type == TNodeType.Projection) return 'Projection';
  if (type == TNodeType.Container) return 'Container';
  if (type == TNodeType.View) return 'View';
  if (type == TNodeType.Element) return 'Element';
  if (type == TNodeType.ElementContainer) return 'ElementContainer';
  return '<unknown>';
}
