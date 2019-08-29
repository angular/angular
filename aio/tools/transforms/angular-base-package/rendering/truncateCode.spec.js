var factory = require('./truncateCode');

describe('truncateCode filter', function() {
  var filter;

  beforeEach(function() { filter = factory(); });

  it('should be called "truncateCode"',
     function() { expect(filter.name).toEqual('truncateCode'); });

  it('should return the whole string given lines is undefined', function() {
    expect(filter.process('some text\n  \nmore text\n  \n'))
      .toEqual('some text\n  \nmore text\n  \n');
  });

  it('should return the whole string if less than the given number of lines', function() {
    expect(filter.process('this is a pretty long string that only exists on one line', 1))
      .toEqual('this is a pretty long string that only exists on one line');

    expect(filter.process('this is a pretty long string\nthat exists on two lines', 2))
      .toEqual('this is a pretty long string\nthat exists on two lines');
  });

  it('should return the specified number of lines and an ellipsis if there are more lines', function() {
    expect(filter.process('some text\n  \nmore text\n  \n', 1)).toEqual('some text...');
  });

  it('should add closing brackets for all the unclosed opening brackets after truncating', function() {
    expect(filter.process('()[]{}\nsecond line', 1)).toEqual('()[]{}...');
    expect(filter.process('([]{}\nsecond line', 1)).toEqual('([]{}...)');
    expect(filter.process('()[{}\nsecond line', 1)).toEqual('()[{}...]');
    expect(filter.process('()[]{\nsecond line', 1)).toEqual('()[]{...}');
    expect(filter.process('([{\nsecond line', 1)).toEqual('([{...}])');
  });
});