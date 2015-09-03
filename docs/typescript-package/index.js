var basePackage = require('dgeni-packages/base');
var Package = require('dgeni').Package;
var path = require('canonical-path');

// Define the dgeni package for generating the docs
module.exports = new Package('typescript-parsing', [basePackage])

// Register the services and file readers
.factory(require('./services/modules'))
.factory(require('./services/tsParser'))
.factory(require('./services/tsParser/createCompilerHost'))
.factory(require('./services/tsParser/getFileInfo'))
.factory(require('./services/tsParser/getExportDocType'))
.factory(require('./services/tsParser/getContent'))

.factory(require('./services/convertPrivateClassesToInterfaces'))

.factory('EXPORT_DOC_TYPES', function() {
  return [
    'class',
    'interface',
    'function',
    'var',
    'const',
    'enum',
    'type-alias'
  ];
})


// Register the processors
.processor(require('./processors/readTypeScriptModules'))


// Configure the log service
.config(function(log) {
  log.level = 'warn';
})


// Configure ids and paths
.config(function(computeIdsProcessor, computePathsProcessor, EXPORT_DOC_TYPES) {

  computeIdsProcessor.idTemplates.push({
    docTypes: ['member'],
    idTemplate: '${classDoc.id}.${name}',
    getAliases: function(doc) { return [doc.id]; }
  });

  computePathsProcessor.pathTemplates.push({
    docTypes: ['member'],
    pathTemplate: '${classDoc.path}/${name}',
    getOutputPath: function() {} // These docs are not written to their own file, instead they are part of their class doc
  });

  var MODULES_DOCS_PATH = 'partials/modules';

  computePathsProcessor.pathTemplates.push({
    docTypes: ['module'],
    pathTemplate: '/${id}',
    outputPathTemplate: MODULES_DOCS_PATH + '/${id}/index.html'
  });

  computePathsProcessor.pathTemplates.push({
    docTypes: EXPORT_DOC_TYPES,
    pathTemplate: '${moduleDoc.path}/${name}',
    outputPathTemplate: MODULES_DOCS_PATH + '/${path}/index.html'
  });

});
