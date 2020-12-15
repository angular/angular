import { Properties, PropType } from 'protocol';
import { DirectivePropertyResolver } from './directive-property-resolver';

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
  },
  metadata: {
    inputs: {
      i: 'i',
    },
    outputs: {
      o: 'o',
    },
    encapsulation: 1,
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
    expect(resolver.directiveOutputControls.dataSource.data[0].prop.name).toBe('o');
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
    expect(propNames.join('')).toEqual('iop');
  });
});
