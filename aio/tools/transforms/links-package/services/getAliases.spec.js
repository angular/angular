var getAliasesFactory = require('./getAliases');

describe('getAliases', function() {

  it('should extract all the parts from a code name', function() {

    var getAliases = getAliasesFactory();

    expect(getAliases({id: 'module:ng.service:$http#get'})).toEqual([
      '$http#get', 'service:$http#get', 'ng.$http#get', 'module:ng.$http#get',
      'ng.service:$http#get', 'module:ng.service:$http#get', 'get'
    ]);
  });
});
