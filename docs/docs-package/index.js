var Package = require('dgeni').Package;
var jsdocPackage = require('dgeni-packages/jsdoc');
var nunjucksPackage = require('dgeni-packages/nunjucks');
var typescriptPackage = require('../typescript-package');
var linksPackage = require('../links-package');
var gitPackage = require('dgeni-packages/git');
var path = require('canonical-path');

// Define the dgeni package for generating the docs
module.exports = new Package('angular-v2-docs', [jsdocPackage, nunjucksPackage, typescriptPackage, linksPackage, gitPackage])

// Register the services and file readers
.factory(require('./readers/ngdoc'))

// Register the processors
.processor(require('./processors/convertPrivateClassesToInterfaces'))
.processor(require('./processors/generateNavigationDoc'))
.processor(require('./processors/extractTitleFromGuides'))
.processor(require('./processors/createOverviewDump'))
.processor(require('./processors/checkUnbalancedBackTicks'))

// Configure the log service
.config(function(log) {
  log.level = 'warn';
})


.config(function(renderDocsProcessor, versionInfo) {
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
  readTypeScriptModules.basePath = path.resolve(readFilesProcessor.basePath, 'modules');
})


.config(function(parseTagsProcessor, getInjectables) {
  // We actually don't want to parse param docs in this package as we are getting the data out using TS
  parseTagsProcessor.tagDefinitions.forEach(function(tagDef) {
    if (tagDef.name === 'param') {
      tagDef.docProperty = 'paramData';
      tagDef.transforms = [];
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
.config(function(computeIdsProcessor, computePathsProcessor) {

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
    docTypes: ['guide'],
    pathTemplate: '/${id}',
    outputPathTemplate: 'partials/guides/${id}.html'
  });
});
