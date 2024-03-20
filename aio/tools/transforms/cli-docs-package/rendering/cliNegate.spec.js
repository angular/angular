var factory = require('./cliNegate');

describe('cliNegate filter', function() {
  var filter;

  beforeEach(function() { filter = factory(); });

  it('should be called "cliNegate"', function() { expect(filter.name).toEqual('cliNegate'); });

  it('should make the first char uppercase and add `no` to the front', function() {
    expect(filter.process('abc')).toEqual('noAbc');
  });

  it('should make leave the rest of the chars alone', function() {
    expect(filter.process('abCdE')).toEqual('noAbCdE');
  });
});