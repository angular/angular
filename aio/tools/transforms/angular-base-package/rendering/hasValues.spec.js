const factory = require('./hasValues');

describe('hasValues filter', () => {
  let filter;

  beforeEach(function() { filter = factory(); });

  it('should be called "hasValues"', function() { expect(filter.name).toEqual('hasValues'); });

  it('should return true if the specified property path is truthy on any item in the list', function() {
    expect(filter.process([{a: 1}], 'a')).toEqual(true);
    expect(filter.process([{a: 1, b: 2}], 'a')).toEqual(true);
    expect(filter.process([{b: 2}, {a: 1}], 'a')).toEqual(true);

    expect(filter.process([{a:{b:1}}], 'a.b')).toEqual(true);
    expect(filter.process([{a:{b:1}, b: 2}], 'a.b')).toEqual(true);
    expect(filter.process([{b: 2}, {a:{b:1}}], 'a.b')).toEqual(true);
  });

  it('should return false if the value is not an object', () => {
    expect(filter.process([], 'a')).toEqual(false);
    expect(filter.process(0, 'a')).toEqual(false);
    expect(filter.process([], 'a.b')).toEqual(false);
    expect(filter.process(0, 'a.b')).toEqual(false);
  });

  it('should return false if the property exists but is falsy', () => {
    expect(filter.process([{a: false}], 'a')).toEqual(false);
    expect(filter.process([{a: ''}], 'a')).toEqual(false);
    expect(filter.process([{a: 0}], 'a')).toEqual(false);
    expect(filter.process([{a: null}], 'a')).toEqual(false);
    expect(filter.process([{a: undefined}], 'a')).toEqual(false);
  });

  it('should return false if any of the properties in the path do not exist', () => {
    expect(filter.process({}, 'a')).toEqual(false);
    expect(filter.process({}, 'a.b')).toEqual(false);

    expect(filter.process([{b: 2}], 'a')).toEqual(false);
    expect(filter.process([{a: 2}], 'a.b')).toEqual(false);
    expect(filter.process([{a: {}}], 'a.b.c')).toEqual(false);
  });
});