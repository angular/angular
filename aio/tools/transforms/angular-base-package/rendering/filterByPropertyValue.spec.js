const factory = require('./filterByPropertyValue');

describe('filterByPropertyValue filter', () => {
  let filter;

  beforeEach(function() { filter = factory(); });

  it('should be called "filterByPropertyValue"', function() { expect(filter.name).toEqual('filterByPropertyValue'); });

  it('should filter out items that do not match the given property value', function() {
    expect(filter.process([{ a: 1 }, { a: 2 }, { b: 1 }, { a: 1, b: 2 }, { a: null }, { a: undefined }], 'a', 1))
        .toEqual([{ a: 1 }, { a: 1, b: 2 }]);
  });
});