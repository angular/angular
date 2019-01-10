const factory = require('./filterByPropertyValue');

describe('filterByPropertyValue filter', () => {
  let filter;

  beforeEach(function() { filter = factory(); });

  it('should be called "filterByPropertyValue"', function() { expect(filter.name).toEqual('filterByPropertyValue'); });

  it('should filter out items that do not match the given property string value', function() {
    expect(filter.process([{ a: 1 }, { a: 2 }, { b: 1 }, { a: 1, b: 2 }, { a: null }, { a: undefined }], 'a', 1))
        .toEqual([{ a: 1 }, { a: 1, b: 2 }]);
  });


  it('should filter out items that do not match the given property regex value', function() {
    expect(filter.process([{ a: '1' }, { a: '12' }, { b: '1' }, { a: 'a' }, { a: '1', b: '2' }, { a: null }, { a: undefined }], 'a', /\d/))
        .toEqual([{ a: '1' }, { a: '12' }, { a: '1', b: '2' }]);
  });

  it('should filter out items that do not match the given array of property regex/string values', function() {
    expect(filter.process([{ a: '1' }, { a: '12' }, { b: '1' }, { a: 'a' }, { a: '1', b: '2' }, { a: null }, { a: undefined }], 'a', [/\d/, 'a']))
        .toEqual([{ a: '1' }, { a: '12' }, { a: 'a' }, { a: '1', b: '2' }]);
  });
});