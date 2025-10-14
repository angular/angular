/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {MatTreeFlattener} from '@angular/material/tree';
import {PropType} from '../../../../../../protocol';
import {Observable} from 'rxjs';
import {arrayifyProps} from './arrayify-props';
export const getTreeFlattener = () =>
  new MatTreeFlattener(
    (node, level) => {
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
export const expandable = (prop) => {
  if (!prop) {
    return false;
  }
  if (!prop.expandable) {
    return false;
  }
  return !(prop.type !== PropType.Object && prop.type !== PropType.Array);
};
const getChildren = (prop) => {
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
//# sourceMappingURL=flatten.js.map
