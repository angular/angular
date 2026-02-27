/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Descriptor} from '../../../../../../../protocol';
import {FlatNode} from '../../../../shared/object-tree-explorer/object-tree-types';

export function buildForLoopDataTree(descriptors: Descriptor[]): FlatNode[] {
  return descriptors.map((descriptor, index) =>
    createNodeFromDescriptor(index.toString(), descriptor, 0),
  );
}

function createNodeFromDescriptor(name: string, descriptor: Descriptor, level: number): FlatNode {
  return {
    expandable: descriptor.expandable,
    level,
    prop: {
      name,
      parent: null,
      descriptor: {
        ...descriptor,
        value: descriptor.expandable ? buildChildNodes(descriptor, level + 1) : [],
      },
    },
  };
}

function buildChildNodes(descriptor: Descriptor, level: number): FlatNode[] {
  const value = descriptor.value;
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return (value as Descriptor[]).map((childDescriptor, index) =>
      createNodeFromDescriptor(index.toString(), childDescriptor, level),
    );
  }

  return Object.entries(value as Record<string, Descriptor>).map(([key, childDescriptor]) =>
    createNodeFromDescriptor(key, childDescriptor, level),
  );
}
