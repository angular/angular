var Package = require('dgeni').Package;
var basePackage = require('../dgeni-package');

module.exports = new Package('angular-public', [basePackage])

.config(function(readTypeScriptModules) {
  readTypeScriptModules.sourceFiles = [
    'angular2/annotations.ts',
    'angular2/change_detection.ts',
    'angular2/core.ts',
    'angular2/di.ts',
    'angular2/directives.ts',
    'angular2/forms.ts',
    'angular2/router.js',
    'angular2/test.ts',
    'angular2/pipes.ts'
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
