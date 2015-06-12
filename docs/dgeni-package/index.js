require('../../tools/transpiler/index.js').init();

var versionInfo = require('./versionInfo');
var Package = require('dgeni').Package;
var jsdocPackage = require('dgeni-packages/jsdoc');
var nunjucksPackage = require('dgeni-packages/nunjucks');
var linksPackage = require('../links-package');
var path = require('canonical-path');

var PARTIAL_PATH = 'partials';
var MODULES_DOCS_PATH = PARTIAL_PATH + '/modules';
var GUIDES_PATH = PARTIAL_PATH + '/guides';

// Define the dgeni package for generating the docs
module.exports = new Package('angular', [jsdocPackage, nunjucksPackage, linksPackage])

// Register the services and file readers
.factory(require('./services/modules'))
.factory(require('./services/tsParser'))
.factory(require('./services/tsParser/createCompilerHost'))
.factory(require('./services/tsParser/getFileInfo'))
.factory(require('./services/tsParser/getExportDocType'))
.factory(require('./services/tsParser/getContent'))
.factory(require('./readers/ngdoc'))

.factory('EXPORT_DOC_TYPES', function() {
  return [
    'class',
    'interface',
    'function',
    'var',
    'const',
    'enum'
  ];
})


// Register the processors
.processor(require('./processors/readTypeScriptModules'))
.processor(require('./processors/generateNavigationDoc'))
.processor(require('./processors/extractTitleFromGuides'))
.processor(require('./processors/createOverviewDump'))
.processor(require('./processors/createTypeDefinitionFile'))


// Configure the log service
.config(function(log) {
  log.level = 'warn';
})


.config(function(renderDocsProcessor) {
  renderDocsProcessor.extraData.versionInfo = versionInfo;
})

// Configure file reading
.config(function(readFilesProcessor, ngdocFileReader, readTypeScriptModules) {
  readFilesProcessor.fileReaders = [ngdocFileReader];
  readFilesProcessor.basePath = path.resolve(__dirname, '../..');
  readFilesProcessor.sourceFiles = [
    { include: 'modules/*/docs/**/*.md', basePath: 'modules' },
    { include: 'docs/content/**/*.md', basePath: 'docs/content' }
  ];

  readTypeScriptModules.sourceFiles = [
    '*/*.@(js|es6|ts)',
    '*/src/**/*.@(js|es6|ts)'
  ];
  readTypeScriptModules.basePath = 'modules';
})


.config(function(parseTagsProcessor, getInjectables) {
  parseTagsProcessor.tagDefinitions.push(require('./tag-defs/public'));
  parseTagsProcessor.tagDefinitions.push(require('./tag-defs/private'));
  parseTagsProcessor.tagDefinitions.push(require('./tag-defs/exportedAs'));

  // We actually don't want to parse param docs in this package as we are getting the data out using TS
  parseTagsProcessor.tagDefinitions.forEach(function(tagDef) {
    if (tagDef.name === 'param') {
      tagDef.ignore = true;
    }
  });

})


// Configure links
.config(function(getLinkInfo) {
  getLinkInfo.useFirstAmbiguousLink = true;
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
.config(function(computeIdsProcessor, computePathsProcessor, EXPORT_DOC_TYPES) {

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
    pathTemplate: '/${id}',
    outputPathTemplate: MODULES_DOCS_PATH + '/${id}/index.html'
  });

  computePathsProcessor.pathTemplates.push({
    docTypes: EXPORT_DOC_TYPES,
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
    pathTemplate: '/${id}',
    outputPathTemplate: GUIDES_PATH + '/${id}.html'
  });
});
