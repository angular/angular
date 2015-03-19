var Package = require('dgeni').Package;
var basePackage = require('../dgeni-package');


module.exports = new Package('angular-public', [basePackage])

.processor(require('./processors/filterPublicDocs'))

.config(function(parseTagsProcessor) {
  parseTagsProcessor.tagDefinitions.push({ name: 'publicModule' });
})

.config(function(processClassDocs, filterPublicDocs, EXPORT_DOC_TYPES) {
  processClassDocs.ignorePrivateMembers = true;
  filterPublicDocs.docTypes = EXPORT_DOC_TYPES;
})

// Configure file writing
.config(function(writeFilesProcessor) {
  writeFilesProcessor.outputFolder  = 'dist/public_docs';
});
