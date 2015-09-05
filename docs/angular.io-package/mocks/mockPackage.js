var Package = require('dgeni').Package;

module.exports = function mockPackage() {

  return new Package('mockPackage', [require('../')])

  .factory('log', function() { return require('dgeni/lib/mocks/log')(false); })
};
