/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FlatTreeControl} from '@angular/cdk/tree';
import {PropType} from 'protocol';

import {FlatNode} from './element-property-resolver';
import {getTreeFlattener} from './flatten';
import {PropertyDataSource} from './property-data-source';

const flatTreeControl =
    new FlatTreeControl<FlatNode>((node) => node.level, (node) => node.expandable);

describe('PropertyDataSource', () => {
  it('should detect changes in the collection', () => {
    const source = new PropertyDataSource(
        {
          foo: {
            editable: true,
            expandable: false,
            preview: '42',
            type: PropType.Number,
            value: 42,
          },
        },
        getTreeFlattener(), flatTreeControl, {element: [1, 2, 3]}, null as any);

    source.update({
      foo: {
        editable: true,
        expandable: false,
        preview: '43',
        type: PropType.Number,
        value: 43,
      },
    });

    expect(source.data).toEqual([
      {
        expandable: false,
        level: 0,
        prop: {
          descriptor: {
            editable: true,
            expandable: false,
            preview: '43',
            type: PropType.Number,
            value: 43,
          },
          name: 'foo',
          parent: null,
        },
      },
    ]);
  });
});
