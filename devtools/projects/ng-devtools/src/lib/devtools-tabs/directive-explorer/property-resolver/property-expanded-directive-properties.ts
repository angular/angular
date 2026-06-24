/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Descriptor, NestedProp, PropType} from '../../../../../../protocol';

import {FlatNode} from './element-property-resolver';

export const getExpandedDirectiveProperties = (data: FlatNode[]): NestedProp[] => {
  const getChildren = (prop: Descriptor) => {
    if ((prop.type === PropType.Object || prop.type === PropType.Array) && prop.value) {
      return Object.entries(prop.value).map(
        ([k, v]: [string, any]): {name: number | string; children: NestedProp[]} => {
          return {
            name: prop.type === PropType.Array ? parseInt(k, 10) : k,
            children: getChildren(v),
          };
        },
      );
    }
    return [];
  };

  const getExpandedProperties = (props: {[name: string]: Descriptor}) => {
    return Object.keys(props).map((name) => {
      return {
        name,
        children: getChildren(props[name]),
      };
    });
  };

  const parents: {[name: string]: Descriptor} = {};

  for (const node of data) {
    let prop = node.prop;
    while (prop.parent) {
      prop = prop.parent;
    }
    parents[prop.name] = prop.descriptor;
  }

  return getExpandedProperties(parents);
};
