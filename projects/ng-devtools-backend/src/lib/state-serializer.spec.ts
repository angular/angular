import { nestedSerializer } from './state-serializer';

const query1_1 = [];

const query1_2 = [
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
                    name: 'nested',
                  },
                ],
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

describe('nestedSerializer', () => {
  it('should work with empty queries', () => {
    const result = nestedSerializer(dir1, query1_1);
    expect(result).toEqual({
      type: 9,
      value: {
        one: {
          type: 0,
          value: 1,
          editable: true,
          expandable: false,
          preview: '1',
        },
        nested: {
          type: 9,
          editable: true,
          expandable: true,
          preview: '{...}',
        },
      },
      editable: true,
      expandable: true,
      preview: '{...}',
    });
  });

  it('should collect not specified but existing props below level', () => {
    expect(nestedSerializer(dir1, query1_2)).toEqual({
      type: 9,
      value: {
        one: {
          type: 0,
          value: 1,
          editable: true,
          expandable: false,
          preview: '1',
        },
        nested: {
          type: 9,
          editable: true,
          expandable: true,
          preview: '{...}',
          value: {
            arr: {
              type: 11,
              editable: true,
              expandable: true,
              preview: 'Array(3)',
              value: [
                {
                  type: 11,
                  editable: true,
                  expandable: true,
                  preview: 'Array(1)',
                  value: [
                    {
                      type: 9,
                      editable: true,
                      expandable: true,
                      preview: '{...}',
                      value: {},
                    },
                  ],
                },
              ],
            },
          },
        },
      },
      editable: true,
      expandable: true,
      preview: '{...}',
    });
  });

  it('should handle deletions even of the query asks for such props', () => {
    const result = nestedSerializer(dir2, [{
      name: 'one',
      children: []
    }, {
      name: 'nested',
      children: []
    }]);
    expect(result).toEqual({
      type: 9,
      value: {
        nested: {
          type: 9,
          editable: true,
          expandable: true,
          preview: '{...}',
        },
      },
      editable: true,
      expandable: true,
      preview: '{...}',
    });
  });
});
