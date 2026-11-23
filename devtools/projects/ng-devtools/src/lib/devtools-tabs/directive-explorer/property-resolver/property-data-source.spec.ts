/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {FlatTreeControl} from '@angular/cdk/tree';
import {Descriptor, PropType} from '../../../../../../protocol';

import {getTreeFlattener} from './flatten';
import {PropertyDataSource} from './property-data-source';
import {FlatNode} from '../../../shared/object-tree-explorer/object-tree-types';

const flatTreeControl = new FlatTreeControl<FlatNode>(
  (node) => node.level,
  (node) => node.expandable,
);

function primitive(type: PropType, preview: string, value: unknown): Descriptor {
  return {editable: true, expandable: false, preview, type, value, containerType: null};
}

function createSource() {
  return new PropertyDataSource(
    {
      foo: primitive(PropType.Number, '1', 1),
      bar: primitive(PropType.String, 'signal', 'signal'),
      baz: {
        editable: false,
        expandable: true,
        preview: '{...}',
        type: PropType.Object,
        value: {
          qux: primitive(PropType.Number, '2', 2),
        },
        containerType: null,
      },
      quux: primitive(PropType.String, 'WritableSignal', 'WritableSignal'),
    },
    getTreeFlattener(),
    flatTreeControl,
    {element: [1, 2, 3]},
    null as any,
  );
}

const names = (source: PropertyDataSource) => source.data.map((node) => node.prop.name);

describe('PropertyDataSource', () => {
  it('should detect changes in the collection', () => {
    const source = new PropertyDataSource(
      {
        foo: primitive(PropType.Number, '42', 42),
      },
      getTreeFlattener(),
      flatTreeControl,
      {element: [1, 2, 3]},
      null as any,
    );

    source.update({
      foo: primitive(PropType.Number, '43', 43),
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
            containerType: null,
          },
          name: 'foo',
          parent: null,
        },
      },
    ]);
  });

  describe('filter', () => {
    it('should filter by property name (case-insensitive)', () => {
      const source = createSource();

      source.filter('FOO', 0);

      expect(names(source)).toEqual(['foo']);
    });

    it('should filter by value preview (case-insensitive)', () => {
      const source = createSource();

      source.filter('signal', 0);

      expect(names(source)).toEqual(['bar', 'quux']);
    });

    it('should only match nodes on the provided level', () => {
      const source = createSource();

      source.filter('qux', 0);
      expect(names(source)).toEqual([]);

      source.filter('qux', 1);
      expect(names(source)).toEqual(['qux']);
    });

    it('should apply each filter to the non-filtered data', () => {
      const source = createSource();

      source.filter('foo', 0);
      expect(names(source)).toEqual(['foo']);

      source.filter('bar', 0);
      expect(names(source)).toEqual(['bar']);
    });

    it('should restore the non-filtered data when the filter is cleared', () => {
      const source = createSource();
      const original = structuredClone(source.data);

      source.filter('foo', 0);
      source.filter('', 0);

      expect(source.data).toEqual(original);
    });
  });
});
