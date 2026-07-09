/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {PropType, TransferStateValue} from '../../../../../protocol';
import {FlatNode} from '../../shared/object-tree-explorer/object-tree-types';

const ROOT_NAME = '_root';
const CIRCULAR_PREVIEW = '[Circular]';

export function buildValueTree(value: TransferStateValue): FlatNode[] {
  return [createNode(ROOT_NAME, value, 0, new WeakSet())];
}

function createNode(name: string, value: unknown, level: number, seen: WeakSet<object>): FlatNode {
  const isObj = value !== null && typeof value === 'object';
  const circular = isObj && seen.has(value as object);
  const expandable = isObj && !circular;

  let children: FlatNode[] = [];
  if (expandable) {
    seen.add(value as object);
    children = buildChildren(value as object, level + 1, seen);
  }

  return {
    expandable,
    level,
    prop: {
      name,
      parent: null,
      descriptor: {
        preview: circular ? CIRCULAR_PREVIEW : getValuePreview(value),
        value: children,
        expandable,
        editable: false,
        containerType: null,
        type: getPropType(value),
      },
    },
  };
}

function buildChildren(value: object, level: number, seen: WeakSet<object>): FlatNode[] {
  if (Array.isArray(value)) {
    return value.map((item, i) => createNode(String(i), item, level, seen));
  }
  return Object.entries(value as Record<string, unknown>).map(([k, v]) =>
    createNode(k, v, level, seen),
  );
}

function getValuePreview(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (Array.isArray(value)) return `Array(${value.length})`;
  switch (typeof value) {
    case 'string':
      return `"${value}"`;
    case 'bigint':
      return `${value}n`;
    case 'object':
      return '{...}';
    default:
      return String(value);
  }
}

function getPropType(value: unknown): PropType {
  if (value === null) return PropType.Null;
  if (value === undefined) return PropType.Undefined;
  if (Array.isArray(value)) return PropType.Array;
  switch (typeof value) {
    case 'string':
      return PropType.String;
    case 'number':
      return PropType.Number;
    case 'boolean':
      return PropType.Boolean;
    case 'bigint':
      return PropType.BigInt;
    case 'symbol':
      return PropType.Symbol;
    case 'object':
      return PropType.Object;
    default:
      return PropType.Unknown;
  }
}
