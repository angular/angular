/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PropType} from 'protocol';

import {deeplySerializeSelectedProperties} from './state-serializer';

const QUERY_1_1 = [];

const QUERY_1_2 = [
  {
    name: 'nested',
    children: [
      {
        name: 'arr',
        children: [
          {
            name: 2,
            children: [
              {
                name: 0,
                children: [
                  {
                    name: 'two',
                    children: [],
                  },
                ],
              },
            ],
          },
          {
            name: 3,
            children: [
              {
                name: 0,
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
];

const dir1 = {
  one: 1,
  nested: {
    arr: [
      {
        obj: 1,
      },
      2,
      [
        {
          two: 1,
        },
      ],
      new Set(['foo', 'bar']),
    ],
  },
};

const dir2 = {
  nested: {
    arr: [
      {
        obj: 1,
      },
      2,
      [
        {
          two: 1,
        },
      ],
    ],
  },
};

describe('deeplySerializeSelectedProperties', () => {
  it('should work with empty queries', () => {
    const result = deeplySerializeSelectedProperties(dir1, QUERY_1_1);
    expect(result).toEqual({
      one: {
        type: PropType.Number,
        expandable: false,
        editable: true,
        preview: '1',
        value: 1,
      },
      nested: {
        type: PropType.Object,
        editable: false,
        expandable: true,
        preview: '{...}',
        value: {
          arr: {
            type: PropType.Array,
            expandable: true,
            editable: false,
            preview: 'Array(4)',
          },
        },
      },
    });
  });

  it('should collect not specified but existing props below level', () => {
    const result = deeplySerializeSelectedProperties(dir1, QUERY_1_2);
    expect(result).toEqual({
      one: {
        type: PropType.Number,
        expandable: false,
        editable: true,
        preview: '1',
        value: 1,
      },
      nested: {
        type: PropType.Object,
        editable: false,
        expandable: true,
        preview: '{...}',
        value: {
          arr: {
            type: PropType.Array,
            editable: false,
            expandable: true,
            preview: 'Array(4)',
            value: [
              {
                type: PropType.Array,
                editable: false,
                expandable: true,
                preview: 'Array(1)',
                value: [
                  {
                    type: PropType.Object,
                    editable: false,
                    expandable: true,
                    preview: '{...}',
                    value: {
                      two: {
                        type: PropType.Number,
                        expandable: false,
                        editable: true,
                        preview: '1',
                        value: 1,
                      },
                    },
                  },
                ],
              },
              {
                type: PropType.Set,
                editable: false,
                expandable: false,
                preview: 'Set(2)',

              },
            ],
          },
        },
      },
    });
  });

  it('should handle deletions even of the query asks for such props', () => {
    const result = deeplySerializeSelectedProperties(dir2, [
      {
        name: 'one',
        children: [],
      },
      {
        name: 'nested',
        children: [],
      },
    ]);
    expect(result).toEqual({
      nested: {
        type: PropType.Object,
        editable: false,
        expandable: true,
        preview: '{...}',
        value: {
          arr: {
            type: PropType.Array,
            editable: false,
            expandable: true,
            preview: 'Array(3)',
          },
        },
      },
    });
  });

  it('should work with getters', () => {
    const result = deeplySerializeSelectedProperties(
        {
          get foo(): any {
            return {
              baz: {
                qux: 3,
              },
            };
          },
        },
        [
          {
            name: 'foo',
            children: [
              {
                name: 'baz',
                children: [],
              },
            ],
          },
        ]);
    expect(result).toEqual({
      foo: {
        type: PropType.Object,
        editable: false,
        expandable: true,
        preview: '{...}',
        value: {
          baz: {
            type: PropType.Object,
            editable: false,
            expandable: true,
            preview: '{...}',
          },
        },
      },
    });
  });

  it('should getters should be readonly', () => {
    const result = deeplySerializeSelectedProperties(
        {
          get foo(): number {
            return 42;
          },
          get bar(): number {
            return 42;
          },
          set bar(val: number) {},
        },
        []);
    expect(result).toEqual({
      foo: {
        type: PropType.Number,
        expandable: false,
        // Not editable because
        // we don't have a getter.
        editable: false,
        preview: '42',
        value: 42,
      },
      bar: {
        type: PropType.Number,
        expandable: false,
        editable: true,
        preview: '42',
        value: 42,
      },
    });
  });

  it('should return the precise path requested', () => {
    const result = deeplySerializeSelectedProperties(
        {
          state: {
            nested: {
              props: {
                foo: 1,
                bar: 2,
              },
              [Symbol(3)](): number {
                return 1.618;
              },
              get foo(): number {
                return 42;
              },
            },
          },
        },
        [
          {
            name: 'state',
            children: [
              {
                name: 'nested',
                children: [
                  {
                    name: 'props',
                    children: [
                      {
                        name: 'foo',
                        children: [],
                      },
                      {
                        name: 'bar',
                        children: [],
                      },
                    ],
                  },
                  {
                    name: 'foo',
                    children: [],
                  },
                ],
              },
            ],
          },
        ]);
    expect(result).toEqual({
      state: {
        type: PropType.Object,
        editable: false,
        expandable: true,
        preview: '{...}',
        value: {
          nested: {
            type: PropType.Object,
            editable: false,
            expandable: true,
            preview: '{...}',
            value: {
              props: {
                type: PropType.Object,
                editable: false,
                expandable: true,
                preview: '{...}',
                value: {
                  foo: {
                    type: PropType.Number,
                    expandable: false,
                    editable: true,
                    preview: '1',
                    value: 1,
                  },
                  bar: {
                    type: PropType.Number,
                    expandable: false,
                    editable: true,
                    preview: '2',
                    value: 2,
                  },
                },
              },
              foo: {
                type: PropType.Number,
                expandable: false,
                editable: false,
                preview: '42',
                value: 42,
              },
            },
          },
        },
      },
    });
  });

  it('should not show setters at all when associated getters or values are unavailable', () => {
    const result = deeplySerializeSelectedProperties(
        {
          set foo(_: any) {},
          get bar(): number {
            return 1;
          },
        },
        []);
    expect(result).toEqual({
      foo: {
        type: PropType.Undefined,
        editable: false,
        expandable: false,
        preview: '[setter]',
      },
      bar: {
        type: PropType.Number,
        editable: false,
        expandable: false,
        preview: '1',
        value: 1,
      },
    });
  });

  it('should preview the undefined values correctly', () => {
    const result = deeplySerializeSelectedProperties({obj: undefined}, []);
    expect(result).toEqual({
      obj: {
        type: PropType.Undefined,
        editable: true,
        expandable: false,
        preview: 'undefined',
      }
    });
  });
});
