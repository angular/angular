const factory = require('./hasValues');

describe('hasValues filter', () => {
  let filter;

  beforeEach(function() { filter = factory(); });

  it('should be called "hasValues"', function() { expect(filter.name).toEqual('hasValues'); });

  it('should return true if the specified property is truthy on any item in the list', function() {
    expect(filter.process([], 'a')).toEqual(false);
    expect(filter.process(0), 'a').toEqual(false);
    expect(filter.process({}, 'a')).toEqual(false);
    expect(filter.process([{a: 1}], 'a')).toEqual(true);
    expect(filter.process([{b: 2}], 'a')).toEqual(false);
    expect(filter.process([{a: 1, b: 2}], 'a')).toEqual(true);
    expect(filter.process([{b: 2}, {a: 1}], 'a')).toEqual(true);
  });
});