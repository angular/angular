var Package = require('dgeni').Package;
var jsdocPackage = require('dgeni-packages/jsdoc');
var nunjucksPackage = require('dgeni-packages/nunjucks');
var path = require('canonical-path');

// Define the dgeni package for generating the docs
module.exports = new Package('angular', [jsdocPackage, nunjucksPackage])

// Register the services and file readers
.factory(require('./services/atParser'))
.factory(require('./services/getJSDocComment'))
.factory(require('./readers/atScript'))


// Register the processors
.processor(require('./processors/generateDocsFromComments'))


// Configure the log service
.config(function(log) {
  log.level = 'debug';
})


// Configure file reading
.config(function(readFilesProcessor, atScriptFileReader) {
  readFilesProcessor.fileReaders = [atScriptFileReader];
  readFilesProcessor.basePath = path.resolve(__dirname, '..');
  readFilesProcessor.sourceFiles = [
    { module: 'di', include: 'modules/di/src/annotations.js', basePath: 'modules' }
  ];
})


// Configure file writing
.config(function(writeFilesProcessor) {
  writeFilesProcessor.outputFolder  = 'build/docs';
})


// Configure rendering
.config(function(templateFinder, templateEngine) {

  // Nunjucks and Angular conflict in their template bindings so change Nunjucks
  templateEngine.config.tags = {
    variableStart: '{$',
    variableEnd: '$}'
  };

  templateFinder.templateFolders
      .unshift(path.resolve(__dirname, 'templates'));

  templateFinder.templatePatterns = [
    '${ doc.template }',
    '${ doc.id }.${ doc.docType }.template.html',
    '${ doc.id }.template.html',
    '${ doc.docType }.template.html',
    'common.template.html'
  ];
})


// Configure ids and paths
.config(function(computeIdsProcessor, computePathsProcessor) {

  computeIdsProcessor.idTemplates.push({
    docTypes: ['module'],
    idTemplate: '${moduleTree.moduleName}',
    getAliases: function(doc) {
      // This creates aliases by pulling off each path segment in turn:
      // "a/b/c" will have aliases ["a/b/c", "b/c", "c"]
      // @rado - IS THIS WHAT WE WANT OR ARE MODULE NAMES NOT RELATIVE LIKE THIS?
      var aliases = [];
      var parts = doc.id.split('/');
      while(parts.length) {
        aliases.push(parts.join('/'));
        parts.shift();
      }
      return aliases;
    }

  });

  computePathsProcessor.pathTemplates.push({
    docTypes: ['module'],
    pathTemplate: '${id}',
    outputPathTemplate: '${id}.html'
  });
});