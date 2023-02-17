/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Properties, PropType} from 'protocol';

import {DirectivePropertyResolver} from './directive-property-resolver';

const properties: Properties = {
  props: {
    o: {
      editable: false,
      expandable: true,
      preview: '',
      type: PropType.Object,
      value: {
        a1: {
          editable: false,
          expandable: false,
          preview: '',
          type: 1,
          value: {},
        },
        b1: {
          editable: false,
          expandable: false,
          preview: '',
          type: 1,
          value: {},
        },
      },
    },
    i: {
      editable: false,
      expandable: true,
      preview: '',
      type: PropType.Object,
      value: {
        b1: {
          editable: false,
          expandable: false,
          preview: '',
          type: 1,
          value: {},
        },
        a1: {
          editable: false,
          expandable: false,
          preview: '',
          type: 1,
          value: {},
        },
      },
    },
    p: {
      editable: false,
      expandable: true,
      preview: '',
      type: PropType.Object,
      value: {
        b1: {
          editable: false,
          expandable: false,
          preview: '',
          type: 1,
          value: {},
        },
        a1: {
          editable: false,
          expandable: false,
          preview: '',
          type: 1,
          value: {},
        },
      },
    },
    i_1: {
      editable: true,
      expandable: false,
      preview: 'input i1',
      type: PropType.String,
      value: 'input i1',
    },
    o_1: {
      editable: false,
      expandable: true,
      preview: '',
      type: PropType.Object,
    },
  },
  metadata: {
    inputs: {
      i: 'i',
      i1: 'i_1',
    },
    outputs: {
      o: 'o',
      o1: 'o_1',
    },
    encapsulation: 0,
    onPush: false,
  },
};

describe('DirectivePropertyResolver', () => {
  let messageBusMock: any;
  beforeEach(() => {
    messageBusMock = jasmine.createSpyObj('messageBus', ['on', 'once', 'emit', 'destroy']);
  });

  it('should register directive inputs, outputs, and state', () => {
    const resolver = new DirectivePropertyResolver(messageBusMock, properties, {
      element: [0],
      directive: 0,
    });
    expect(resolver.directiveInputControls.dataSource.data[0].prop.name).toBe('i');
    expect(resolver.directiveInputControls.dataSource.data[1].prop.name).toBe('a1');
    expect(resolver.directiveInputControls.dataSource.data[2].prop.name).toBe('b1');
    expect(resolver.directiveInputControls.dataSource.data[3].prop.name).toBe('i_1');
    expect(resolver.directiveOutputControls.dataSource.data[0].prop.name).toBe('o');
    expect(resolver.directiveOutputControls.dataSource.data[1].prop.name).toBe('a1');
    expect(resolver.directiveOutputControls.dataSource.data[2].prop.name).toBe('b1');
    expect(resolver.directiveOutputControls.dataSource.data[3].prop.name).toBe('o_1');
    expect(resolver.directiveStateControls.dataSource.data[0].prop.name).toBe('p');
  });

  it('should sort properties', () => {
    const resolver = new DirectivePropertyResolver(messageBusMock, properties, {
      element: [0],
      directive: 0,
    });
    const props = resolver.getExpandedProperties();
    const propNames = props.map((o) => o.name);
    // First level properties should be now sorted
    expect(propNames.join('')).toEqual('ii_1oo_1p');
  });
});
