/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {MatTreeFlattener} from '@angular/material/tree';
import {Descriptor, PropType} from '../../../../../../protocol';
import {Observable} from 'rxjs';

import {arrayifyProps} from './arrayify-props';
import {FlatNode, Property} from './element-property-resolver';

export const getTreeFlattener = () =>
  new MatTreeFlattener(
    (node: Property, level: number): FlatNode => {
      return {
        expandable: expandable(node.descriptor),
        prop: node,
        level,
      };
    },
    (node) => node.level,
    (node) => node.expandable,
    (node) => getChildren(node),
  );

export const expandable = (prop: Descriptor) => {
  if (!prop) {
    return false;
  }
  if (!prop.expandable) {
    return false;
  }
  return !(prop.type !== PropType.Object && prop.type !== PropType.Array);
};

const getChildren = (prop: Property): Property[] | undefined => {
  const descriptor = prop.descriptor;
  if (
    (descriptor.type === PropType.Object || descriptor.type === PropType.Array) &&
    !(descriptor.value instanceof Observable)
  ) {
    return arrayifyProps(descriptor.value || {}, prop);
  }
  console.error('Unexpected data type', descriptor, 'in property', prop);
  return;
};
