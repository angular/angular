var Package = require('dgeni').Package;
var basePackage = require('../dgeni-package');

module.exports = new Package('angular-public', [basePackage])

// Configure file writing
.config(function(writeFilesProcessor) {
  writeFilesProcessor.outputFolder  = 'dist/public_docs';
});