var Package = require('dgeni').Package;
var basePackage = require('../dgeni-package');


module.exports = new Package('angular-public', [basePackage])

.processor(require('./processors/filterPublicDocs'))

.config(function(captureClassMembers) {
  captureClassMembers.ignorePrivateMembers = true;
})

// Configure file writing
.config(function(writeFilesProcessor) {
  writeFilesProcessor.outputFolder  = 'dist/public_docs';
});