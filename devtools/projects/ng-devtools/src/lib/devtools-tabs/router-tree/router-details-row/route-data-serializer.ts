/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {PropType} from '../../../../../../protocol';
import {FlatNode} from '../../../shared/object-tree-explorer/object-tree-types';

export function buildRouteDataTree(data: unknown, level = 0): FlatNode[] {
  return Array.isArray(data)
    ? buildArrayNodes(data, level)
    : buildObjectNodes(data as Record<string, unknown>, level);
}

function buildArrayNodes(items: unknown[], level: number): FlatNode[] {
  return items.map((item, index) => createNode(`[${index}]`, item, level));
}

function buildObjectNodes(obj: Record<string, unknown>, level: number): FlatNode[] {
  return Object.keys(obj).map((key) => createNode(key, obj[key], level));
}

function createNode(name: string, value: unknown, level: number): FlatNode {
  const expandable = value !== null && typeof value === 'object';

  return {
    expandable,
    level,
    prop: {
      name,
      parent: null, // Placeholder. Not required.
      descriptor: {
        preview: getValuePreview(value),
        // Values are represented by an array of FlatNodes.
        // Therefore, it's empty when it's non-expandable.
        value: expandable ? buildRouteDataTree(value, level + 1) : [],
        expandable,
        editable: false,
        containerType: null,
        type: PropType.Unknown, // Placeholder. Not required.
      },
    },
  };
}

function getValuePreview(value: unknown): string {
  const type = typeof value;

  if (type === 'string') return value as string;
  if (type === 'number' || type === 'boolean') return String(value);
  if (Array.isArray(value)) return `[${value.length}]`;
  if (type === 'object') return `{...}`;

  return String(value);
}
