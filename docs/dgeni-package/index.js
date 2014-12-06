var Package = require('dgeni').Package;
var jsdocPackage = require('dgeni-packages/jsdoc');
var nunjucksPackage = require('dgeni-packages/nunjucks');
var path = require('canonical-path');

var PARTIAL_PATH = 'partials';
var MODULES_DOCS_PATH = PARTIAL_PATH + '/modules';
var GUIDES_PATH = PARTIAL_PATH + '/guides';

// Define the dgeni package for generating the docs
module.exports = new Package('angular', [jsdocPackage, nunjucksPackage])

// Register the services and file readers
.factory(require('./services/atParser'))
.factory(require('./services/getJSDocComment'))
.factory(require('./services/ExportTreeVisitor'))
.factory(require('./readers/atScript'))
.factory(require('./readers/ngdoc'))


// Register the processors
.processor(require('./processors/generateDocsFromComments'))
.processor(require('./processors/processModuleDocs'))
.processor(require('./processors/processClassDocs'))
.processor(require('./processors/generateNavigationDoc'))


// Configure the log service
.config(function(log) {
  log.level = 'info';
})


// Configure file reading
.config(function(readFilesProcessor, atScriptFileReader, ngdocFileReader) {
  readFilesProcessor.fileReaders = [atScriptFileReader, ngdocFileReader];
  readFilesProcessor.basePath = path.resolve(__dirname, '../..');
  readFilesProcessor.sourceFiles = [
    { include: 'modules/*/src/**/*.js', basePath: 'modules' },
    { include: 'modules/*/docs/**/*.md', basePath: 'modules' },
    { include: 'docs/content/**/*.md', basePath: 'docs/content' }
  ];
})


// Configure file writing
.config(function(writeFilesProcessor) {
  writeFilesProcessor.outputFolder  = 'dist/docs';
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
    docTypes: [
      'class',
      'function',
      'NAMED_EXPORT',
      'VARIABLE_STATEMENT'
    ],
    idTemplate: '${moduleDoc.id}.${name}',
    getAliases: function(doc) { return [doc.id]; }
  });

  computeIdsProcessor.idTemplates.push({
    docTypes: ['member'],
    idTemplate: '${classDoc.id}.${name}',
    getAliases: function(doc) { return [doc.id]; }
  });

  computeIdsProcessor.idTemplates.push({
    docTypes: ['guide'],
    getId: function(doc) {
      return doc.fileInfo.relativePath
                    // path should be relative to `modules` folder
                    .replace(/.*\/?modules\//, '')
                    // path should not include `/docs/`
                    .replace(/\/docs\//, '/')
                    // path should not have a suffix
                    .replace(/\.\w*$/, '');
    },
    getAliases: function(doc) { return [doc.id]; }
  });


  computePathsProcessor.pathTemplates.push({
    docTypes: ['module'],
    pathTemplate: '${id}',
    outputPathTemplate: MODULES_DOCS_PATH + '/${id}/index.html'
  });

  computePathsProcessor.pathTemplates.push({
    docTypes: [
      'class',
      'function',
      'NAMED_EXPORT',
      'VARIABLE_STATEMENT'
    ],
    pathTemplate: '${moduleDoc.path}/${name}',
    outputPathTemplate: MODULES_DOCS_PATH + '/${path}/index.html'
  });

  computePathsProcessor.pathTemplates.push({
    docTypes: ['member'],
    pathTemplate: '${classDoc.path}/${name}',
    getOutputPath: function() {} // These docs are not written to their own file, instead they are part of their class doc
  });


  computePathsProcessor.pathTemplates.push({
    docTypes: ['guide'],
    pathTemplate: '${id}',
    outputPathTemplate: GUIDES_PATH + '/${id}.html'
  });
});