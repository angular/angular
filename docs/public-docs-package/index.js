var Package = require('dgeni').Package;
var basePackage = require('../docs-package');

module.exports = new Package('angular-v2-public-docs', [basePackage])

.config(function(readTypeScriptModules) {
  readTypeScriptModules.sourceFiles = [
    'angular2/lifecycle_hooks.ts',
    'angular2/core.ts',
    'angular2/http.ts',
    'angular2/router.ts',
    'angular2/test.ts'
  ];
  readTypeScriptModules.hidePrivateMembers = true;
})

.config(function(getLinkInfo) {
  getLinkInfo.useFirstAmbiguousLink = false;
})

// Configure file writing
.config(function(writeFilesProcessor) {
  writeFilesProcessor.outputFolder  = 'dist/public_docs';
});
