/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {buildRouteDataTree} from './route-data-serializer';
import {PropType} from '../../../../../../protocol';

describe('route-data-serializer', () => {
  describe('buildRouteDataTree', () => {
    it('should serialize a flat object', () => {
      const obj = {
        foo: 'test',
        bar: 314,
        baz: null,
        qux: undefined,
        quux: Symbol('QUUX'),
        quuux: BigInt(9007199254740991),
      };

      const flatNode = buildRouteDataTree(obj);

      expect(flatNode).toEqual([
        {
          expandable: false,
          level: 0,
          prop: {
            name: 'foo',
            parent: null,
            descriptor: {
              preview: 'test',
              value: [],
              expandable: false,
              editable: false,
              containerType: null,
              type: PropType.Unknown,
            },
          },
        },
        {
          expandable: false,
          level: 0,
          prop: {
            name: 'bar',
            parent: null,
            descriptor: {
              preview: '314',
              value: [],
              expandable: false,
              editable: false,
              containerType: null,
              type: PropType.Unknown,
            },
          },
        },
        {
          expandable: false,
          level: 0,
          prop: {
            name: 'baz',
            parent: null,
            descriptor: {
              preview: 'null',
              value: [],
              expandable: false,
              editable: false,
              containerType: null,
              type: PropType.Unknown,
            },
          },
        },
        {
          expandable: false,
          level: 0,
          prop: {
            name: 'qux',
            parent: null,
            descriptor: {
              preview: 'undefined',
              value: [],
              expandable: false,
              editable: false,
              containerType: null,
              type: PropType.Unknown,
            },
          },
        },
        {
          expandable: false,
          level: 0,
          prop: {
            name: 'quux',
            parent: null,
            descriptor: {
              preview: 'Symbol(QUUX)',
              value: [],
              expandable: false,
              editable: false,
              containerType: null,
              type: PropType.Unknown,
            },
          },
        },
        {
          expandable: false,
          level: 0,
          prop: {
            name: 'quuux',
            parent: null,
            descriptor: {
              preview: '9007199254740991n',
              value: [],
              expandable: false,
              editable: false,
              containerType: null,
              type: PropType.Unknown,
            },
          },
        },
      ]);
    });

    it('should serialize a nested object', () => {
      const obj = {
        foo: 'bar',
        baz: {
          qux: 314,
          quux: [3, 1, 4],
        },
      };

      const flatNode = buildRouteDataTree(obj);

      expect(flatNode).toEqual([
        {
          expandable: false,
          level: 0,
          prop: {
            name: 'foo',
            parent: null,
            descriptor: {
              preview: 'bar',
              value: [],
              expandable: false,
              editable: false,
              containerType: null,
              type: PropType.Unknown,
            },
          },
        },
        {
          expandable: true,
          level: 0,
          prop: {
            name: 'baz',
            parent: null,
            descriptor: {
              preview: '{...}',
              expandable: true,
              editable: false,
              containerType: null,
              type: PropType.Unknown,
              value: [
                {
                  expandable: false,
                  level: 1,
                  prop: {
                    name: 'qux',
                    parent: null,
                    descriptor: {
                      preview: '314',
                      value: [],
                      expandable: false,
                      editable: false,
                      containerType: null,
                      type: PropType.Unknown,
                    },
                  },
                },
                {
                  expandable: true,
                  level: 1,
                  prop: {
                    name: 'quux',
                    parent: null,
                    descriptor: {
                      preview: 'Array(3)',
                      expandable: true,
                      editable: false,
                      containerType: null,
                      type: PropType.Unknown,
                      value: [
                        {
                          expandable: false,
                          level: 2,
                          prop: {
                            name: '0',
                            parent: null,
                            descriptor: {
                              preview: '3',
                              value: [],
                              expandable: false,
                              editable: false,
                              containerType: null,
                              type: PropType.Unknown,
                            },
                          },
                        },
                        {
                          expandable: false,
                          level: 2,
                          prop: {
                            name: '1',
                            parent: null,
                            descriptor: {
                              preview: '1',
                              value: [],
                              expandable: false,
                              editable: false,
                              containerType: null,
                              type: PropType.Unknown,
                            },
                          },
                        },
                        {
                          expandable: false,
                          level: 2,
                          prop: {
                            name: '2',
                            parent: null,
                            descriptor: {
                              preview: '4',
                              value: [],
                              expandable: false,
                              editable: false,
                              containerType: null,
                              type: PropType.Unknown,
                            },
                          },
                        },
                      ],
                    },
                  },
                },
              ],
            },
          },
        },
      ]);
    });
  });
});
