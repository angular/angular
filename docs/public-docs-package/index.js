var Package = require('dgeni').Package;
var basePackage = require('../dgeni-package');

module.exports = new Package('angular-public', [basePackage])

.config(function(readTypeScriptModules) {
  readTypeScriptModules.sourceFiles = [
    'angular2/annotations.js',
    'angular2/change_detection.ts',
    'angular2/core.js',
    'angular2/di.ts',
    'angular2/directives.js',
    'angular2/forms.js',
    'angular2/router.js',
    'angular2/test.js',
    'angular2/pipes.js'
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