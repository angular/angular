var factory = require('./truncateFirstLine');

describe('truncateFirstLine filter', function() {
  var filter;

  beforeEach(function() { filter = factory(); });

  it('should be called "truncateFirstLine"',
     function() { expect(filter.name).toEqual('truncateFirstLine'); });

  it('should return the whole string if only one line', function() {
    expect(filter.process('this is a pretty long string that only exists on one line'))
      .toEqual('this is a pretty long string that only exists on one line');
  });

  it('should return the first line and an ellipsis if there is more than one line', function() {
    expect(filter.process('some text\n  \nmore text\n  \n')).toEqual('some text...');
  });
});