/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertDefined, assertEqual} from '../util/assert';

import {TContainerNode, TElementContainerNode, TElementNode, TIcuContainerNode, TNode, TNodeType, TNodeTypeAsString, TProjectionNode} from './interfaces/node';

export function assertNodeType(
    tNode: TNode, type: TNodeType.Container): asserts tNode is TContainerNode;
export function assertNodeType(
    tNode: TNode, type: TNodeType.Element): asserts tNode is TElementNode;
export function assertNodeType(
    tNode: TNode, type: TNodeType.ElementContainer): asserts tNode is TElementContainerNode;
export function assertNodeType(
    tNode: TNode, type: TNodeType.IcuContainer): asserts tNode is TIcuContainerNode;
export function assertNodeType(
    tNode: TNode, type: TNodeType.Projection): asserts tNode is TProjectionNode;
export function assertNodeType(tNode: TNode, type: TNodeType): asserts tNode is TNode {
  assertDefined(tNode, 'should be called with a TNode');
  assertEqual(tNode.type, type, `should be a ${typeName(type)}`);
}

export function assertNodeOfPossibleTypes(
    tNode: TNode|null, types: TNodeType[], message?: string): void {
  assertDefined(tNode, 'should be called with a TNode');
  const found = types.some(type => tNode.type === type);
  assertEqual(
      found, true,
      message ??
          `Should be one of ${types.map(typeName).join(', ')} but got ${typeName(tNode.type)}`);
}

export function assertNodeNotOfTypes(tNode: TNode, types: TNodeType[], message?: string): void {
  assertDefined(tNode, 'should be called with a TNode');
  const found = types.some(type => tNode.type === type);
  assertEqual(
      found, false,
      message ??
          `Should not be one of ${types.map(typeName).join(', ')} but got ${typeName(tNode.type)}`);
}

function typeName(type: TNodeType): string {
  return TNodeTypeAsString[type] || '<unknown>';
}
