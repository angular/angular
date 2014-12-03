var Package = require('dgeni').Package;

module.exports = function mockPackage() {

  return new Package('mockPackage', [require('../')])

  // provide a mock log service
  .factory('log', function() { return require('dgeni/lib/mocks/log')(false); });

};
