var factory = require('./toId');

describe('toId filter', function() {
  var filter;

  beforeEach(function() { filter = factory(); });

  it('should be called "toId"', function() { expect(filter.name).toEqual('toId'); });

  it('should convert a string to make it appropriate for use as an HTML id', function() {
    expect(filter.process('This is a big string with €bad#characters¢\nAnd even NewLines'))
        .toEqual('This-is-a-big-string-with--bad-characters--And-even-NewLines');
  });
});
