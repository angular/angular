/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {PropType} from '../../../../protocol';

import {getDescriptor, getKeys} from './object-utils';
import {deeplySerializeSelectedProperties} from './state-serializer';

const QUERY_1_1: any[] = [];

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
        containerType: null,
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
            containerType: null,
          },
        },
        containerType: null,
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
        containerType: null,
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
                        containerType: null,
                      },
                    },
                    containerType: null,
                  },
                ],
                containerType: null,
              },
              {
                type: PropType.Set,
                editable: false,
                expandable: false,
                preview: 'Set(2)',
                containerType: null,
              },
            ],
            containerType: null,
          },
        },
        containerType: null,
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
            containerType: null,
          },
        },
        containerType: null,
      },
    });
  });

  it('should work with getters with specified query', () => {
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
      ],
    );
    expect(result).toEqual({
      foo: {
        type: PropType.Object,
        editable: false,
        expandable: false,
        preview: '(...)',
        value: {
          baz: {
            type: PropType.Object,
            editable: false,
            expandable: true,
            preview: '{...}',
            containerType: null,
          },
        },
        containerType: null,
      },
    });
  });

  it('should work with getters without specified query', () => {
    const result = deeplySerializeSelectedProperties(
      {
        get foo(): any {
          return {
            baz: {
              qux: {
                cos: 3,
              },
            },
          };
        },
      },
      [],
    );
    expect(result).toEqual({
      foo: {
        type: PropType.Object,
        editable: false,
        expandable: false,
        preview: '(...)',
        value: {
          baz: {
            type: PropType.Object,
            editable: false,
            expandable: true,
            preview: '{...}',
            containerType: null,
          },
        },
        containerType: null,
      },
    });
  });

  it('both getters and setters should be readonly', () => {
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
      [],
    );

    // Neither getter and setter is editable
    expect(result).toEqual({
      foo: {
        type: PropType.Number,
        expandable: false,
        editable: false,
        preview: '(...)',
        value: 42,
        containerType: null,
      },
      bar: {
        type: PropType.Number,
        expandable: false,
        editable: false,
        preview: '(...)',
        value: 42,
        containerType: null,
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
      ],
    );
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
                    containerType: null,
                  },
                  bar: {
                    type: PropType.Number,
                    expandable: false,
                    editable: true,
                    preview: '2',
                    value: 2,
                    containerType: null,
                  },
                },
                containerType: null,
              },
              foo: {
                type: PropType.Number,
                expandable: false,
                editable: false,
                preview: '(...)',
                value: 42,
                containerType: null,
              },
            },
            containerType: null,
          },
        },
        containerType: null,
      },
    });
  });

  it('both setter and getter would get a (...) as preview', () => {
    const result = deeplySerializeSelectedProperties(
      {
        set foo(_: any) {},
        get bar(): Object {
          return {foo: 1};
        },
      },
      [],
    );
    expect(result).toEqual({
      foo: {
        type: PropType.Undefined,
        editable: false,
        expandable: false,
        preview: '(...)',
        containerType: null,
      },
      bar: {
        type: PropType.Object,
        editable: false,
        expandable: false,
        preview: '(...)',
        containerType: null,
        value: {
          foo: {
            type: PropType.Number,
            expandable: false,
            editable: true,
            preview: '1',
            value: 1,
            containerType: null,
          },
        },
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
        containerType: null,
      },
    });
  });

  it('getDescriptor should get the descriptors for both getters and setters correctly from the prototype', () => {
    const instance = {
      __proto__: {
        get foo(): number {
          return 42;
        },
        set bar(newNum: number) {},
        get baz(): number {
          return 42;
        },
        set baz(newNum: number) {},
      },
    };

    const descriptorFoo = getDescriptor(instance, 'foo');
    expect(descriptorFoo).not.toBeNull();
    expect(descriptorFoo!.get).not.toBeNull();
    expect(descriptorFoo!.set).toBeUndefined();
    expect(descriptorFoo!.value).toBeUndefined();
    expect(descriptorFoo!.enumerable).toBe(true);
    expect(descriptorFoo!.configurable).toBe(true);

    const descriptorBar = getDescriptor(instance, 'bar');
    expect(descriptorBar).not.toBeNull();
    expect(descriptorBar!.get).toBeUndefined();
    expect(descriptorBar!.set).not.toBeNull();
    expect(descriptorBar!.value).toBeUndefined();
    expect(descriptorBar!.enumerable).toBe(true);
    expect(descriptorBar!.configurable).toBe(true);

    const descriptorBaz = getDescriptor(instance, 'baz');
    expect(descriptorBaz).not.toBeNull();
    expect(descriptorBaz!.get).not.toBeNull();
    expect(descriptorBaz!.set).not.toBeNull();
    expect(descriptorBaz!.value).toBeUndefined();
    expect(descriptorBaz!.enumerable).toBe(true);
    expect(descriptorBaz!.configurable).toBe(true);
  });

  it('getKeys should all keys including getters and setters', () => {
    const instance = {
      baz: 2,
      __proto__: {
        get foo(): number {
          return 42;
        },
        set foo(newNum: number) {},
        set bar(newNum: number) {},
      },
    };

    expect(getKeys(instance)).toEqual(['baz', 'foo', 'bar']);
  });

  it('getKeys should not throw on empty object without prototype', () => {
    // creates an object without a prototype
    const instance = Object.create(null);

    expect(getKeys(instance)).toEqual([]);
  });

  it('getKeys would ignore getters and setters for "__proto__"', () => {
    const instance = {
      baz: 2,
      __proto__: {
        set __proto__(newObj: Object) {},
        get __proto__(): Object {
          return {};
        },
      },
    };

    expect(getKeys(instance)).toEqual(['baz']);
  });
});
