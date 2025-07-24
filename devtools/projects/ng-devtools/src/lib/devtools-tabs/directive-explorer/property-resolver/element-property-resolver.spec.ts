/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Properties, PropType} from '../../../../../../protocol';

import {IndexedNode} from '../directive-forest/index-forest';

import {ElementPropertyResolver} from './element-property-resolver';

const mockIndexedNode: IndexedNode = {
  component: {
    name: 'FooCmp',
    id: 0,
    isElement: false,
  },
  hydration: null,
  directives: [
    {
      id: 1,
      name: 'BarDir',
    },
    {
      id: 2,
      name: 'BazDir',
    },
  ],
  defer: null,
  hasNativeElement: true,
  children: [],
  element: 'foo',
  position: [0],
};

const fooNestedProperties: Properties = {
  props: {
    foo: {
      editable: false,
      expandable: true,
      preview: '{...}',
      type: PropType.Object,
      value: {
        bar: {
          editable: false,
          expandable: true,
          preview: '{...}',
          type: PropType.Object,
          value: {},
        },
        baz: {
          editable: false,
          expandable: true,
          preview: '{...}',
          type: PropType.Object,
          value: {},
        },
      },
      containerType: null,
    },
  },
};

const barNestedProps: Properties = {
  props: {
    bar: {
      editable: false,
      expandable: false,
      preview: 'undefined',
      type: PropType.Undefined,
      value: undefined,
      containerType: null,
    },
  },
};

describe('ElementPropertyResolver', () => {
  let messageBusMock: any;
  beforeEach(() => {
    messageBusMock = jasmine.createSpyObj('messageBus', ['on', 'once', 'emit', 'destroy']);
  });

  it('should register directives', () => {
    const resolver = new ElementPropertyResolver(messageBusMock);
    resolver.setProperties(mockIndexedNode, {
      FooCmp: {
        props: {},
      },
      BarDir: {
        props: {},
      },
      BazDir: {
        props: {},
      },
    });
    expect(resolver.getDirectiveController('FooCmp')).not.toBeFalsy();
    expect(resolver.getDirectiveController('BarDir')).not.toBeFalsy();
    expect(resolver.getDirectiveController('BazDir')).not.toBeFalsy();
  });

  it('should provide nested props', () => {
    const resolver = new ElementPropertyResolver(messageBusMock);
    resolver.setProperties(mockIndexedNode, {
      FooCmp: fooNestedProperties,
      BarDir: barNestedProps,
      BazDir: {
        props: {},
      },
    });
    const fooController = resolver.getDirectiveController('FooCmp');
    expect(fooController).toBeTruthy();
    const fooProps = fooController!.getExpandedProperties();
    expect(fooProps).toEqual([
      {
        name: 'foo',
        children: [
          {
            name: 'bar',
            children: [],
          },
          {
            name: 'baz',
            children: [],
          },
        ],
      },
    ]);

    const barController = resolver.getDirectiveController('BarDir');
    expect(barController).toBeTruthy();
    const barProps = barController!.getExpandedProperties();
    expect(barProps).toEqual([
      {
        name: 'bar',
        children: [],
      },
    ]);
  });
});
